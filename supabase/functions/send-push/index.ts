// 앱 푸시 발송 — readme/todo/push-notification-plan.md
//
// 호출자: DB(pg_net) — notifications insert 직후 kick_send_push 트리거, 5분 재시도 크론.
// 대기(pending) 알림을 claim_pending_notifications()로 "처리 중"으로 바꾸며 가져가
// 사용자 기기 토큰들로 Expo Push API에 보내고 결과를 기록한다.
//
// 보안 규칙
// - apikey 헤더가 이 프로젝트의 secret 키여야 한다 (verify_jwt=false — supabase/config.toml)
// - 요청 body는 쓰지 않는다 (무엇을 보낼지는 DB의 대기열만 보고 정함)
import { createClient } from "npm:@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const EXPO_BATCH = 100; // Expo 한 요청 최대 메시지 수
const MAX_ATTEMPTS = 3;

interface Claimed {
  id: string;
  user_id: string;
  title: string;
  body: string;
  url: string | null;
  attempts: number;
}

interface ExpoTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
}

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const getSecretKeys = (): string[] => {
  try {
    return Object.values(
      JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}"),
    ) as string[];
  } catch {
    return [];
  }
};

Deno.serve(async (req) => {
  const apiKey = req.headers.get("apikey");
  if (!apiKey || !getSecretKeys().includes(apiKey)) {
    return json({ error: "unauthorized" }, 401);
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, apiKey);

  const { data: claimed, error: claimError } = await supabase.rpc(
    "claim_pending_notifications",
    { p_limit: 100 },
  );
  if (claimError) return json({ error: claimError.message }, 500);
  const items = (claimed ?? []) as Claimed[];
  if (items.length === 0) return json({ claimed: 0 }, 200);

  const userIds = [...new Set(items.map((n) => n.user_id))];
  const { data: tokenRows, error: tokenError } = await supabase
    .from("push_tokens")
    .select("user_id, token")
    .in("user_id", userIds);
  if (tokenError) {
    // 토큰 조회 실패 → 다음 재시도로 넘김
    await supabase
      .from("notifications")
      .update({ push_status: "pending", error: tokenError.message })
      .in("id", items.map((n) => n.id));
    return json({ error: tokenError.message }, 500);
  }

  const tokensByUser = new Map<string, string[]>();
  for (const row of tokenRows ?? []) {
    tokensByUser.set(row.user_id, [...(tokensByUser.get(row.user_id) ?? []), row.token]);
  }

  // 메시지 1개 = (알림, 토큰) 한 쌍
  const messages: { notificationId: string; token: string; payload: unknown }[] = [];
  const noDevice: string[] = [];
  for (const n of items) {
    const tokens = tokensByUser.get(n.user_id) ?? [];
    if (tokens.length === 0) {
      noDevice.push(n.id);
      continue;
    }
    for (const token of tokens) {
      messages.push({
        notificationId: n.id,
        token,
        payload: {
          to: token,
          title: n.title,
          body: n.body,
          sound: "default",
          data: { url: n.url, notificationId: n.id },
        },
      });
    }
  }

  if (noDevice.length > 0) {
    await supabase
      .from("notifications")
      .update({ push_status: "no_device" })
      .in("id", noDevice);
  }

  // 알림별 결과 집계: 하나라도 ok면 sent
  const okIds = new Set<string>();
  const errors = new Map<string, string>();
  const deadTokens = new Set<string>();

  for (let i = 0; i < messages.length; i += EXPO_BATCH) {
    const batch = messages.slice(i, i + EXPO_BATCH);
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(batch.map((m) => m.payload)),
      });
      const result = await res.json();
      const tickets: ExpoTicket[] = Array.isArray(result?.data) ? result.data : [];
      if (!res.ok || tickets.length !== batch.length) {
        const msg = `expo ${res.status}: ${JSON.stringify(result?.errors ?? result).slice(0, 300)}`;
        batch.forEach((m) => errors.set(m.notificationId, msg));
        continue;
      }
      tickets.forEach((t, idx) => {
        const m = batch[idx];
        if (t.status === "ok") {
          okIds.add(m.notificationId);
        } else {
          if (t.details?.error === "DeviceNotRegistered") deadTokens.add(m.token);
          errors.set(m.notificationId, `${t.details?.error ?? "error"}: ${t.message ?? ""}`.slice(0, 300));
        }
      });
    } catch (e) {
      batch.forEach((m) => errors.set(m.notificationId, `fetch failed: ${String(e)}`.slice(0, 300)));
    }
  }

  // 결과 기록
  const sentAt = new Date().toISOString();
  if (okIds.size > 0) {
    await supabase
      .from("notifications")
      .update({ push_status: "sent", sent_at: sentAt, error: null })
      .in("id", [...okIds]);
  }

  const attemptsById = new Map(items.map((n) => [n.id, n.attempts]));
  for (const [id, msg] of errors) {
    if (okIds.has(id)) continue;
    // 기기가 모두 해지된 경우는 재시도해도 소용없음 → no_device
    const allDead = messages
      .filter((m) => m.notificationId === id)
      .every((m) => deadTokens.has(m.token));
    const status = allDead
      ? "no_device"
      : (attemptsById.get(id) ?? 0) >= MAX_ATTEMPTS
        ? "failed"
        : "pending"; // 5분 크론이 다시 보낸다
    await supabase
      .from("notifications")
      .update({ push_status: status, error: msg })
      .eq("id", id);
  }

  if (deadTokens.size > 0) {
    await supabase.from("push_tokens").delete().in("token", [...deadTokens]);
  }

  return json(
    {
      claimed: items.length,
      sent: okIds.size,
      noDevice: noDevice.length,
      errors: errors.size,
      removedTokens: deadTokens.size,
    },
    200,
  );
});
