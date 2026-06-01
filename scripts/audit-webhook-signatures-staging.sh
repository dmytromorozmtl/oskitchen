#!/usr/bin/env bash
# Webhook signature matrix — static audit + optional staging negative probes.
#
# Phase 1 (always): static source scan + Era 16 matrix cert.
# Phase 2 (vault gated): POST unsigned payloads to P0/P1 routes on staging;
#   expect 4xx/503 fail-closed — never 200/201 without valid signature.
#
# Usage:
#   ./scripts/audit-webhook-signatures-staging.sh
#   ./scripts/audit-webhook-signatures-staging.sh --write
#
# Staging requires E2E_STAGING_BASE_URL (or STAGING_BASE_URL / PLAYWRIGHT_BASE_URL).
# Optional: source .env.staging.local via scripts/load-staging-env.sh first.
#
# Output: artifacts/webhook-signature-staging-audit.json (with --write)
#
# @see scripts/audit-webhook-signatures.ts
# @see lib/security/webhook-security-matrix.ts
# @see docs/pen-test-plan.md
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

WRITE=0
if [[ "${1:-}" == "--write" ]] || [[ "${1:-}" == "-w" ]]; then
  WRITE=1
fi

ARTIFACT="artifacts/webhook-signature-staging-audit.json"
GENERATED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

# shellcheck source=scripts/load-staging-env.sh
source "$ROOT/scripts/load-staging-env.sh"
load_staging_env || true

echo "== Webhook signature matrix audit =="
echo "Root: $ROOT"

echo ""
echo "== Phase 1: static signature audit =="
node ./node_modules/tsx/dist/cli.mjs scripts/audit-webhook-signatures.ts --write
node ./node_modules/tsx/dist/cli.mjs scripts/cert-webhook-security-era16.ts

STAGING_URL="${E2E_STAGING_BASE_URL:-${STAGING_BASE_URL:-${PLAYWRIGHT_BASE_URL:-}}}"
STAGING_URL="${STAGING_URL%/}"

# path|method|body|expected_status_csv (any match = pass)
read -r -d '' PROBE_SPEC <<'EOF' || true
POST|/api/webhooks/stripe|{}|401,400,503
POST|/api/webhooks/shopify/orders-create|{}|400,401,404
POST|/api/webhooks/shopify/orders-updated|{}|400,401,404
POST|/api/webhooks/woocommerce?cid=00000000-0000-4000-8000-000000000001|{}|400,401,404
POST|/api/webhooks/doordash/orders?cid=00000000-0000-4000-8000-000000000002|{}|400,401,404
POST|/api/webhooks/grubhub/orders?cid=00000000-0000-4000-8000-000000000003|{}|400,401,404
POST|/api/webhooks/uber-eats/orders?cid=00000000-0000-4000-8000-000000000004|{}|400,401,404
POST|/api/webhooks/resend|{}|401,403,503
POST|/api/webhooks/bigquery-interference-matrix|{}|401,403,503
EOF

status_in_list() {
  local code="$1"
  local list="$2"
  IFS=',' read -ra codes <<<"$list"
  for expected in "${codes[@]}"; do
    if [[ "$code" == "$expected" ]]; then
      return 0
    fi
  done
  return 1
}

write_artifact() {
  local staging_overall="$1"
  local skip_reason="${2:-}"
  local probes_json="${3:-[]}"

  if [[ "$WRITE" -ne 1 ]]; then
    return 0
  fi

  mkdir -p "$(dirname "$ARTIFACT")"
  STAGING_OVERALL="$staging_overall" \
  STAGING_SKIP_REASON="$skip_reason" \
  STAGING_BASE_URL="$STAGING_URL" \
  PROBES_JSON="$probes_json" \
  ARTIFACT_PATH="$ARTIFACT" \
  GENERATED_AT="$GENERATED_AT" \
  python3 - <<'PY'
import json
import os
from pathlib import Path

skip = os.environ.get("STAGING_SKIP_REASON", "").strip()
payload = {
    "version": "webhook-signature-staging-audit-v1",
    "generatedAt": os.environ["GENERATED_AT"],
    "staticAudit": "PASSED",
    "matrixCert": "PASSED",
    "stagingOverall": os.environ["STAGING_OVERALL"],
    "stagingSkipReason": skip or None,
    "stagingBaseUrl": os.environ.get("STAGING_BASE_URL") or None,
    "honestyNote": "Negative probes only — valid HMAC/OAuth replay drills require channel credentials.",
    "probes": json.loads(os.environ.get("PROBES_JSON") or "[]"),
}
path = Path(os.environ["ARTIFACT_PATH"])
path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
print(f"Artifact: {path}")
PY
}

if [[ -z "$STAGING_URL" ]]; then
  echo ""
  echo "== Phase 2: staging live probes SKIPPED =="
  echo "Missing E2E_STAGING_BASE_URL — vault gate (see docs/vault-one-pager.md)"
  write_artifact "SKIPPED" "Missing E2E_STAGING_BASE_URL (vault 0/11)"
  echo ""
  echo "Overall: static PASSED | staging SKIPPED"
  exit 0
fi

echo ""
echo "== Phase 2: staging negative signature probes =="
echo "Base: $STAGING_URL"

probe_results=()
fail=0

while IFS='|' read -r method path body expected; do
  [[ -z "$method" ]] && continue
  url="${STAGING_URL}${path}"
  tmp="$(mktemp)"
  code="$(curl -sS -o "$tmp" -w "%{http_code}" -X "$method" \
    -H "Content-Type: application/json" \
    -d "$body" \
    "$url" || echo "000")"

  if status_in_list "$code" "$expected"; then
    result="PASS"
    echo "PASS $method $path HTTP $code (expected one of: $expected)"
  else
    result="FAIL"
    fail=$((fail + 1))
    echo "FAIL $method $path HTTP $code (expected one of: $expected)" >&2
    head -c 400 "$tmp" >&2 || true
    echo "" >&2
  fi

  body_escaped="${body//\"/\\\"}"
  probe_results+=("{\"method\":\"$method\",\"path\":\"$path\",\"httpStatus\":$code,\"expectedStatuses\":\"$expected\",\"result\":\"$result\"}")
  rm -f "$tmp"
done <<<"$PROBE_SPEC"

probes_json="[$(IFS=,; echo "${probe_results[*]}")]"

if [[ "$fail" -gt 0 ]]; then
  write_artifact "FAILED" "" "$probes_json"
  echo ""
  echo "$fail staging probe(s) failed — unsigned traffic not rejected as expected"
  exit 1
fi

write_artifact "PASSED" "" "$probes_json"
echo ""
echo "Overall: static PASSED | staging PASSED (${#probe_results[@]} negative probes)"
exit 0
