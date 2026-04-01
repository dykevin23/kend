---
name: Error Handling Roadmap
description: KEND 출시 전 에러 처리/완성도 강화 3주 로드맵 진행 중 (2026-04-01 시작)
type: project
---

KEND 출시를 앞두고 에러/예외 처리 완성도 강화 작업을 3주 계획으로 진행.

**Why:** 현재 Happy path만 구현되어 있고, 에러 구조화/인증 안정성/폼 검증/모니터링 등이 부족한 상태. 출시 전 실 사용자 실패 시나리오 커버 필요.

**How to apply:**
- 로드맵 문서: `readme/kend-error-handling-roadmap.md` (v2.0)
- Part 1: 웹앱(React Router) 작업 — 1주차(에러 구조화, Auth, Toast, ErrorBoundary, RLS), 2주차(오프라인, Validation, 이미지, 결제, Edge Function), 3주차(PostHog, console.log 정리, QA)
- Part 2: RN 네이티브 — WebView 에러, 브리지, 네트워크 감지, 크래시 리포팅, 권한 처리
- 기존 sonner 패키지 설치됨 but 미연동, useAlert hook은 모달용으로 이미 사용 중
