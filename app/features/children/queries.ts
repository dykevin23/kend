import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

type Client = SupabaseClient<Database>;

/**
 * 사용자의 자녀 목록 조회
 */
export const getChildren = async (client: Client, userId: string) => {
  const { data, error } = await client
    .from("children")
    .select("*")
    .eq("user_id", userId)
    .order("code", { ascending: true });

  if (error) throw error;

  return data.map((child) => ({
    id: child.id,
    code: child.code,
    nickname: child.nickname,
    name: child.name,
    gender: child.gender,
    birthDate: child.birth_date,
    profileImageUrl: child.profile_image_url,
    createdAt: child.created_at,
  }));
};

export type Child = Awaited<ReturnType<typeof getChildren>>[number];

/**
 * 자녀 상세 조회 (code로 조회)
 */
export const getChildByCode = async (
  client: Client,
  userId: string,
  code: number
) => {
  const { data, error } = await client
    .from("children")
    .select("*")
    .eq("user_id", userId)
    .eq("code", code)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return {
    id: data.id,
    code: data.code,
    userId: data.user_id,
    nickname: data.nickname,
    name: data.name,
    gender: data.gender,
    birthDate: data.birth_date,
    profileImageUrl: data.profile_image_url,
    createdAt: data.created_at,
  };
};

export type ChildDetail = Awaited<ReturnType<typeof getChildByCode>>;

/**
 * 자녀의 성장 기록 전체 조회 (최신순)
 */
export const getGrowthRecords = async (client: Client, childId: string) => {
  const { data, error } = await client
    .from("growth_records")
    .select("*")
    .eq("child_id", childId)
    .order("measured_at", { ascending: false });

  if (error) throw error;

  return data.map((record) => ({
    id: record.id,
    childId: record.child_id,
    measuredAt: record.measured_at,
    height: record.height ? Number(record.height) : null,
    weight: record.weight ? Number(record.weight) : null,
    footSize: record.foot_size ? Number(record.foot_size) : null,
    headCircumference: record.head_circumference
      ? Number(record.head_circumference)
      : null,
    createdAt: record.created_at,
  }));
};

export type GrowthRecord = Awaited<ReturnType<typeof getGrowthRecords>>[number];

/**
 * 자녀의 최신 성장 기록 조회
 */
export const getLatestGrowthRecord = async (client: Client, childId: string) => {
  const { data, error } = await client
    .from("growth_records")
    .select("*")
    .eq("child_id", childId)
    .order("measured_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return {
    id: data.id,
    childId: data.child_id,
    measuredAt: data.measured_at,
    height: data.height ? Number(data.height) : null,
    weight: data.weight ? Number(data.weight) : null,
    footSize: data.foot_size ? Number(data.foot_size) : null,
    headCircumference: data.head_circumference
      ? Number(data.head_circumference)
      : null,
    createdAt: data.created_at,
  };
};

/**
 * 특정 측정 타입의 성장 기록 조회 (그래프용, 날짜순)
 */
export const getGrowthRecordsByType = async (
  client: Client,
  childId: string,
  type: "height" | "weight" | "foot_size" | "head_circumference"
) => {
  const { data, error } = await client
    .from("growth_records")
    .select("id, measured_at, height, weight, foot_size, head_circumference")
    .eq("child_id", childId)
    .not(type, "is", null)
    .order("measured_at", { ascending: true });

  if (error) throw error;

  return data.map((record) => ({
    id: record.id,
    measuredAt: record.measured_at,
    value: record[type] ? Number(record[type]) : null,
  }));
};

export type GrowthRecordByType = Awaited<
  ReturnType<typeof getGrowthRecordsByType>
>[number];

/**
 * 사용자의 첫 번째 자녀 code 조회 (리다이렉트용)
 */
export const getFirstChildCode = async (client: Client, userId: string) => {
  const { data, error } = await client
    .from("children")
    .select("code")
    .eq("user_id", userId)
    .order("code", { ascending: true })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data.code;
};

/**
 * 자녀의 측정 타입별 백분위 이력 조회
 * 동일 월령·성별 전체 Kend 사용자 데이터와 비교
 * (Supabase RPC: get_growth_percentile_history)
 */
export const getGrowthPercentileHistory = async (
  client: Client,
  childId: string,
  type: "height" | "weight" | "head_circumference"
) => {
  const { data, error } = await client.rpc("get_growth_percentile_history", {
    p_child_id: childId,
    p_type: type,
  });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    measuredAt: row.measured_at,
    ageMonths: row.age_months,
    value: Number(row.value),
    percentile: Number(row.percentile),
  }));
};

export type GrowthPercentilePoint = Awaited<
  ReturnType<typeof getGrowthPercentileHistory>
>[number];

/**
 * 사용자의 다음 자녀 code 조회 (자녀 생성 시 사용)
 */
export const getNextChildCode = async (client: Client, userId: string) => {
  const { data, error } = await client
    .from("children")
    .select("code")
    .eq("user_id", userId)
    .order("code", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // 자녀가 없으면 1 반환
    if (error.code === "PGRST116") return 1;
    throw error;
  }

  return data.code + 1;
};
