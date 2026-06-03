#!/usr/bin/env bash
# DEV-10: Enterprise SSO IdP staging smoke — Auth0 SAML → Supabase session operator wrapper.
#
# Wraps npm run smoke:enterprise-sso-idp-staging with env loading, prerequisite checks,
# Auth0 SAML runbook hints, and artifact summary. Browser IdP login remains manual (Cycle 2).
#
# Usage:
#   ./scripts/smoke-sso-idp-staging.sh              # full smoke (honest SKIPPED if vault empty)
#   ./scripts/smoke-sso-idp-staging.sh --checklist-only
#   ./scripts/smoke-sso-idp-staging.sh --skip-health
#   ./scripts/smoke-sso-idp-staging.sh --help
#
# Env (see docs/enterprise-sso-idp-staging-smoke-plan.md):
#   E2E_STAGING_BASE_URL, SSO_STAGING_WORKSPACE_ID, SSO_STAGING_IDP_VENDOR=AUTH0
#   SSO_STAGING_ALLOWED_DOMAIN, SSO_STAGING_TEST_EMAIL, SSO_STAGING_SUPABASE_PROVIDER_REF
#
# Cycle 2 operator proof (after manual SAML login):
#   SSO_STAGING_OPERATOR_EMAIL, SSO_STAGING_LOGIN_SCREENSHOT_PATH
#   SSO_STAGING_AUDIT_EVENT_REF, SSO_STAGING_NEGATIVE_TEST_NOTE
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ARTIFACT="artifacts/enterprise-sso-idp-staging-smoke-summary.json"
OPS_DOC="docs/enterprise-sso-idp-staging-smoke-plan.md"
AUTH0_DOC="docs/auth0-supabase-saml-setup.md"

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

print_auth0_saml_runbook() {
  cat <<'EOF'

=== Auth0 SAML → Supabase session (operator runbook) ===

1. Supabase (staging) → Authentication → SSO/SAML
   - Create SAML provider; copy ACS URL + Entity ID + provider UUID
   - Set SSO_STAGING_SUPABASE_PROVIDER_REF to provider UUID

2. Auth0 Dashboard → Applications → Regular Web Application
   - Addons → SAML2 WEB APP
   - audience = Supabase Entity ID
   - recipient = Supabase ACS URL
   - email claim mapped (emailAddress name identifier)

3. OS Kitchen staging → Settings → Security → SSO pilot
   - IdP vendor: Auth0
   - Allowed domain: SSO_STAGING_ALLOWED_DOMAIN
   - Supabase provider ref: SSO_STAGING_SUPABASE_PROVIDER_REF
   - Activate pilot (PILOT_ACTIVE) for SSO_STAGING_WORKSPACE_ID only

4. Browser proof (manual):
   - Open {E2E_STAGING_BASE_URL}/login
   - Sign in with SSO → enter workspace UUID (SSO_STAGING_WORKSPACE_ID)
   - Auth0 login as SSO_STAGING_TEST_EMAIL
   - Expect redirect → /auth/callback?sso_workspace_id=… → /dashboard
   - Capture screenshot; confirm audit event sso.login_success

Full walkthrough: docs/auth0-supabase-saml-setup.md

EOF
}

print_operator_proof_hint() {
  cat <<'EOF'

=== Cycle 2 operator proof (re-run after manual SAML login) ===

export SSO_STAGING_OPERATOR_EMAIL='you@pilot.example.com'
export SSO_STAGING_LOGIN_SCREENSHOT_PATH='/path/to/dashboard-after-sso.png'
export SSO_STAGING_AUDIT_EVENT_REF='audit-export-ref-with-sso.login_success'
export SSO_STAGING_NEGATIVE_TEST_NOTE='Denied wrong-domain user @other.com on staging'

Optional break-glass drill:
export SSO_STAGING_BREAK_GLASS_DRILL_NOTE='Owner email/password login succeeded when IdP disabled'

Then re-run: ./scripts/smoke-sso-idp-staging.sh

EOF
}

check_prerequisites() {
  local missing=()
  local -a required=(
    E2E_STAGING_BASE_URL
    SSO_STAGING_WORKSPACE_ID
    SSO_STAGING_IDP_VENDOR
    SSO_STAGING_ALLOWED_DOMAIN
    SSO_STAGING_TEST_EMAIL
    SSO_STAGING_SUPABASE_PROVIDER_REF
  )
  for key in "${required[@]}"; do
    if [[ -z "${!key:-}" ]]; then
      missing+=("$key")
    fi
  done

  if ((${#missing[@]} > 0)); then
    echo ""
    echo "⚠ Missing SSO staging env vars (${#missing[@]}):"
    printf '  - %s\n' "${missing[@]}"
    echo ""
    echo "Configure in .env.smoke.local (gitignored) or export in ops shell."
    echo "See $OPS_DOC and docs/sso-idp-smoke-test-plan.md"
    echo ""
    echo "Smoke will run with honest SKIPPED WITH REASON (exit 0)."
    return 1
  fi

  echo ""
  echo "✓ SSO staging prerequisites present"
  echo "  staging:    ${E2E_STAGING_BASE_URL}"
  echo "  workspace:  ${SSO_STAGING_WORKSPACE_ID}"
  echo "  idp vendor: ${SSO_STAGING_IDP_VENDOR}"
  echo "  test email: ${SSO_STAGING_TEST_EMAIL}"
  return 0
}

print_artifact_summary() {
  if [[ ! -f "$ARTIFACT" ]]; then
    echo "⚠ No artifact at $ARTIFACT"
    return 0
  fi
  python3 <<PY
import json
from pathlib import Path
p = Path("$ARTIFACT")
d = json.loads(p.read_text())
print("")
print("=== Artifact summary ===")
print(f"  overall:              {d.get('overall')}")
print(f"  loginProofStatus:     {d.get('loginProofStatus')}")
print(f"  wiringCertPassed:     {d.get('wiringCertPassed')}")
print(f"  prerequisitesMet:     {d.get('idpStagingPrerequisitesMet')}")
missing = d.get("missingEnvVars") or []
if missing:
    print(f"  missingEnvVars:       {', '.join(missing)}")
for step in d.get("steps") or []:
    reason = f" — {step['reason']}" if step.get("reason") else ""
    print(f"  [{step.get('status', '?')}] {step.get('id')}{reason}")
print(f"  path:                 {p}")
PY
}

usage() {
  cat <<EOF
Enterprise SSO IdP staging smoke (DEV-10)

  ./scripts/smoke-sso-idp-staging.sh [options]

Options (forwarded to era17 orchestrator):
  --checklist-only   Print IdP staging + Cycle 2 runbook steps
  --skip-health      Skip GET /api/health and /login checks
  --help             This help

Docs: $OPS_DOC · $AUTH0_DOC
Artifact: $ARTIFACT
EOF
}

main() {
  if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
    usage
    exit 0
  fi

  echo "=== Enterprise SSO IdP staging smoke (DEV-10) ==="
  echo "Root: $ROOT"
  echo ""

  load_env_file ".env.local"
  load_env_file ".env.staging.local"
  load_env_file ".env.smoke.local"

  if [[ "${1:-}" == "--checklist-only" ]]; then
    npm run smoke:enterprise-sso-idp-staging -- --checklist-only
    exit 0
  fi

  local vendor_upper
  vendor_upper="$(echo "${SSO_STAGING_IDP_VENDOR:-}" | tr '[:lower:]' '[:upper:]')"

  if ! check_prerequisites; then
    if [[ "$vendor_upper" == "AUTH0" ]]; then
      print_auth0_saml_runbook
    fi
  elif [[ "$vendor_upper" == "AUTH0" ]]; then
    print_auth0_saml_runbook
    echo "Login URL:"
    echo "  ${E2E_STAGING_BASE_URL%/}/login"
    echo ""
  fi

  echo "→ npm run smoke:enterprise-sso-idp-staging $*"
  echo ""
  npm run smoke:enterprise-sso-idp-staging -- "$@"

  print_artifact_summary

  if [[ -z "${SSO_STAGING_OPERATOR_EMAIL:-}" || -z "${SSO_STAGING_LOGIN_SCREENSHOT_PATH:-}" ]]; then
    print_operator_proof_hint
  fi

  echo ""
  echo "Done. See $OPS_DOC for P0 orchestrator Tier 2.3 integration."
}

main "$@"
