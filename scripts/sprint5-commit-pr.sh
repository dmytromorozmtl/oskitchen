#!/usr/bin/env bash
# Creates Sprint 5 commit and opens PR (requires git remote).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not a git repository. From project root:"
  echo "  git init && git remote add origin <url>"
  echo "  git checkout -b feat/sprint5-storefront"
  echo "  Then re-run: ./scripts/sprint5-commit-pr.sh"
  exit 1
fi

BRANCH="${SPRINT5_BRANCH:-feat/sprint5-storefront}"
BASE="${SPRINT5_BASE:-main}"

git checkout -B "$BRANCH"
git add -A
git status

if git diff --cached --quiet; then
  echo "Nothing to commit."
  exit 0
fi

git commit -m "$(cat <<'EOF'
feat(storefront): Sprint 5 — visual CI, experiments, webhook log, media, edge A/B

- Playwright visual regression and CI workflow
- Theme experiment analytics, Advanced dashboard v2 (?days, lift, CSV, significance)
- Page publish webhook delivery log with retention cron and redeliver
- Media library → Product.image (form picker, table quick-pick, E2E)
- Edge Config theme experiments (middleware sticky arm, sync on save, analytics arms)
- Phase F: SRM Slack alerts, experiment audit log on Advanced, Apply winner, GA4 parity, ops scripts

EOF
)"

echo "Pushing $BRANCH..."
git push -u origin HEAD

if command -v gh >/dev/null 2>&1; then
  gh pr create --base "$BASE" --title "feat(storefront): Sprint 5 — visual, experiments, webhook, media, edge" --body "$(cat <<'EOF'
## Summary
- **Visual CI:** Playwright baselines for theme/checkout/nav fixtures; `npm run test:visual`.
- **Experiments:** Daily funnel charts, lift card, CSV export, z-test significance on Advanced.
- **Webhook log:** Delivery table on Settings, redeliver (OWNER), 90d retention cron.
- **Menu media (P.4):** `MediaUrlField` on products, table quick-pick, storefront revalidation.
- **Edge A/B (P.5):** `THEME_EXPERIMENT_EDGE=1` + Edge Config sync; middleware `kos_ab_theme` + arm cache tags; fallback assigner.

## Test plan
- [ ] `./scripts/sprint5-smoke.sh`
- [ ] `npm run test:visual` (or CI baseline job)
- [ ] Authed E2E: `E2E_LOGIN_EMAIL` + `E2E_LOGIN_PASSWORD` → menu-item-media + webhook specs
- [ ] Staging edge: `THEME_EXPERIMENT_EDGE=1`, `EDGE_CONFIG_ID`, save experiment on Advanced
- [ ] `npm run ops:phase-f-prod-wiring` — log drains + DLQ drill + weekly report dry-run
- [ ] `npm run test:e2e:sprint5-lifecycle` (E2E_LOGIN_EMAIL/PASSWORD)
- [ ] Manual: Products table pick → image on `/s/{slug}/products/...`
- [ ] Manual: Publish page → webhook log `delivered` / `failed`

## Vercel env (staging)
- `THEME_EXPERIMENT_EDGE=1`
- Edge Config linked → `EDGE_CONFIG`, `EDGE_CONFIG_ID`
- `VERCEL_API_TOKEN` (+ optional `VERCEL_TEAM_ID`) for experiment sync

EOF
)"
else
  echo "Install GitHub CLI (gh) to open PR automatically, or open PR manually from $BRANCH."
fi
