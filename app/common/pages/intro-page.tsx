import { redirect } from "react-router";

// 서비스 소개는 공개 홈페이지(/)로 통합 — 기존 /intro 링크 호환용 영구 이동.
export const loader = () => redirect("/", 301);
