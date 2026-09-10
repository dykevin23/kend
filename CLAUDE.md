# CLAUDE.md — KEND (유저 웹앱)

> **KEND** — 자녀 성장정보 기반 유아용품 커머스. React Router SSR + WebView. 단일 Supabase DB(kend-seller와 공유).
> 현재 현황은 `readme/overview.md`, 기반 문서는 `readme/core/`.

## 문서 운영 방식 (kend · native · seller 공통 규칙)

- **현재 상태를 알고 싶으면**: `overview.md` (한 화면 대시보드) → `kend-milestones.md` (Phase별 전체 트래커) 순. `kend-roadmap-to-launch.md`는 4월 원 계획(공수 산정 기준)일 뿐 — Phase 구조는 milestones가 현행(roadmap 상단 매핑표 참고).
- **세부 계획 문서(`todo/`, `active/`)와 트래커가 다르면 세부 문서가 맞다** (트래커는 요약).
- **changelog** = 각 패키지 history(불변, git 기준 append). **이 프로젝트 작업은 `readme/changelog-kend.md`에** 기록한다.
- **overview·changelog·milestones는 `/changelog` 명령어로만 갱신한다.** Claude는 **선제적으로 작성하지 않는다** (사용자가 직접 호출). `/changelog`가 셋을 함께 훑고 폴더 규율(착수→active, 완료→archive)도 정리한다.
- **완료는 테스트로 동작 확인된 뒤에만** ✅로 기록. 아직이면 "진행 중"/"구현됨(테스트 대기)".
- 문서 현행화·폴더 규율 전체 규칙 → `readme/core/readme-structure-guide.md §5.5`. overview 작성 표준 → 같은 문서 §8.
- **타 패키지 진행상황**은 그 패키지 changelog(`changelog-native.md`, `changelog-seller.md` — 이 repo에도 복사본 존재)로 참조한다.
- **공유 문서 sync**: `bash scripts/sync-docs.sh` (kend에서 실행). 대상 = milestones · roadmap · core 공통문서 · changelog 3종. **overview는 로컬이라 sync 안 함.**
- ⚠️ **공유 문서(milestones/roadmap/core)는 kend에서만 수정한다.** 다른 repo에서 고치면 sync 시 덮어써진다.
