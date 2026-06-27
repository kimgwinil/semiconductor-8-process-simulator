#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/Users/kimgwonil/semiconductor-8-process-simulator"
BRANCH="main"
LOG_DIR="$REPO_DIR/.sync-log"
LOG_FILE="$LOG_DIR/auto-sync.log"

mkdir -p "$LOG_DIR"
exec >>"$LOG_FILE" 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] auto-sync start"
cd "$REPO_DIR"

current_branch="$(git branch --show-current)"
if [[ "$current_branch" != "$BRANCH" ]]; then
  echo "skip: current branch is $current_branch, expected $BRANCH"
  exit 0
fi

git fetch origin "$BRANCH"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "changes detected; running build before backup commit"
  npm run build
  git add -A
  if [[ -n "$(git diff --cached --name-only)" ]]; then
    git commit -m "Auto backup $(date '+%Y-%m-%d %H:%M:%S')"
  else
    echo "no staged changes after add"
  fi
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "skip push: working tree still dirty after commit attempt"
  git status --short
  exit 1
fi

git pull --rebase origin "$BRANCH"
git push origin "$BRANCH"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] auto-sync complete"
