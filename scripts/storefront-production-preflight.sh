#!/usr/bin/env bash
# Storefront production preflight — run before prod deploy.
# Writes: docs/artifacts/storefront-preflight-latest.md
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
REPORT="${ROOT}/docs/artifacts/storefront-preflight-latest.md"
DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

mkdir -p "${ROOT}/docs/artifacts"
{
  echo "# Storefront preflight — ${DATE}"
  echo ""
} > "${REPORT}"

log() {
  echo "$1"
  echo "$1" >> "${REPORT}"
}

log "## KitchenOS Storefront production preflight"
log ""

if [[ -f .env.production.local ]]; then
  log "- Loaded \`.env.production.local\`"
  set -a
  # shellcheck disable=SC1091
  source .env.production.local
  set +a
else
  log "- ⚠ No \`.env.production.local\` — copy from \`.env.storefront.production.example\`"
fi

log ""
log "### 1. Cron profile"
CRON_COUNT="$(jq '.crons | length' vercel.json)"
log "- \`vercel.json\` crons: **${CRON_COUNT}** (production target: **6**)"
if [[ "${CRON_COUNT}" -gt 15 ]]; then
  log "- ⚠ Run: \`npm run vercel:crons:production\`"
fi

log ""
log "### 2. Storefront env"
if npm run check-env:storefront:report >> "${REPORT}" 2>&1; then
  log "- Env: **PASS** (see storefront-env-report in artifacts/)"
else
  log "- Env: **FAIL**"
  exit 1
fi

log ""
log "### 3. Storefront release unit tests"
if npm run test:storefront-release >> "${REPORT}" 2>&1; then
  log "- Storefront release tests: **PASS**"
else
  log "- Storefront release tests: **FAIL** (see log above)"
  exit 1
fi

log ""
log "### 4. Typecheck"
log "- Skipped by default (run \`npm run typecheck\` in CI). Set \`PREFLIGHT_TYPECHECK=1\` to enable."
if [[ "${PREFLIGHT_TYPECHECK:-}" == "1" ]]; then
  if npm run typecheck >> "${REPORT}" 2>&1; then
    log "- Typecheck: **PASS**"
  else
    log "- Typecheck: **FAIL**"
    exit 1
  fi
fi

log ""
log "## Next steps"
log ""
log "1. Sign \`docs/artifacts/STOREFRONT_STRIPE_SIGNOFF_RECORD.md\`"
log "2. \`npm run storefront:qa-artifact\` on staging"
log "3. \`npm run github:storefront-gates\`"
log "4. Deploy prod + \`npm run storefront:post-deploy\`"
log ""
log "Full runbook: \`docs/runbooks/STOREFRONT_RELEASE_DAY_RUNBOOK.md\`"
log ""
log "✓ Preflight complete — report: \`docs/artifacts/storefront-preflight-latest.md\`"
