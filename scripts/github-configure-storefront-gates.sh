#!/usr/bin/env bash
# Configure GitHub Actions variables + optional branch protection for Storefront.
#
# Non-interactive:
#   GH_NONINTERACTIVE=1 \
#   GITHUB_PLAYWRIGHT_BASE_URL=https://staging.example.com \
#   GITHUB_E2E_STOREFRONT_SLUG=demo \
#   GITHUB_APPLY_BRANCH_PROTECTION=1 \
#   ./scripts/github-configure-storefront-gates.sh main
set -euo pipefail

BRANCH="${1:-main}"

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI: https://cli.github.com/"
  exit 1
fi

REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
echo "Repository: ${REPO}  Branch: ${BRANCH}"

set_var() {
  local name="$1"
  local value="$2"
  if [[ -n "${value}" ]]; then
    gh variable set "${name}" --body "${value}" --repo "${REPO}"
    echo "✓ ${name}"
  fi
}

if [[ "${GH_NONINTERACTIVE:-}" == "1" ]]; then
  set_var "PLAYWRIGHT_BASE_URL" "${GITHUB_PLAYWRIGHT_BASE_URL:-}"
  set_var "E2E_STOREFRONT_SLUG" "${GITHUB_E2E_STOREFRONT_SLUG:-}"
  if [[ "${GITHUB_STOREFRONT_CHECK_STRIPE:-}" == "1" ]]; then
    set_var "STOREFRONT_CHECK_STRIPE" "1"
  fi
else
  read -r -p "PLAYWRIGHT_BASE_URL (staging): " URL || true
  set_var "PLAYWRIGHT_BASE_URL" "${URL}"
  read -r -p "E2E_STOREFRONT_SLUG: " SLUG || true
  set_var "E2E_STOREFRONT_SLUG" "${SLUG}"
fi

echo ""
echo "Required status checks to enable in GitHub UI (Settings → Branches → ${BRANCH}):"
echo "  - quality            (CI)"
echo "  - gate               (Storefront staging gate)"
echo "  - storefront-e2e     (Playwright storefront)"
echo "  - Lighthouse storefront (optional)"
echo ""

if [[ "${GH_NONINTERACTIVE:-}" == "1" && "${GITHUB_APPLY_BRANCH_PROTECTION:-}" == "1" ]]; then
  gh api -X PUT "repos/${REPO}/branches/${BRANCH}/protection" --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "checks": [
      { "context": "quality" },
      { "context": "gate" }
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
  echo "✓ Branch protection applied (add Playwright/Lighthouse when stable)."
fi

echo ""
echo "Done — see docs/runbooks/STOREFRONT_RELEASE_DAY_RUNBOOK.md §4"
