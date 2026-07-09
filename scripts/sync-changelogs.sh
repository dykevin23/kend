#!/usr/bin/env bash
#
# changelog 3종(kend/native/seller)을 3개 repo에 동기화한다.
# 각 changelog의 원본(canonical)은 그 이름의 프로젝트가 소유:
#   changelog-kend.md   ← kend
#   changelog-native.md ← kend-native
#   changelog-seller.md ← kend-seller
# 원본을 나머지 두 repo의 readme/ 로 복사한다. (overview는 로컬이라 sync 대상 아님)
#
# 사용법:  bash scripts/sync-changelogs.sh   (아무 repo에서든 이 스크립트 경로로 실행)
#
set -euo pipefail

# 워크스페이스 루트 = 이 스크립트가 든 repo(kend)의 부모 폴더
WORKSPACE="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
KEND="$WORKSPACE/kend"
NATIVE="$WORKSPACE/kend-native"
SELLER="$WORKSPACE/kend-seller"

sync_one() {
  # $1 = changelog 파일명, $2 = 원본(canonical) repo
  local file="$1" src_repo="$2"
  local src="$src_repo/readme/$file"
  if [[ ! -f "$src" ]]; then
    echo "⚠️  원본 없음: $src (건너뜀)"
    return
  fi
  local repo dest
  for repo in "$KEND" "$NATIVE" "$SELLER"; do
    dest="$repo/readme/$file"
    [[ "$src" == "$dest" ]] && continue
    if [[ ! -d "$repo/readme" ]]; then
      echo "⚠️  대상 없음: $repo/readme (건너뜀)"
      continue
    fi
    cp "$src" "$dest"
    echo "→ $file → $(basename "$repo")"
  done
}

echo "changelog sync 시작 (워크스페이스: $WORKSPACE)"
sync_one "changelog-kend.md"   "$KEND"
sync_one "changelog-native.md" "$NATIVE"
sync_one "changelog-seller.md" "$SELLER"
echo "✅ changelog sync 완료"
