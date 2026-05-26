#!/usr/bin/env bash
# Phase 9 — full local completion (no Vercel). Run while `npm run dev` is up.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

SLUG="${STOREFRONT_PILOT_SLUG:-hello}"
BASE="${STOREFRONT_LOCAL_BASE_URL:-http://127.0.0.1:3000}"
FAIL=0
DATE="$(date -u +%Y-%m-%d)"
ARTIFACT="${ROOT}/docs/artifacts/storefront-phase9-local-${DATE}.md"

step() {
  local name="$1"
  shift
  echo "→ $name"
  if "$@"; then
    echo "  ✓ $name"
  else
    echo "  ✗ $name"
    FAIL=1
  fi
  echo ""
}

mkdir -p "${ROOT}/docs/artifacts"
{
  echo "# Storefront Phase 9 — local completion report"
  echo ""
  echo "- Generated (UTC): $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "- Base URL: \`${BASE}\`"
  echo "- Pilot slug: \`${SLUG}\`"
  echo ""
} >"$ARTIFACT"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Phase 9 LOCAL complete (pre-Vercel)                     ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

step "Env check (storefront)" env STOREFRONT_ENV_TARGET=local npm run check-env:storefront
step "DB schema" npm run db:check-storefront-schema
step "Phase 9 seed (brand + 2nd store)" npm run storefront:seed-phase9-local
step "Unit tests" npm run test:storefront-release

if curl -sf "${BASE}/api/health" >/dev/null 2>&1; then
  echo "→ HTTP checks on ${BASE}"
  {
    echo "## HTTP checks"
    echo ""
  } >>"$ARTIFACT"

  for path in "/s/${SLUG}/robots.txt" "/s/${SLUG}/sitemap.xml" "/s/${SLUG}/menu"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}${path}" || echo "000")
    if [[ "$code" == "200" ]]; then
      echo "  ✓ GET ${path} → ${code}"
      echo "- ✓ \`${path}\` → ${code}" >>"$ARTIFACT"
    else
      echo "  ✗ GET ${path} → ${code}"
      echo "- ✗ \`${path}\` → ${code}" >>"$ARTIFACT"
      FAIL=1
    fi
  done
  echo ""

  if [[ -n "${STOREFRONT_MIDDLEWARE_SECRET:-}" ]]; then
    host="${E2E_BRAND_VANITY_HOST:-}"
    if [[ -z "$host" && -n "${NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN:-}" ]]; then
      host="weekend.${SLUG}.${NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN}"
    fi
    if [[ -n "$host" ]]; then
      res=$(curl -s -H "x-kos-mw-secret: ${STOREFRONT_MIDDLEWARE_SECRET}" \
        "${BASE}/api/storefront/resolve-host?host=${host}" || echo "{}")
      echo "  → resolve-host(${host}): ${res}"
      echo "- resolve-host \`${host}\`: \`${res}\`" >>"$ARTIFACT"
      if echo "$res" | grep -q '"brandId"'; then
        echo "  ✓ brandId in resolve-host response"
      else
        echo "  ⚠ brandId missing (seed brand or DNS not required locally)"
      fi
    fi
    echo ""
  fi

  if [[ -n "${CRON_SECRET:-}" ]]; then
    cron_res=$(curl -s -X POST -H "Authorization: Bearer ${CRON_SECRET}" \
      "${BASE}/api/cron/storefront-invite-audit-retention" || echo '{"error":"fail"}')
    echo "  → retention cron: ${cron_res}"
    echo "- retention cron: \`${cron_res}\`" >>"$ARTIFACT"
    if echo "$cron_res" | grep -q '"ok":true'; then
      echo "  ✓ retention cron OK"
    else
      echo "  ✗ retention cron failed"
      FAIL=1
    fi
    echo ""
  else
    echo "→ retention cron skipped (set CRON_SECRET in .env.local)"
    echo ""
  fi

  step "Brand host E2E" env E2E_STOREFRONT_SLUG="$SLUG" npx playwright test e2e/storefront-brand-host.spec.ts || true

  if [[ -n "${E2E_LOGIN_EMAIL:-}" ]]; then
    step "Multi-store E2E" npx playwright test e2e/storefront-multi-store.spec.ts || true
  else
    echo "→ Multi-store E2E skipped (E2E_LOGIN_EMAIL)"
    echo ""
  fi
else
  echo "→ Dev server not running at ${BASE} — start: npm run dev:safe"
  echo "- Dev server: **not running**" >>"$ARTIFACT"
  FAIL=1
  echo ""
fi

{
  echo ""
  echo "## Pre-Vercel checklist (when ready to deploy)"
  echo ""
  echo "| # | Item | Status |"
  echo "|---|------|--------|"
  echo "| 1 | Deploy to Vercel | pending |"
  echo "| 2 | Env: STOREFRONT_MIDDLEWARE_SECRET, ROOT_DOMAIN, CRON_SECRET, RESEND | pending |"
  echo "| 3 | Wildcard DNS \`*.ROOT_DOMAIN\` | pending |"
  echo "| 4 | STOREFRONT_SMOKE_BASE_URL prod signoff | pending |"
  echo "| 5 | Brand vanity manual QA | pending |"
  echo "| 6 | Audit CSV on prod | pending |"
  echo "| 7 | Retention cron in Vercel dashboard | pending |"
  echo "| 8 | Multi-store on prod account | pending |"
  echo "| 9 | CI PLAYWRIGHT_BASE_URL + E2E_LOGIN | pending |"
  echo "| 10 | LHCI optional | pending |"
} >>"$ARTIFACT"

echo "Wrote ${ARTIFACT}"
echo ""

if [[ "$FAIL" -eq 0 ]]; then
  echo "✓ Phase 9 local completion passed."
  exit 0
fi
echo "✗ Phase 9 local completion had failures."
exit 1
