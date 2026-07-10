#!/usr/bin/env bash
#
# 프로젝트 간 공유 문서를 동기화한다 (kend / kend-native / kend-seller).
#
# 공유 (sync 대상)
#   - kend-milestones.md, kend-roadmap-to-launch.md   ← canonical: kend
#   - core/ 공통 문서 8종                              ← canonical: kend
#   - changelog-{kend,native,seller}.md                ← canonical: 각 이름의 프로젝트
#
# 로컬 (sync 안 함)
#   - overview.md (각 프로젝트 현황), active/, todo/
#   - core/ui-components.md(kend), core/kend-native.md(native)
#
# ⚠️ 공유 문서는 kend에서만 수정한다. 다른 repo에서 고치면 sync 시 덮어써진다.
#
# 사용법: bash scripts/sync-docs.sh
#
set -euo pipefail

# 워크스페이스 루트 = 이 스크립트가 든 repo(kend)의 부모 폴더
WORKSPACE="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
KEND="$WORKSPACE/kend"
NATIVE="$WORKSPACE/kend-native"
SELLER="$WORKSPACE/kend-seller"

copy_to() {
  # $1 = 원본 절대경로, $2 = 대상 repo, $3 = readme 기준 상대경로
  local src="$1" repo="$2" rel="$3"
  local dest="$repo/readme/$rel"
  [ "$src" = "$dest" ] && return
  if [ ! -d "$repo/readme" ]; then
    echo "  ⚠️  대상 없음: $repo/readme (건너뜀)"
    return
  fi
  mkdir -p "$(dirname "$dest")"
  cp "$src" "$dest"
  echo "  → $rel → $(basename "$repo")"
}

# kend를 원본으로 하는 공유 문서
sync_from_kend() {
  local rel="$1"
  local src="$KEND/readme/$rel"
  if [ ! -f "$src" ]; then
    echo "  ⚠️  원본 없음: $rel (건너뜀)"
    return
  fi
  copy_to "$src" "$NATIVE" "$rel"
  copy_to "$src" "$SELLER" "$rel"
}

# 각 프로젝트가 원본인 changelog
sync_changelog() {
  local rel="$1" owner="$2"
  local src="$owner/readme/$rel"
  if [ ! -f "$src" ]; then
    echo "  ⚠️  원본 없음: $src (건너뜀)"
    return
  fi
  local repo
  for repo in "$KEND" "$NATIVE" "$SELLER"; do
    copy_to "$src" "$repo" "$rel"
  done
}

echo "문서 sync 시작 (워크스페이스: $WORKSPACE)"

echo "[1/3] 계획 문서 (canonical: kend)"
sync_from_kend "kend-milestones.md"
sync_from_kend "kend-roadmap-to-launch.md"

echo "[2/3] core 공통 문서 (canonical: kend)"
for f in application-architecture.md auth-model.md claudeReadme.md database.md \
         growth-chart-guide.md order_delivery_design_draft_for_claude_code.md \
         readme-structure-guide.md toss-payments.md; do
  sync_from_kend "core/$f"
done

echo "[3/3] changelog (canonical: 각 프로젝트)"
sync_changelog "changelog-kend.md" "$KEND"
sync_changelog "changelog-native.md" "$NATIVE"
sync_changelog "changelog-seller.md" "$SELLER"

echo "✅ 문서 sync 완료"
