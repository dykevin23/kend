현재까지의 작업을 정리한다 — **changelog · overview · milestones를 함께 훑는다.**
(작업을 마치거나 다음 작업으로 넘어갈 때 사용자가 직접 호출한다. 완료/미완료 모두 가능.)

## 1. changelog-kend.md 갱신 (과거를 쌓는다 · git 기준 · append)
- `git log`를 확인해 **changelog에 아직 안 적힌 커밋/변경들을 시간순으로 따라잡아 추가**한다 (그동안 누락된 것까지).
- 커밋 메시지를 그대로 베끼지 말고, 기존 changelog 형식으로 다듬는다:
  - 오늘/해당 날짜 섹션에 추가, 같은 날짜면 그 섹션에 합침
  - 항목 제목에 `[KEND]` prefix
  - 최신이 위로 오도록 역순
- 과거 항목은 바꾸지 않는다. **사실 이력을 쌓아가는** 문서.

## 2. overview.md 갱신 (현재를 정리한다 · CRUD · 가변)
- `core/readme-structure-guide.md §8` 표준의 섹션 골격을 따른다.
- 「지금 상황 / 최근 완료 / 진행 중 / 다음 작업」을 현재 상태에 맞게 **추가·수정·삭제**한다. 끝난 건 빼고, 바뀐 건 고치고, 새 건 넣는다. 상단 "최종 업데이트" 날짜를 오늘로.
- ⚠️ **완료(✅·최근완료)는 테스트로 동작 확인된 것만.** 아직이면 "진행 중" 또는 "구현됨(테스트 대기)"로 정확히 표기.
- 항상 한 화면 분량 유지 — 오래된 최근완료 항목은 빼고 (이력은 changelog에 남아 있음).
- "진행 중/대기" 표의 링크가 살아있는지(archive로 옮겨졌는지) 확인.

## 3. milestones 훑기 (이번 작업이 Phase 항목을 건드렸으면)
- 이번 changelog에 적은 변경이 `kend-milestones.md`의 어떤 Phase 항목에 해당하는지 확인.
- 해당 항목의 **상태 이모지(🟡/🟢/✅)와 체크박스, 완료 문구**를 실제와 맞춘다. "미구현"이라 적힌 게 실은 됐으면 정정.
- 상단 "🔖 현재 상태"에 `**YYYY-MM-DD 갱신**:` 한 줄 추가 (큰 변화가 있었을 때만).
- Phase에 없는 새 "해야 할 일"이 나왔으면 적절한 Phase(또는 P4-4 기술부채)에 배치.
- 하단 "최종 갱신" 날짜 갱신.
- ⚠️ Phase Due(날짜) 재산정은 대표 협의 사안 — Claude가 임의로 바꾸지 않는다.

## 4. 문서 폴더 규율 (매번 가볍게)
- 이번에 **끝난** 계획 문서가 `active/`·`todo/`에 있으면 → `git mv`로 `archive/`.
- **착수한** `todo/` 문서가 있으면 → `active/`.
- 옮겼으면 그 문서를 참조하는 링크(milestones/roadmap/overview 등) 경로 수정.

---

> - KEND-SELLER / KEND-NATIVE 변경사항은 각각 `changelog-seller.md` / `changelog-native.md`에 별도 관리 (사용자가 수동 sync).
> - **이 명령어는 사용자가 직접 호출한다. Claude는 changelog/overview/milestones를 선제적으로 작성하지 않는다.**
> - 갱신 후 `bash scripts/sync-docs.sh` 안내 (단, seller/native가 작업 중이면 나중에).
