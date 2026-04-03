/**
 * 공통 에러 핸들러
 *
 * Supabase/PostgreSQL 에러를 사용자 친화적 메시지로 변환하고,
 * action에서 일관된 에러 응답을 반환하기 위한 유틸리티.
 *
 * 사용법:
 *   action에서 — catch (error) { return actionErrorResponse(error) }
 *   mutation에서 — parseSupabaseError(error) 로 직접 변환
 */

// ─── 타입 ────────────────────────────────────────────

export interface AppError {
  code: string;
  message: string;
  originalError?: unknown;
}

// ─── Supabase / PostgreSQL 에러 파싱 ─────────────────

/**
 * Supabase 또는 PostgreSQL 에러를 AppError로 변환한다.
 * - PostgreSQL constraint 에러코드 (23xxx)
 * - PostgREST 에러코드 (PGRSTxxx)
 * - Supabase Auth 에러
 * - Storage 에러
 */
export function parseSupabaseError(error: unknown): AppError {
  if (!error || typeof error !== "object") {
    return { code: "UNKNOWN", message: "알 수 없는 오류가 발생했어요." };
  }

  const err = error as Record<string, unknown>;

  // Error 인스턴스 (mutation에서 throw new Error() 한 경우)
  if (error instanceof Error) {
    return parseErrorMessage(error.message, error);
  }

  // Supabase 에러 객체 ({ code, message, details })
  if ("code" in err) {
    return parseErrorCode(String(err.code), err);
  }

  // Supabase Storage 에러 ({ statusCode, error, message })
  if ("statusCode" in err) {
    return parseStorageError(err);
  }

  return { code: "UNKNOWN", message: "알 수 없는 오류가 발생했어요." };
}

// ─── action 에러 응답 ────────────────────────────────

/**
 * action의 catch 블록에서 사용하는 래퍼.
 * 기존 action 응답 포맷 { success: false, error: string }과 호환.
 */
export function actionErrorResponse(error: unknown, fallbackMessage?: string) {
  const appError = parseSupabaseError(error);
  console.error(`[ActionError] ${appError.code}:`, appError.originalError ?? error);
  return {
    success: false as const,
    error: fallbackMessage ?? appError.message,
  };
}

// ─── 인증 에러 판별 ──────────────────────────────────

const AUTH_ERROR_CODES = new Set([
  "AUTH_EXPIRED",
  "AUTH_REQUIRED",
  "AUTH_FAILED",
  "DUPLICATE_USER",
  "WEAK_PASSWORD",
]);

/**
 * 인증 관련 에러인지 판별한다.
 * loader/action에서 인증 에러 시 로그인 redirect 분기에 사용.
 */
export function isAuthError(error: unknown): boolean {
  const appError = parseSupabaseError(error);
  return AUTH_ERROR_CODES.has(appError.code);
}

/**
 * 세션 만료 에러인지 판별한다 (재로그인 필요).
 */
export function isSessionExpiredError(error: unknown): boolean {
  const appError = parseSupabaseError(error);
  return appError.code === "AUTH_EXPIRED" || appError.code === "AUTH_REQUIRED";
}

// ─── 내부 파싱 함수 ──────────────────────────────────

function parseErrorCode(
  code: string,
  original: unknown
): AppError {
  // PostgreSQL constraint 에러
  switch (code) {
    case "23505":
      return { code: "DUPLICATE", message: "이미 존재하는 데이터예요.", originalError: original };
    case "23503":
      return { code: "REFERENCE", message: "연결된 데이터가 없어요.", originalError: original };
    case "23502":
      return { code: "NOT_NULL", message: "필수 입력값이 누락됐어요.", originalError: original };
    case "23514":
      return { code: "CHECK_VIOLATION", message: "입력값이 허용 범위를 벗어났어요.", originalError: original };
  }

  // PostgREST 에러
  switch (code) {
    case "PGRST116":
      return { code: "NOT_FOUND", message: "데이터를 찾을 수 없어요.", originalError: original };
    case "PGRST301":
      return { code: "AUTH_REQUIRED", message: "로그인이 필요해요.", originalError: original };
  }

  // RLS 위반
  if (code === "42501") {
    return { code: "RLS_VIOLATION", message: "접근 권한이 없어요.", originalError: original };
  }

  // Auth 에러
  if (code === "invalid_credentials" || code === "invalid_grant") {
    return { code: "AUTH_FAILED", message: "이메일 또는 비밀번호가 올바르지 않아요.", originalError: original };
  }
  if (code === "user_already_exists" || code === "email_exists") {
    return { code: "DUPLICATE_USER", message: "이미 가입된 이메일이에요.", originalError: original };
  }
  if (code === "weak_password") {
    return { code: "WEAK_PASSWORD", message: "비밀번호가 너무 짧아요.", originalError: original };
  }

  return { code, message: "요청을 처리하지 못했어요.", originalError: original };
}

function parseErrorMessage(message: string, original: unknown): AppError {
  const lower = message.toLowerCase();

  if (lower.includes("jwt expired") || lower.includes("token expired")) {
    return { code: "AUTH_EXPIRED", message: "로그인이 만료됐어요. 다시 로그인해주세요.", originalError: original };
  }
  if (lower.includes("not authenticated") || lower.includes("unauthorized")) {
    return { code: "AUTH_REQUIRED", message: "로그인이 필요해요.", originalError: original };
  }
  if (lower.includes("network") || lower.includes("fetch failed")) {
    return { code: "NETWORK", message: "인터넷 연결을 확인하고 다시 시도해주세요.", originalError: original };
  }
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return { code: "TIMEOUT", message: "요청 시간이 초과됐어요. 다시 시도해주세요.", originalError: original };
  }

  // mutation에서 직접 throw한 한국어 메시지는 그대로 사용
  if (/[가-힣]/.test(message)) {
    return { code: "APP_ERROR", message, originalError: original };
  }

  return { code: "UNKNOWN", message: "알 수 없는 오류가 발생했어요.", originalError: original };
}

function parseStorageError(err: Record<string, unknown>): AppError {
  const status = Number(err.statusCode);
  const errorType = String(err.error ?? "");

  if (status === 413 || errorType.includes("too_large")) {
    return { code: "FILE_TOO_LARGE", message: "파일 크기가 너무 커요.", originalError: err };
  }
  if (status === 409 || errorType.includes("already_exists")) {
    return { code: "FILE_EXISTS", message: "같은 이름의 파일이 이미 있어요.", originalError: err };
  }
  if (status === 404) {
    return { code: "FILE_NOT_FOUND", message: "파일을 찾을 수 없어요.", originalError: err };
  }

  return { code: "STORAGE_ERROR", message: "파일 처리 중 오류가 발생했어요.", originalError: err };
}
