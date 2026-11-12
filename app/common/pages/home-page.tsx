import { redirect } from "react-router";

/**
 * 홈 → /stores redirect
 *
 * (예전엔 Supabase 프로젝트가 하나라 OAuth가 Site URL(/?code=)로 떨어지는 경우를 여기서
 * 세션 교환했으나, dev/prod 분리 + 서버별 redirectTo로 제거 — 2026-11 환경분리)
 */
export const loader = async () => redirect("/stores");
