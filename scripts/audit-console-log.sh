#!/usr/bin/env bash
# Static audit for raw console.log / console.debug / console.info in runtime source.
#
# Policy: production request paths should use lib/logger.ts — not ad-hoc console.log.
# scripts/, tests/, and prisma/ are excluded (CLI output is allowed there).
#
# Usage:
#   ./scripts/audit-console-log.sh
#   ./scripts/audit-console-log.sh --write
#   ./scripts/audit-console-log.sh --strict     # exit 1 if runtime dirs have hits
#   ./scripts/audit-console-log.sh --write --strict
#
# Output artifact (with --write): artifacts/console-log-audit.json
# Docs: docs/console-log-audit.md
#
# @see lib/logger.ts
# @see docs/observability-setup.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

WRITE=0
STRICT=0
for arg in "$@"; do
  case "$arg" in
    --write | -w) WRITE=1 ;;
    --strict) STRICT=1 ;;
  esac
done

ARTIFACT="artifacts/console-log-audit.json"
GENERATED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
PATTERN='console\.(log|debug|info)\('

# Runtime surfaces that ship to browsers or server handlers — zero tolerance in --strict
RUNTIME_DIRS=(app components actions services)

# Shared libraries — warn; small allowlist for intentional wrappers / CLI formatters
LIB_DIR=lib
LIB_ALLOWLIST=(
  "lib/logger.ts"
  "lib/integrations/channel-live-smoke-summary.ts"
)

is_allowlisted() {
  local file="$1"
  for allowed in "${LIB_ALLOWLIST[@]}"; do
    if [[ "$file" == "$allowed" ]]; then
      return 0
    fi
  done
  return 1
}

scan_dir() {
  local dir="$1"
  [[ -d "$dir" ]] || return 0
  grep -RIn --include='*.ts' --include='*.tsx' -E "$PATTERN" "$dir" 2>/dev/null || true
}

count_matches() {
  local text="$1"
  if [[ -z "$text" ]]; then
    echo 0
    return
  fi
  printf '%s\n' "$text" | grep -c . || echo 0
}

echo "== Console.log audit =="
echo "Root: $ROOT"
echo "Pattern: $PATTERN"
echo ""

runtime_hits=""
for dir in "${RUNTIME_DIRS[@]}"; do
  runtime_hits+="$(scan_dir "$dir")"
  [[ -n "$(scan_dir "$dir")" ]] && runtime_hits+=$'\n'
done
runtime_hits="${runtime_hits//$'\n\n'/$'\n'}"
runtime_hits="$(printf '%s' "$runtime_hits" | sed '/^$/d' || true)"
runtime_count="$(count_matches "$runtime_hits")"

lib_hits=""
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  file="${line%%:*}"
  if is_allowlisted "$file"; then
    continue
  fi
  lib_hits+="$line"$'\n'
done < <(scan_dir "$LIB_DIR" || true)
lib_hits="$(printf '%s' "$lib_hits" | sed '/^$/d' || true)"
lib_count="$(count_matches "$lib_hits")"

scripts_count="$(count_matches "$(scan_dir scripts)")"
tests_count="$(count_matches "$(scan_dir tests)")"

echo "Runtime (app, components, actions, services): $runtime_count"
echo "Library (lib/, excl. allowlist):              $lib_count"
echo "Scripts (informational):                    $scripts_count"
echo "Tests (informational):                        $tests_count"
echo ""

if [[ "$runtime_count" -gt 0 ]]; then
  echo "== Runtime hits (replace with lib/logger) =="
  printf '%s\n' "$runtime_hits" | head -40
  if [[ "$runtime_count" -gt 40 ]]; then
    echo "... and $((runtime_count - 40)) more"
  fi
  echo ""
fi

if [[ "$lib_count" -gt 0 ]]; then
  echo "== Library hits (review or allowlist) =="
  printf '%s\n' "$lib_hits" | head -20
  if [[ "$lib_count" -gt 20 ]]; then
    echo "... and $((lib_count - 20)) more"
  fi
  echo ""
fi

overall="PASS"
if [[ "$runtime_count" -gt 0 ]]; then
  overall="FAIL"
elif [[ "$lib_count" -gt 0 ]]; then
  overall="WARN"
fi

if [[ "$WRITE" -eq 1 ]]; then
  mkdir -p "$(dirname "$ARTIFACT")"
  RUNTIME_COUNT="$runtime_count" \
  LIB_COUNT="$lib_count" \
  SCRIPTS_COUNT="$scripts_count" \
  TESTS_COUNT="$tests_count" \
  OVERALL="$overall" \
  GENERATED_AT="$GENERATED_AT" \
  RUNTIME_HITS="$runtime_hits" \
  LIB_HITS="$lib_hits" \
  ARTIFACT_PATH="$ARTIFACT" \
  python3 - <<'PY'
import json
import os
from pathlib import Path

def lines_to_hits(raw: str, limit: int = 200):
    out = []
    for line in raw.splitlines():
        if not line.strip():
            continue
        path, rest = line.split(":", 1)
        line_no, _sep, snippet = rest.partition(":")
        out.append({"file": path, "line": int(line_no), "snippet": snippet.strip()[:240]})
        if len(out) >= limit:
            break
    return out

payload = {
    "version": "console-log-audit-v1",
    "generatedAt": os.environ["GENERATED_AT"],
    "overall": os.environ["OVERALL"],
    "policy": "Use lib/logger.ts in runtime paths; console.log allowed in scripts/tests/prisma.",
    "counts": {
        "runtime": int(os.environ["RUNTIME_COUNT"]),
        "library": int(os.environ["LIB_COUNT"]),
        "scripts": int(os.environ["SCRIPTS_COUNT"]),
        "tests": int(os.environ["TESTS_COUNT"]),
    },
    "runtimeHits": lines_to_hits(os.environ.get("RUNTIME_HITS", "")),
    "libraryHits": lines_to_hits(os.environ.get("LIB_HITS", "")),
    "allowlist": [
        "lib/logger.ts",
        "lib/integrations/channel-live-smoke-summary.ts",
    ],
}
path = Path(os.environ["ARTIFACT_PATH"])
path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
print(f"Artifact: {path}")
PY
fi

echo "Overall: $overall"

if [[ "$STRICT" -eq 1 && "$runtime_count" -gt 0 ]]; then
  echo "Strict mode: runtime console.log/debug/info must be zero." >&2
  exit 1
fi

exit 0
