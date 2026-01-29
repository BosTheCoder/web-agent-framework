#!/bin/bash
set -euo pipefail

# Format hook - runs prettier and eslint on changed files
# Input: JSON with file paths on stdin

# Parse hook input to get file paths
# For now, just run formatters on the whole project since we don't have jq
cd "$CLAUDE_PROJECT_DIR"

# Check if files are TypeScript/JavaScript
if echo "$HOOK_INPUT" | grep -q '\.ts\|\.js'; then
  echo "Running prettier and eslint..."
  pnpm format || true
  pnpm lint --fix || true
fi

exit 0
