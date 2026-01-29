#!/bin/bash
set -euo pipefail

# Check for dangerous operations on .secrets/ directory
# Blocks: cat, git add, echo >, etc. on .secrets/ files

# Check if command involves .secrets/
if echo "$HOOK_INPUT" | grep -qi '\.secrets'; then
  # Check for dangerous commands
  if echo "$HOOK_INPUT" | grep -qiE 'cat|less|more|head|tail|git add|echo.*>|cp.*\.secrets'; then
    echo "ERROR: Blocked attempt to read/commit files in .secrets/ directory"
    echo "The .secrets/ directory contains authentication data and must never be exposed"
    exit 1
  fi
fi

exit 0
