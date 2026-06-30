#!/usr/bin/env bash
set -euo pipefail

branch="$(git branch --show-current)"
if [[ -z "$branch" ]]; then
  echo "No active git branch found." >&2
  exit 1
fi

git fetch origin

if [[ -n "$(git status --porcelain)" ]]; then
  npm run build
  git add -A
  message="${1:-Sync simulator updates $(date '+%Y-%m-%d %H:%M:%S')}"
  git commit -m "$message"
fi

git pull --rebase origin "$branch"
git push origin "$branch"

echo "Synced local branch '$branch' with origin/$branch."
