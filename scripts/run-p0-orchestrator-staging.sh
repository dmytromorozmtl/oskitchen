#!/usr/bin/env bash
# QA-01: Local P0 orchestrator staging run — mirrors .github/workflows/p0-orchestrator.yml.
# Writes artifacts/p0-orchestrator-staging-run-summary.json with honest PASS/FAIL/SKIPPED.
#
# Usage:
#   ./scripts/run-p0-orchestrator-staging.sh
#   ./scripts/run-p0-orchestrator-staging.sh --policy-only   # tier-0 + vault only
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ARTIFACT="artifacts/p0-orchestrator-staging-run-summary.json"
POLICY_ONLY=false

for arg in "$@"; do
  case "$arg" in
    --policy-only) POLICY_ONLY=true ;;
    --help|-h)
      echo "Usage: ./scripts/run-p0-orchestrator-staging.sh [--policy-only]"
      exit 0
      ;;
  esac
done

load_env_file() {
  local f="$1"
  if [[ -f "$f" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$f"
    set +a
    echo "→ loaded $f"
  fi
}

run_step() {
  local id="$1"
  local label="$2"
  shift 2
  echo ""
  echo "=== $label ==="
  if "$@"; then
    STEP_OUTCOMES+=("$id:PASS")
    echo "✓ $id PASS"
    return 0
  else
    local code=$?
    STEP_OUTCOMES+=("$id:FAIL")
    echo "✗ $id FAIL (exit $code)"
    return "$code"
  fi
}

run_step_optional() {
  local id="$1"
  local label="$2"
  shift 2
  echo ""
  echo "=== $label ==="
  if "$@"; then
    STEP_OUTCOMES+=("$id:PASS")
    echo "✓ $id PASS"
  else
    local code=$?
    STEP_OUTCOMES+=("$id:FAIL")
    echo "✗ $id FAIL (exit $code) — continuing (honest aggregate)"
    FAILED_STEPS=$((FAILED_STEPS + 1))
  fi
  return 0
}

STEP_OUTCOMES=()
FAILED_STEPS=0
VAULT_READY=false
RUN_AT="$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")"

echo "=== P0 orchestrator staging run (QA-01) ==="
echo "Root: $ROOT"
echo "Policy only: $POLICY_ONLY"
echo ""

load_env_file ".env.local"
load_env_file ".env.staging.local"
load_env_file ".env.smoke.local"

export CI="${CI:-1}"

# Channel live smokes import @prisma/client — generate before tier-2.
echo ""
echo "=== Prisma client generate ==="
if npx prisma generate; then
  echo "✓ prisma generate PASS"
else
  echo "⚠ prisma generate FAIL — smoke_channel may fail with MODULE_NOT_FOUND (run: npm ci && npx prisma generate)"
fi

# Tier 0 — always on
run_step "tier0_policy" "Tier 0 — P0 policy unit gate" \
  npm run test:ci:p0-staging-proof-unblock-era17

# Vault gate
echo ""
echo "=== Vault gate (11 secrets) ==="
if npm run ops:validate-p0-vault-env -- --json > /tmp/p0-vault.json 2>&1; then
  VAULT_READY=true
  STEP_OUTCOMES+=("vault_gate:PASS")
  echo "✓ vault_gate PASS"
  cat /tmp/p0-vault.json
else
  STEP_OUTCOMES+=("vault_gate:SKIP")
  echo "⚠ vault_gate SKIP — live smokes omitted (honest)"
  cat /tmp/p0-vault.json 2>/dev/null || true
fi

record_smoke_skip() {
  local id="$1"
  local reason="$2"
  STEP_OUTCOMES+=("$id:SKIP")
  echo "⚠ $id SKIP — $reason"
}

if [[ "$VAULT_READY" == "true" && "$POLICY_ONLY" == "false" ]]; then
  run_step_optional "smoke_workflows" "Tier 2.1b — staging workflows first green" \
    npm run smoke:staging-workflows-first-green
  run_step_optional "smoke_channel" "Tier 2.2 — Woo/Shopify live channel smoke (credentials only)" \
    npm run smoke:woo-shopify-live:skip
  run_step_optional "smoke_sso" "Tier 2.3 — SSO IdP staging login" \
    npm run smoke:enterprise-sso-idp-staging
  run_step_optional "smoke_p0" "Tier 2.4 — P0 aggregate smoke" \
    npm run smoke:p0-staging-proof-unblock
  run_step_optional "smoke_integrity" "Tier 2.5 — P0 integrity validation" \
    npm run ops:validate-p0-staging-proof-integrity
elif [[ "$POLICY_ONLY" == "true" ]]; then
  echo ""
  echo "⚠ Live smokes SKIPPED (--policy-only) — recording honest SKIP per step"
  record_smoke_skip "smoke_workflows" "--policy-only"
  record_smoke_skip "smoke_channel" "--policy-only"
  record_smoke_skip "smoke_sso" "--policy-only"
  record_smoke_skip "smoke_p0" "--policy-only"
  record_smoke_skip "smoke_integrity" "--policy-only"
else
  echo ""
  echo "⚠ Live smokes SKIPPED (vault incomplete) — recording honest SKIP per step"
  record_smoke_skip "smoke_workflows" "vault incomplete"
  record_smoke_skip "smoke_channel" "vault incomplete"
  record_smoke_skip "smoke_sso" "vault incomplete"
  record_smoke_skip "smoke_p0" "vault incomplete"
  record_smoke_skip "smoke_integrity" "vault incomplete"
fi

# Always refresh downstream artifacts
npm run check-vault-readiness -- --write || true
npm run ops:run-p0-staging-proof-execution -- --write || true

# Compute overall
OVERALL="SKIPPED"
P0_ARTIFACT_OVERALL="SKIPPED"
if [[ -f artifacts/vault-readiness-report.json ]]; then
  P0_ARTIFACT_OVERALL="$(python3 -c "import json; print(json.load(open('artifacts/vault-readiness-report.json')).get('p0ArtifactOverall','SKIPPED'))")"
fi

if [[ "$VAULT_READY" != "true" ]]; then
  OVERALL="SKIPPED"
elif [[ "$FAILED_STEPS" -gt 0 || "$P0_ARTIFACT_OVERALL" == "FAIL" || "$P0_ARTIFACT_OVERALL" == "FAILED" ]]; then
  OVERALL="FAIL"
elif [[ "$P0_ARTIFACT_OVERALL" == "PASS" || "$P0_ARTIFACT_OVERALL" == "PASSED" ]]; then
  OVERALL="PASS"
else
  OVERALL="SKIPPED"
fi

mkdir -p artifacts
VAULT_READY_JSON=$([[ "$VAULT_READY" == "true" ]] && echo "true" || echo "false")
POLICY_ONLY_JSON=$([[ "$POLICY_ONLY" == "true" ]] && echo "true" || echo "false")
python3 <<PY
import json

steps = []
for entry in """${STEP_OUTCOMES[*]}""".split():
    if not entry.strip():
        continue
    sid, status = entry.split(":", 1)
    steps.append({"id": sid, "status": status})

summary = {
    "version": "p0-orchestrator-staging-run-v1",
    "task": "QA-01",
    "runAt": "$RUN_AT",
    "overall": "$OVERALL",
    "vaultReady": "$VAULT_READY_JSON" == "true",
    "policyOnly": "$POLICY_ONLY_JSON" == "true",
    "failedStepCount": $FAILED_STEPS,
    "p0ArtifactOverall": "$P0_ARTIFACT_OVERALL",
    "runner": "scripts/run-p0-orchestrator-staging.sh",
    "steps": steps,
    "artifacts": [
        "artifacts/vault-readiness-report.json",
        "artifacts/p0-staging-proof-execution-summary.json",
        "artifacts/p0-staging-proof-unblock-summary.json",
        "artifacts/staging-workflows-first-green-summary.json",
        "artifacts/channel-live-smoke-summary.json",
        "artifacts/enterprise-sso-idp-staging-smoke-summary.json",
    ],
    "workflow": ".github/workflows/p0-orchestrator.yml",
    "honestyNote": "PASS only when vault ready and all tier-2 smokes pass; SKIPPED when vault incomplete or child smokes skip.",
}

path = "$ARTIFACT"
with open(path, "w") as f:
    json.dump(summary, f, indent=2)
    f.write("\\n")

print("")
print("=== P0 orchestrator staging summary ===")
print(f"  overall:           {summary['overall']}")
print(f"  vaultReady:          {summary['vaultReady']}")
print(f"  p0ArtifactOverall:   {summary['p0ArtifactOverall']}")
print(f"  failedStepCount:     {summary['failedStepCount']}")
print(f"  artifact:            {path}")
PY

if [[ "$OVERALL" == "FAIL" ]]; then
  exit 1
fi
exit 0
