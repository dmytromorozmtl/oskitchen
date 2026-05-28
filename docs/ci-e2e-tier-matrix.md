# CI E2E tier matrix

Status: canonical money-path and smoke E2E tiers for Evolution Era 2 certification.

## Tier 0 — Default CI (`quality` job)

| Suite | Command / workflow | Secrets | Notes |
|-------|-------------------|---------|-------|
| Platform access denial | `tests/e2e/platform-access-denial.spec.ts` | None | Local `next start` on port 3000 |
| Marketing a11y | `tests/e2e/a11y-marketing.spec.ts` | None | Same server |
| Auth shell a11y | `tests/e2e/a11y-auth-shell.spec.ts` | Optional login secrets | Skips authed cases without credentials |
| Doc canon + public API + nav/maturity + integration honesty + channel golden path + typecheck slice + money-path + inventory + cron + KDS + marketing claims + scorecard CI wiring | `npm run test:ci:governance-bundles` | None | Full sequential composition (`era9-governance-bundles-partition-v1`); parallel job `governance-bundles-partitions` runs four partitions; `test:ci:scorecard:cert` last in `partition-product-kds` |
| Marketing vs matrix (`quality` job) | `npm run verify-claims` | None | `era7-marketing-claims-governance-v1`; forbidden phrases fail; roadmap terms warn (strict: `MARKETING_CLAIMS_STRICT=1`) |
| Era 3 RBAC wave 3 (costing, purchasing, export platform gates, incident access) | `npm run test:ci:rbac-wave3` | None | Costing + PO approval/bulk-price + export audit/DSR + export dashboard UI parity + incident manager platform access; **Era 17** `era17-costing-pilot-spotcheck-v1` cert chained |
| Public POST fail-closed (IoT, NPS, ROI guards + route wiring) | `npm run test:ci:public-post-fail-closed` | None | Guard unit tests + IoT/NPS/ROI route fail-closed contract tests |

## Tier 1 — Security DB (`security-db` job)

| Suite | Command | DB | Notes |
|-------|---------|-----|-------|
| Tenant isolation + RBAC | `npm run test:security` | Postgres service | Includes `tests/integration/storefront-order-pii.integration.test.ts` (pay-later PII + **online payment failure + retry** recovery), `tests/unit/order-creation-rbac.test.ts` (`orders.manage`), and `tests/unit/platform-email-bypass-closure.test.ts` (static scan: no runtime founder-email bypass outside bootstrap allowlist) |

## Tier 2 — Storefront money path (`storefront-money-path` job)

| Suite | Command | DB | Notes |
|-------|---------|-----|-------|
| Payment recovery unit | `npm run test:ci:storefront-money-path:unit` | No | Stripe retry/cancel guards |
| Pay-later checkout E2E | `npm run test:ci:storefront-money-path:e2e` | Postgres + seed | `storefront:seed-ci-checkout` then `e2e/storefront-checkout-pay-later.spec.ts` |
| Stripe live-card E2E (browser) | `npm run test:ci:storefront-money-path:stripe-e2e` | Postgres + seed + Stripe secret | **Optional tier** — runs only when repository secret `STRIPE_SECRET_KEY` is set and step sets `STOREFRONT_E2E_STRIPE=1`; `TURNSTILE_SECRET_KEY` must be unset |
| Storefront Stripe E2E policy summary | `npm run test:ci:storefront-stripe-e2e:policy` | None | **Always runs** at end of `storefront-money-path` job; writes `ci-artifacts/storefront-stripe-e2e-summary.json` with `PASSED` / `SKIPPED` / `FAILED` |

**CI workflow:** `.github/workflows/ci.yml` → job `storefront-money-path`.

**Stripe E2E policy (Era 7 Cycle 2):** `era7-storefront-stripe-optional-v1` + `era7-storefront-stripe-secrets-accept-v1` in `lib/ci/storefront-stripe-e2e-policy.ts`. Unit + pay-later E2E are **always-on** tier-2 certification. Stripe iframe checkout E2E does **not** run without `STRIPE_SECRET_KEY`; forks without the secret stay green when always-on certs pass and the policy artifact reports **`SKIPPED`** (explicit skip — not a silent pass). Artifact: `storefront-stripe-e2e-summary` (GitHub Actions).

**Wiring certification (tier 0):** `npm run test:ci:storefront-money-path:cert` → `tests/unit/storefront-money-path-ci-live.test.ts` + `tests/unit/storefront-stripe-e2e-policy.test.ts` + `tests/unit/storefront-stripe-e2e-secrets-policy-cert-live.test.ts` (included in `test:ci:governance-bundles`).

**Local focused run:**

```bash
export DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/kitchenos
export DIRECT_URL="$DATABASE_URL"
export ENCRYPTION_KEY="$(node -e 'console.log(Buffer.alloc(32,17).toString(\"base64\"))')"
npx prisma db push
npm run storefront:seed-ci-checkout
npm run test:ci:storefront-money-path:unit
npm run build && npm run start -- -p 3000 &
export PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000
export E2E_STOREFRONT_SLUG=hello
unset TURNSTILE_SECRET_KEY
npm run test:ci:storefront-money-path:e2e
```

## Tier 2b — POS money path (`pos-money-path` job)

| Suite | Command | DB | Notes |
|-------|---------|-----|-------|
| POS tablet UX (Era 17) | `npm run test:ci:pos-tablet-ux-era17:cert` | `era17-pos-tablet-ux-v1`; touch targets; checkout status UX; operator runbook; chained in pos-money-path cert |
| POS manager discount (Era 17) | `npm run test:ci:pos-manager-discount-era17:cert` | `era17-pos-manager-discount-v1`; explicit discount + COMPED RBAC; `pos-discount-guard`; chained in pos-money-path cert |
| POS operator runbook (Era 17) | `npm run test:ci:pos-operator-runbook-era17:cert` | `era17-pos-operator-runbook-v1`; software-only golden path; `npm run smoke:pos-operator-runbook`; chained in pos-money-path cert |
| POS receipt/shift spotcheck (Era 17) | `npm run test:ci:pos-receipt-shift-spotcheck-era17:cert` | `era17-pos-receipt-shift-spotcheck-v1`; closeout math + receipt consistency; chained in pos-money-path cert |
| POS checkout unit | `npm run test:ci:pos-money-path:unit` | No | Canonical checkout, terminal lifecycle, action RBAC, tablet UX policy |
| POS checkout integration (cash sale + PII) | `npm run test:ci:pos-money-path:integration` | Postgres | `checkoutPosSale` + encrypted PII + transaction row |
| POS inventory depletion | `npm run test:ci:pos-money-path:inventory` | Postgres | Recipe-linked stock decrement + pending when unconfigured |
| POS checkout E2E (browser) | `npm run test:ci:pos-money-path:e2e` | Postgres + auth secrets | **Optional tier** — runs only when repository secrets `E2E_LOGIN_EMAIL` and `E2E_LOGIN_PASSWORD` are set; optional `E2E_CI_POS_USER_ID` for `seed-e2e-pos-fixture` |
| POS browser E2E policy summary | `npm run test:ci:pos-browser-e2e:policy` | None | **Always runs** at end of `pos-money-path` job; writes `ci-artifacts/pos-browser-e2e-summary.json` with `PASSED` / `SKIPPED` / `FAILED` |

**CI workflow:** `.github/workflows/ci.yml` → job `pos-money-path`.

**Browser E2E policy (Era 4 Cycle 2 + Era 5 Cycle 5):** `era4-tier2b-optional-v1` + `era5-pos-e2e-secrets-accept-v1` in `lib/ci/pos-browser-e2e-policy.ts`. Unit + integration + inventory are **always-on** tier-2b certification. Browser E2E does **not** run without repository secrets `E2E_LOGIN_EMAIL` + `E2E_LOGIN_PASSWORD`; forks without secrets stay green when always-on certs pass and the policy artifact reports **`SKIPPED`** (explicit skip accepted — not a silent pass). Artifact: `pos-browser-e2e-summary` (GitHub Actions).

**Wiring certification (tier 0):** `npm run test:ci:pos-money-path:cert` → `tests/unit/pos-money-path-ci-live.test.ts` + `tests/unit/pos-browser-e2e-policy.test.ts` (included in `test:ci:governance-bundles`).

**Local focused run (unit + integration):**

```bash
export DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/kitchenos
export DIRECT_URL="$DATABASE_URL"
export ENCRYPTION_KEY="$(node -e 'console.log(Buffer.alloc(32,17).toString(\"base64\"))')"
export RUN_DB_INTEGRATION=1
npx prisma db push
npm run pos:seed-ci-checkout
npm run test:ci:pos-money-path:unit
npm run test:ci:pos-money-path:integration
```

**Local E2E (requires Supabase test user):**

```bash
export E2E_LOGIN_EMAIL=...
export E2E_LOGIN_PASSWORD=...
export E2E_SEED_USER_ID=<supabase-auth-uuid>
npm run build && npm run start -- -p 3000 &
export PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000
npx tsx scripts/seed-e2e-pos-fixture.ts
npm run test:ci:pos-money-path:e2e
```

**Not certified:** native card-terminal hardware, EMV, or pin-pad integrations — software POS cash/card-intent path only. **Not certified without secrets:** full dashboard Playwright POS checkout — see policy summary artifact when browser tier was `SKIPPED`.

**Inventory depletion channel policy (Era 4 Cycle 1 + Era 5 Cycle 3 + Era 17 Cycles 29–30):** **POS-only** (`lib/inventory/inventory-depletion-policy.ts`, `era4-pos-only-v1`); permanent GTM lock `era5-pos-only-gtm-lock-v1` (`deferred_locked` storefront hook); **Era 17 recert** `era17-pos-only-inventory-lock-v1`; **Era 17 sales training** `era17-pilot-inventory-messaging-v1` — `npm run smoke:pilot-inventory-messaging`. Storefront, public API, manual, and integration entrypoints must not call POS inventory impact recording. Live gate: `npm run test:ci:inventory-depletion:cert`.

## Tier 3 — Staging / preview (manual or scheduled)

| Suite | Workflow | Secrets |
|-------|----------|---------|
| Storefront public + pay-later + optional Stripe | `.github/workflows/playwright-storefront.yml` | `PLAYWRIGHT_BASE_URL`, `E2E_STORE_SLUG`, optional `STRIPE_SECRET_KEY` + `STOREFRONT_E2E_STRIPE=1` |
| Pilot golden path | `.github/workflows/e2e-pilot.yml` | Pilot credentials |
| KDS Realtime Playwright (optional) | `.github/workflows/playwright-kds-staging.yml` | `era11-kds-realtime-e2e-staging-workflow-v1` + `era13-kds-staging-workflow-secrets-align-v1`; `E2E_STAGING_BASE_URL`, `E2E_LOGIN_EMAIL`, `E2E_LOGIN_PASSWORD` (legacy `E2E_PASSWORD` alias), `ENABLE_KDS_V1_CERTIFIED=true`; artifact `kds-realtime-e2e-staging-summary` |
| KDS Realtime observation (manual Tier D/E) | Staging only — see `docs/kds-staging-smoke-checklist.md` | `PLAYWRIGHT_BASE_URL`, `E2E_LOGIN_*`, `ENABLE_KDS_V1_CERTIFIED`, Supabase public keys |

**Policy:** `era8-kds-realtime-e2e-staging-v1` + Era 11 `era11-kds-realtime-e2e-staging-v1` — Playwright spec `e2e/kds-realtime-staging.spec.ts` (Tier E); optional workflow `era11-kds-realtime-e2e-staging-workflow-v1` (`playwright-kds-staging.yml`); explicit `kds-realtime-e2e-staging-summary` artifact via `test:ci:kds-realtime-e2e-staging:policy`; wiring cert `test:ci:kds-realtime-e2e-staging:cert`.

## Not in default CI (by design)

| Suite | Reason |
|-------|--------|
| Full Stripe live checkout E2E without policy artifact | Superseded — optional tier in `storefront-money-path` when `STRIPE_SECRET_KEY` is set; check `storefront-stripe-e2e-summary` for `PASSED`/`SKIPPED`/`FAILED` |
| POS hardware terminal | No hardware certification claim; tier 2b covers software POS unit + DB integration; browser E2E when auth secrets configured |
| KDS Realtime Playwright E2E | `era11-kds-realtime-e2e-staging-v1` — optional staging browser tier; `PASSED`/`SKIPPED`/`FAILED` via `kds-realtime-e2e-staging-summary`; poll fallback unit-certified via `era6-kds-realtime-smoke-v1` |
| E2E Staging (daily workflow) | `.github/workflows/e2e-staging.yml` — **optional**; job runs only when `E2E_STAGING_BASE_URL` + `E2E_LOGIN_EMAIL` + (`E2E_LOGIN_PASSWORD` or legacy `E2E_PASSWORD`) are set; maps password to `E2E_LOGIN_PASSWORD` env (`era12-e2e-staging-secrets-align-v1`); runs `auth.setup` + `dashboard-auth` authed smoke (`era12-e2e-staging-auth-wiring-v1`) |

**E2E staging secrets policy (Era 12 Cycle 2):** `lib/ci/e2e-staging-secrets-era12-policy.ts` — aligns `e2e-staging.yml` and `closed-beta-gate.yml` with Playwright canonical `E2E_LOGIN_PASSWORD`; cert `test:ci:e2e-staging-secrets-era12:cert`. See `docs/GITHUB_E2E_STAGING_SECRETS.md`.

**E2E staging auth policy (Era 12 Cycle 4):** `lib/ci/e2e-staging-auth-era12-policy.ts` (`era12-e2e-staging-auth-wiring-v1`) — runs `e2e/auth.setup.ts` (`--project=setup`) then `e2e/dashboard-auth.spec.ts` (`chromium-authed`) in `e2e-staging.yml`; read-only authed smoke; excludes POS checkout and remediation IDOR; cert `test:ci:e2e-staging-auth-era12:cert`.

**Staging workflows first-run ops (Era 13 + Era 15):** `era13-staging-workflows-first-run-ops-v1` + `era15-staging-workflows-first-run-recert-v1` — optional `e2e-staging.yml`, `playwright-kds-staging.yml`, `closed-beta-gate.yml` `staging-smoke`; `JOB_OMITTED_SECRETS_MISSING` when secrets unset; `npm run smoke:staging-workflows`; cert `test:ci:staging-workflows-first-run-era15:cert` (in `test:ci:e2e-staging-secrets-era12:cert`). See `docs/GITHUB_E2E_STAGING_SECRETS.md`.

**Staging workflows first green evidence (Era 16 Cycle 14 + Era 17 P0 — not in default CI):** `era16-staging-workflows-first-green-v1` + **`era17-staging-workflows-first-green-v1`** — `npm run smoke:staging-workflows-first-green`; writes `artifacts/staging-workflows-first-green-summary.json` with **PASSED** / **FAILED** / **SKIPPED WITH REASON**; `firstGreenProofStatus` + GitHub run URL recording (`GITHUB_*_RUN_URL`); target ≥2/3 workflows PASSED; cert `test:ci:staging-workflows-first-green-era17:cert` (chained in `test:ci:e2e-staging-secrets-era12:cert`).

**Channel staging smoke (Era 12 Cycle 3 — not in default CI):** `lib/integrations/channel-golden-path-smoke-era12-policy.ts` (`era12-channel-golden-path-smoke-v1`) — `npm run smoke:woo-shopify`; optional `--skip-live`; requires `DATABASE_URL`; cert `test:ci:channel-golden-path-smoke-era12:cert` (in `test:ci:channel-golden-path:cert`). Not wired to `ci.yml`.

**Channel live smoke orchestrator (Era 16 Cycle 5 + Era 17 Woo/Shopify — not in default CI):** `lib/integrations/channel-live-smoke-era16-policy.ts` (`era16-channel-live-smoke-v1`), `lib/integrations/channel-live-smoke-woo-era17-policy.ts` (`era17-channel-live-smoke-woo-v1`), `lib/integrations/channel-live-smoke-shopify-era17-policy.ts` (`era17-channel-live-smoke-shopify-v1`) — `npm run smoke:woo-shopify-live` via `scripts/smoke-woo-shopify-live-era17.ts`; synthetic golden-path cert + Woo live + Shopify live; writes `artifacts/channel-live-smoke-summary.json`; cert `test:ci:channel-live-smoke-woo-era17:cert` + `test:ci:channel-live-smoke-shopify-era17:cert`.

**Channel GitHub workflow first green (Era 17 Cycle 9 — not in default CI):** `lib/integrations/channel-github-workflow-first-green-era17-policy.ts` (`era17-channel-github-workflow-first-green-v1`) — `.github/workflows/woo-shopify-staging-smoke.yml`; `npm run smoke:channel-github-workflow-first-green`; cert `test:ci:channel-github-workflow-first-green-era17:cert` (chained in `test:ci:channel-golden-path:cert`).

**Channel pilot playbook (Era 17 Cycle 10):** `lib/integrations/channel-pilot-playbook-era17-policy.ts` (`era17-channel-pilot-playbook-v1`) — [`docs/channel-pilot-playbook-era17.md`](./channel-pilot-playbook-era17.md); operator one-pager for qualified pilots; cert `test:ci:channel-pilot-playbook-era17:cert` (chained in `test:ci:commercial-pilot-runbook:cert`).

**Webhook security matrix (Era 16 Cycle 6):** `lib/security/webhook-security-era16-policy.ts` (`era16-webhook-security-matrix-v1`) — `lib/security/webhook-security-matrix.ts` inventories **46 webhook routes** with signature validation + replay protection classification; `npm run cert:webhook-security-era16` → `artifacts/webhook-security-matrix-summary.json`; cert `test:ci:webhook-security-era16:cert` (chained in `test:security`). Does **not** claim full replay monitoring ops.

**Webhook replay hardening (Era 16 Cycle 7):** `lib/security/webhook-replay-hardening-era16-policy.ts` (`era16-webhook-replay-hardening-v1`) — `lib/webhooks/webhook-ingress-replay-guard.ts` + `webhook_ingress_dedupe` **ingress dedupe** via `recordWebhookIngressOrDuplicate` for `/api/webhooks/uber-direct` and `/api/webhooks/slack/experiment-interactive`; duplicate deliveries return `{ ok: true, duplicate: true }`; cert `test:ci:webhook-replay-hardening-era16:cert` (chained in `test:ci:webhook-security-era16:cert`). Uber Direct remains **placeholder**.

**Era 17 webhook replay P1 expansion (Cycle 18):** `era17-webhook-replay-p1-expansion-v1` — Resend `/api/webhooks/resend` ingress dedupe + Uber Eats `/api/webhooks/uber-eats/orders` webhook_event_store cert; `npm run smoke:webhook-replay-p1-expansion`; cert `test:ci:webhook-replay-p1-expansion-era17:cert`. **Not** full replay monitoring ops.

**Era 17 commerce webhook incident drill (Cycle 21):** `era17-commerce-webhook-drill-v1` — Stripe/Woo/Shopify operator incident checklist; `npm run smoke:commerce-webhook-drill`; cert `test:ci:commerce-webhook-drill-era17:cert` (chained in `test:ci:webhook-security-era16:cert`). **awaiting_commerce_webhook_drill_execution** — tabletop/staging attestation required for `proof_passed`.

**Era 17 partner webhook docs (Cycle 26):** `era17-partner-webhook-docs-v1` — partner inbound/outbound webhook contract; `npm run smoke:partner-webhook-docs`; cert `test:ci:partner-webhook-docs-era17:cert` (chained in `test:ci:webhook-security-era16:cert`). **partner_webhook_docs_ready** — optional `PARTNER_WEBHOOK_ATTESTATION_EMAIL`; no production webhook SLA claim.

**Era 17 public POST abuse review (Cycle 23):** `era17-public-post-abuse-v1` — P1 route rate limits (experiment auto-conclude, IoT ingest, billing portal); cert `test:ci:public-post-abuse-era17:cert` (chained in `test:ci:public-post-fail-closed`).

**Mutation registry linter (Era 16 Cycle 8):** `lib/permissions/mutation-registry-linter-era16-policy.ts` + `lib/permissions/mutation-registry-linter.ts` (`era16-mutation-registry-linter-v1`) — static scan of `actions/` for Prisma-write server mutations missing registry helpers or documented allowlist markers; `npm run cert:mutation-registry-linter-era16` → `artifacts/mutation-registry-linter-summary.json`; cert `test:ci:mutation-registry-linter-era16:cert` (chained in `test:security`). Blocks **new** ungoverned sensitive actions; does **not** replace wave-4 RBAC tests.

**Commercial pilot evidence pack (Era 16 Cycle 9):** `lib/commercial/commercial-pilot-evidence-pack-era16-policy.ts` + `lib/commercial/commercial-pilot-evidence-pack.ts` (`era16-commercial-pilot-evidence-pack-v1`) — role checklists (owner, manager, cashier, kitchen, support_admin); allowed/forbidden features; rollback + escalation; `npm run cert:commercial-pilot-evidence-era16` → `artifacts/commercial-pilot-evidence-pack-summary.json`; cert `test:ci:commercial-pilot-evidence-era16:cert` (chained in `test:ci:commercial-pilot-runbook:cert`).

## Money-path certification mapping

| Path | Tier 2 unit | Tier 2 E2E | Tier 1 integration |
|------|-------------|------------|-------------------|
| Storefront pay-later checkout | — | ✅ pay-later spec | ✅ PII + submit |
| Storefront online checkout failure + retry | ✅ `storefront-payment-recovery.test.ts` | — | ✅ `storefront-order-pii.integration.test.ts` |
| POS cash checkout | ✅ `pos-checkout-canonical` + terminal lifecycle | ✅ when auth secrets | ✅ `order-entrypoint-pii` POS test |
| POS recipe inventory depletion | ✅ `pos-recipe-depletion.test.ts` | — | ✅ `pos-inventory-depletion.integration.test.ts` |
| Storefront / API / manual inventory depletion | — | — | **Not certified** — POS-only policy (`era4-pos-only-v1`; Era 4 Cycle 1) |
| Stripe webhook fail-closed | — | — | ✅ in `test:security` |
| Webhook security matrix (46 routes) | ✅ `webhook-security-matrix.test.ts` | — | ✅ `test:ci:webhook-security-era16:cert` in `test:security` |
| Webhook replay hardening (Uber Direct + Slack) | ✅ `webhook-ingress-replay-guard.test.ts` | — | ✅ `test:ci:webhook-replay-hardening-era16:cert` |

## Tier 1b — Cron hygiene (`quality` job)

| Suite | Command | Notes |
|-------|---------|-------|
| Production manifest reconciliation | `npm run validate:production-crons` | Manifest ↔ disk ↔ `vercel.json` ↔ archive |
| Route inventory cap | `npm run validate:cron-inventory` | **0 active experimental** under `app/api/cron` (Era 4 archive) |
| Full hygiene bundle | `npm run test:ci:cron-hygiene` | Reconciliation + inventory + `runCronRoute` scan + production gate |
| Era 4 archive surface cert | `test:ci:cron-hygiene:cert` (chained) | `tests/unit/cron-archive-era4-cert-live.test.ts` |
| Era 9 cron surface recert | `test:ci:cron-hygiene:cert` (chained) | `tests/unit/cron-surface-era9-cert-live.test.ts` |
| Era 14 cron surface recert | `test:ci:cron-hygiene-era14:cert` | `era14-cron-surface-recert-v1`; operator checklist + `smoke:cron-surface`; chains into `test:ci:cron-hygiene:cert` |

**Production schedule:** 16 allowlisted slugs in `services/cron/production-manifest.ts` (includes `incident-remediation-reminders`). **Active App Router surface (Era 4 Cycle 4):** **16 production routes only** under `app/api/cron/`; **121+ experimental handlers** moved to `archive/cron-routes/` per policy `era4-active-production-only-v1` (`lib/cron/cron-surface-policy.ts`). **Era 9 Cycle 3 recert:** `era9-cron-surface-recert-v1` (`lib/cron/cron-surface-era9-policy.ts`) — 0 experimental on disk; pilot preflight forbids `ENABLE_EXPERIMENTAL_CRONS=true`. **Era 14 Cycle 4 recert:** `era14-cron-surface-recert-v1` (`lib/cron/cron-surface-era14-policy.ts`) — re-validates archive posture; `docs/cron-surface-honesty-checklist.md`; `npm run smoke:cron-surface`. Experimental paths remain blocked in production unless `ENABLE_EXPERIMENTAL_CRONS=true` (`runCronRoute`).

**Wiring certification (tier 0):** `npm run test:ci:cron-hygiene:cert` → `tests/unit/cron-hygiene-ci-live.test.ts` + `tests/unit/cron-archive-era4-cert-live.test.ts` + `tests/unit/cron-surface-era9-cert-live.test.ts` + `tests/unit/cron-surface-era14-cert-live.test.ts` (included in `test:ci:governance-bundles`). Full reconciliation runs in `quality` via `validate:production-crons` and `validate:cron-inventory`.

## Tier 1c — KDS v1 scope (`quality` job via governance bundles)

| Suite | Command | DB | Notes |
|-------|---------|-----|-------|
| Scope + wiring cert | `npm run test:ci:kds-v1:cert` | No | `docs/kds-v1-scope.md` sections, canonical index, permissioned actions |
| RBAC + rollout gate + contract | `npm run test:ci:kds-v1:unit` | No | `kitchen-daily-kds-rbac`, `kds-v1-gate`, `kds-ticket.contract` |
| Queue → bump integration | `npm run test:ci:kds-v1:integration` | Postgres + `RUN_DB_INTEGRATION=1` | **`kds-v1-prototype` CI job** — queue visibility, bump status, allergen conflict |

**Canonical scope:** `docs/kds-v1-scope.md` — daily-service order tickets only; not rush-hour, multi-station, or hardware certified.

**Wiring certification (tier 0):** `test:ci:kds-v1:cert` + `test:ci:kds-v1:unit` + `test:ci:kds-v1:prototype:cert` chained in `test:ci:governance-bundles`.

## Tier 1c4 — Page maturity sweep (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Page maturity honesty | `npm run test:ci:page-maturity-sweep` | Preview/placeholder in-page copy; inline banner exceptions |
| Page maturity wiring cert | `npm run test:ci:page-maturity-sweep:cert` | Layout wiring, policy id, matrix alignment |

**Policy (Era 4 Cycle 12 + Era 14 Cycle 1):** `lib/navigation/page-maturity-sweep-policy.ts` (`era4-page-maturity-sweep-v1`) + `lib/navigation/nav-page-maturity-era14-policy.ts` (`era14-nav-page-maturity-recert-v1`) — focused nav audit for preview/placeholder honesty. **UI:** `PageMaturityRouteNotice` + existing nav badges (`test:ci:nav-governance`).

**Wiring certification (tier 0):** `test:ci:page-maturity-sweep:cert` + `test:ci:page-maturity-sweep` + `test:ci:nav-page-maturity-era14:cert` chained in `test:ci:governance-bundles`.

## Tier 1c3 — Mutation access consolidation (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Domain mutation registry + denial logger | `npm run test:ci:mutation-access-consolidation` | Registry paths, wave-4 `requireMutationPermission` + `logDomainMutationDenied` wiring |
| Consolidation wiring cert | `npm run test:ci:mutation-access-consolidation:cert` | Policy id, governance bundle, RBAC architecture §2a; chains `mutation-access-era11-cert-live` |
| Era 11 mutation access recert | `npm run test:ci:mutation-access-era11:cert` | `era11-mutation-access-recert-v1`; production calendar inline gate + `production_calendar.update_task_status` |
| Era 14 mutation access recert | `npm run test:ci:mutation-access-era14:cert` | `era14-mutation-access-consolidation-recert-v1`; registry delegation + scoped-helper checklist; chains into consolidation cert |

**Policy (Era 4 Cycle 11):** `lib/permissions/mutation-access-policy.ts` (`era4-mutation-access-consolidation-v1`). **Era 11 recert:** `lib/permissions/mutation-access-era11-policy.ts` (`era11-mutation-access-recert-v1`). **Era 14 recert:** `lib/permissions/mutation-access-era14-policy.ts` (`era14-mutation-access-consolidation-recert-v1`). **Wave-4 action tests:** `test:ci:rbac-wave4` — chained at end of `test:security` (security-db job); wiring cert `test:ci:rbac-wave4:cert` + **Era 9 Cycle 4 recert** `era9-rbac-wave4-recert-v1` (`lib/security/rbac-wave4-era9-policy.ts`); not in governance bundles.

**Wiring certification (tier 0):** `test:ci:mutation-access-consolidation:cert` + `test:ci:mutation-access-consolidation` chained in `test:ci:governance-bundles`.

## Tier 1c2 — KDS staging operational smoke (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Staging smoke policy + wiring | `npm run test:ci:kds-staging-smoke` | Checklist tiers, `smoke:kds-daily` script, permissioned actions |
| Staging smoke wiring cert | `npm run test:ci:kds-staging-smoke:cert` | Policy id, governance bundle, maturity matrix honesty |
| Era 15 KDS staging smoke recert | `npm run test:ci:kds-staging-smoke-era15:cert` | `era15-kds-staging-smoke-recert-v1`; `npm run smoke:kds-staging`; chains into staging-smoke cert |

**Policy (Era 4 Cycle 10):** `lib/kitchen/kds-staging-smoke-policy.ts` (`era4-kds-staging-smoke-v1`). **Era 10 recert:** `era10-kds-staging-smoke-recert-v1`. **Era 15 recert:** `era15-kds-staging-smoke-recert-v1` — bump/recall integration + optional Playwright workflow secrets parity; **not in default CI**. **Prerequisites:** `test:ci:kds-v1:integration`. **Staging/manual:** `docs/kds-staging-smoke-checklist.md`; `npm run smoke:kds-staging`; optional `npm run smoke:kds-daily -- --ephemeral` with `DATABASE_URL`. **Not certified:** rush-hour, multi-station, Playwright realtime KDS in default CI.

**Wiring certification (tier 0):** `test:ci:kds-staging-smoke:cert` + `test:ci:kds-staging-smoke` chained in `test:ci:governance-bundles`.

**Operational sign-off (Era 16 Cycle 10):** `lib/operations/operational-signoff-era16-policy.ts` + `lib/operations/operational-signoff-summary.ts` (`era16-operational-signoff-v1`) — unified KDS + production calendar sign-off; `npm run smoke:operational-signoff-era16` → `artifacts/operational-signoff-summary.json` with **PASSED** / **FAILED** / **SKIPPED WITH REASON**; cert `test:ci:operational-signoff-era16:cert` (chained in `test:ci:kds-staging-smoke:cert`). Manual staging UI requires `OPERATIONAL_SIGNOFF_STAGING_URL` + `OPERATIONAL_SIGNOFF_OPERATOR_EMAIL`. **Not** rush-hour certified.

**Era 17 Playwright GitHub proof (Cycle 15):** `era17-kds-staging-playwright-proof-v1` — `npm run smoke:kds-staging-playwright` → `artifacts/kds-staging-playwright-proof-summary.json`; requires `GITHUB_KDS_STAGING_RUN_URL` + `GITHUB_KDS_STAGING_RUN_OUTCOME=PASSED` after `playwright-kds-staging.yml` dispatch; cert `test:ci:kds-staging-playwright-proof-era17:cert`. **Not** default-CI Playwright or rush-hour claim.

**Era 17 KDS qualified sales one-pager (Cycle 27):** `era17-kds-qualified-sales-onepager-v1` — `docs/kds-qualified-sales-onepager-era17.md`; sales-safe pilot wording; cert `test:ci:kds-qualified-sales-onepager-era17:cert` (in `test:ci:kds-staging-smoke:cert`). **Not** rush-hour or Toast-class KDS claim.

**Era 17 operational sign-off staging proof (Cycle 16):** `era17-operational-signoff-staging-proof-v1` — `npm run smoke:operational-signoff-staging` → `artifacts/operational-signoff-staging-proof-summary.json`; requires `OPERATIONAL_SIGNOFF_STAGING_URL` + `OPERATIONAL_SIGNOFF_OPERATOR_EMAIL`; manual attestation via `OPERATIONAL_SIGNOFF_KDS_MANUAL=passed` + `OPERATIONAL_SIGNOFF_PRODUCTION_CALENDAR_MANUAL=passed`; cert `test:ci:operational-signoff-staging-proof-era17:cert` (in `test:ci:operational-signoff-era16:cert`). **Not** rush-hour certified.

**Era 17 production calendar operator drill (Cycle 17):** `era17-production-calendar-operator-drill-v1` — `npm run smoke:production-calendar-drill` → `artifacts/production-calendar-operator-drill-summary.json`; requires `PRODUCTION_CALENDAR_DRILL_STAGING_URL` + `PRODUCTION_CALENDAR_DRILL_OPERATOR_EMAIL`; attestation via `PRODUCTION_CALENDAR_DRILL_MANUAL=passed`; cert `test:ci:production-calendar-operator-drill-era17:cert` (in `test:ci:production-calendar-move-ui:cert`). **Not** drag-and-drop or rush-hour claim.

## Tier 1c3 — Production calendar operator (`partition-product-kds` via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Production calendar move UI cert | `npm run test:ci:production-calendar-move-ui:cert` | Era 8/10 move, cross-week, status workflow + era13/era15 operator depth |
| Era 15 production calendar recert | `npm run test:ci:production-calendar-operator-depth-era15:cert` | `era15-production-calendar-operator-recert-v1`; `npm run smoke:production-calendar`; manual checklist |

**Policy:** `era13-production-calendar-operator-depth-v1` + `era15-production-calendar-operator-recert-v1`. **Not certified:** drag-and-drop, KDS sync, delete-task UI, rush-hour production, default CI browser E2E. **Manual:** `docs/production-calendar-operator-checklist.md`.

| KDS realtime / poll smoke unit | `npm run test:ci:kds-realtime-smoke` | Poll 15s / 60s intervals, channel name, status label wiring |
| KDS realtime smoke cert | `npm run test:ci:kds-realtime-smoke:cert` | Policy `era6-kds-realtime-smoke-v1`, governance bundle, Tier D checklist |

**Policy (Era 6 Cycle 2):** `lib/kitchen/kds-realtime-smoke-policy.ts`. **Certified:** poll fallback interval and Supabase channel naming in unit tests. **Not certified:** rush-hour, Playwright Realtime E2E, production Realtime SLO.

**Wiring certification (tier 0):** `test:ci:kds-realtime-smoke:cert` + `test:ci:kds-realtime-smoke` chained in `test:ci:governance-bundles`.

## Tier 2c — KDS v1 prototype (`kds-v1-prototype` job)

| Suite | Command | DB | Notes |
|-------|---------|-----|-------|
| Queue → bump + allergen conflict | `npm run test:ci:kds-v1:integration` | Postgres service | Proves `getTodayQueue` ticket visibility and allergen flag; no Realtime E2E |

**CI workflow:** `.github/workflows/ci.yml` → job `kds-v1-prototype`.

**Rollout gate:** `lib/kitchen/kds-v1-gate.ts` — non-production requires `ENABLE_KDS_V1_CERTIFIED=true`; production daily-service enabled by default.

## Tier 1d — Nav / maturity governance (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Nav wiring cert | `npm run test:ci:nav-governance:cert` | `NAV_MATURITY_RULES`, sidebar filter wiring, matrix doc alignment |
| Nav maturity unit | `npm run test:ci:nav-governance` | Placeholder hide, preview badges, release navigation |

**Canonical rules:** `lib/navigation/nav-maturity-governance.ts` aligned with `docs/feature-maturity-matrix.md`.

**Wiring certification (tier 0):** `test:ci:nav-governance:cert` + `test:ci:nav-governance` chained in `test:ci:governance-bundles`.

## Tier 1e — Integration honesty (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Integration wiring cert | `npm run test:ci:integration-honesty:cert` | Registry/channel/nav alignment, UI placeholder labeling |
| Integration honesty unit | `npm run test:ci:integration-honesty` | Marketplace PLACEHOLDER registry, partner service fail-closed |

**Canonical registry:** `lib/integrations/integration-honesty.ts` — DoorDash, Grubhub, Uber Eats, Uber Direct marked placeholder; no live connector claims.

**Wiring certification (tier 0):** `test:ci:integration-honesty:cert` + `test:ci:integration-honesty` chained in `test:ci:governance-bundles`.

## Tier 1e2 — Woo / Shopify golden path (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Channel golden-path wiring cert | `npm run test:ci:channel-golden-path:cert` | Policy ids `era4-channel-golden-path-v1` + era12/era14 recerts; scripts, fixtures, honest scope in matrix + maturity |
| Era 14 channel golden-path recert | `npm run test:ci:channel-golden-path-era14:cert` | `era14-channel-golden-path-recert-v1`; honesty checklist; chains into channel cert |
| Channel golden-path unit | `npm run test:ci:channel-golden-path` | Normalize → webhook processor → `externalOrder` + channel import staging (mocked); channel certification + webhook signature helpers |

**Golden-path policy (Era 4 Cycle 5 + Era 12 + Era 14 recert):** `lib/integrations/channel-golden-path-policy.ts` (`era4-channel-golden-path-v1`); **Era 12:** `era12-channel-golden-path-recert-v1`; **Era 14:** `era14-channel-golden-path-recert-v1` — `docs/channel-golden-path-honesty-checklist.md`; `npm run smoke:channel-golden-path`. Certifies `order_hub_visibility` via `loadOrderHubPageData` + `externalOrderListWhereForOwner`. Webhook → normalized order → `externalOrder` → channel import staging → order hub external list. **Does not certify** automatic kitchen `Order` creation from Woo/Shopify webhooks (`kitchenOrderAutoCreateFromWebhook: false`). Staging/live store proof: `npm run smoke:woo-shopify` (optional `--skip-live`; not in default CI).

**Wiring certification (tier 0):** `test:ci:channel-golden-path:cert` + `test:ci:channel-golden-path` chained in `test:ci:governance-bundles` after integration honesty.

## Tier 1e3 — Typecheck slices (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Typecheck slice wiring cert | `npm run test:ci:typecheck-slice:cert` | Policy `era11-typecheck-slice-v3`, `tsconfig.base.json`, four slice tsconfigs, `typecheck:full` + slice scripts |
| Era 15 typecheck slice recert | `npm run test:ci:typecheck-slice-era15:cert` | `era15-typecheck-slice-recert-v1`; `smoke:typecheck-slices`; full gate unchanged |
| Era 16 typecheck slice reporting | `npm run test:ci:typecheck-slice-era16:cert` | `era16-typecheck-slice-report-v1` (`lib/ci/typecheck-slice-report.ts`); `typecheck:report:slices`; summary artifact; full gate unchanged |
| Typecheck slice unit | `npm run test:ci:typecheck-slice` | Policy registry, strict base inheritance |

**Local fast path:** `npm run typecheck:slice:*` — 6GB heap per slice. **CI canonical gate:** `quality` job → `npm run typecheck` → `typecheck:full` (8GB, full repo).

**Policy:** `era11-typecheck-slice-v3` (extends `era5-typecheck-slice-v2`). **Parallel CI job (Era 6 Cycle 3):** `typecheck-slices` job → `npm run typecheck:ci:slices` (all four slices at 6GB via Era 16 report runner); policy `era6-typecheck-slice-ci-v1`; does **not** replace full typecheck. **Era 16:** `era16-typecheck-slice-report-v1` — per-slice PASSED/FAILED summary in `artifacts/typecheck-slice-summary.json`. **Era 11:** adds `platform-auth` slice.

**Wiring certification (tier 0):** `test:ci:typecheck-slice:cert` + `test:ci:typecheck-slice` chained in `test:ci:governance-bundles`.

## Tier 1e4 — Enterprise procurement honesty (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Enterprise procurement wiring cert | `npm run test:ci:enterprise-procurement:cert` | Policy `era4-procurement-honesty-v1`, pack on disk, canon index + devops links |
| Era 15 enterprise procurement recert | `npm run test:ci:enterprise-procurement-era15:cert` | `era15-enterprise-procurement-recert-v1`; `smoke:enterprise-procurement`; no SSO/SOC2 delivery claims |
| Enterprise procurement unit | `npm run test:ci:enterprise-procurement` | Required pack sections; no forbidden false certification claims |

**Canonical pack:** [`docs/enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) — SSO/SCIM/SOC2 roadmaps, audit, tenant isolation, retention, backup, incident, questionnaire, FAQ.

**Wiring certification (tier 0):** `test:ci:enterprise-procurement:cert` + `test:ci:enterprise-procurement` chained in `test:ci:governance-bundles`.

| Enterprise identity annual review cert | `npm run test:ci:enterprise-identity-roadmap:cert` | Policy `era6-enterprise-identity-roadmap-v1`, annual review section, delivery markers |
| Enterprise identity roadmap unit | `npm run test:ci:enterprise-identity-roadmap` | roadmap_only decision; forbidden delivery claims |

**Era 6 Cycle 5:** SSO/SCIM/SOC2 **delivery** remains roadmap_only — no implementation in this cycle.

**Wiring certification (tier 0):** `test:ci:enterprise-identity-roadmap:cert` + `test:ci:enterprise-identity-roadmap` chained in `test:ci:governance-bundles`.

## Tier 1e5 — Cross-channel rewards honesty (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Cross-channel rewards wiring cert | `npm run test:ci:cross-channel-rewards:cert` | Policy `era4-cross-channel-rewards-v1` + GTM lock `era6-dual-ledger-gtm-lock-v1` + **Era 10 recert** `era10-cross-channel-rewards-recert-v1` |
| Cross-channel rewards unit | `npm run test:ci:cross-channel-rewards` | POS `checkoutPosSale` kitchen gift card + loyalty wiring; storefront `redeemGiftCardPartial` not imported outside service |

**Policy (Era 4/6/10/14):** `lib/rewards/cross-channel-rewards-policy.ts` (`era4-cross-channel-rewards-v1`, `era6-dual-ledger-gtm-lock-v1`); **Era 10:** `era10-cross-channel-rewards-recert-v1`; **Era 14:** `era14-cross-channel-rewards-recert-v1` (`docs/cross-channel-rewards-honesty-checklist.md`). **Certified:** POS applies `services/gift-cards` + `services/loyalty` at checkout. **Not certified:** unified gift card / loyalty balance across storefront and POS (dual ledger; unification `deferred_locked`; no cross-channel Playwright E2E in `ci.yml`).

**Wiring certification (tier 0):** `test:ci:cross-channel-rewards:cert` + `test:ci:cross-channel-rewards` in `test:ci:governance-bundles:partition-money-path`.

## Tier 1f — Doc canon (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Doc canon wiring cert | `npm run test:ci:doc-canon:cert` | Canonical index, deprecated-family notice, gateway banners, governance bundle alignment |
| Doc canon unit | `npm run test:ci:doc-canon` | Required canonical paths exist, scorecard sections, gateway deprecation banners |

**Canonical index:** `docs/canonical-doc-index.md` — 12 core + 2 era docs; ~1,300+ historical audits superseded via `docs/_DEPRECATED_AUDIT_FAMILY.md`.

**Wiring certification (tier 0):** `test:ci:doc-canon:cert` + `test:ci:doc-canon` chained first in `test:ci:governance-bundles`.

## Tier 1h — Scorecard governance (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Scorecard wiring cert | `npm run test:ci:scorecard:cert` | Cross-doc Era 3 score consistency, governance cert chain, re-audit deferral |

**Canonical sources:** `docs/canonical-doc-index.md`, `docs/full-strategic-reaudit-2026-05-27.md` §Step 20, `docs/next-master-prompt-input-2026-05-27.md`.

**Wiring certification (tier 0):** `test:ci:scorecard:cert` chained last in `test:ci:governance-bundles`.

## Tier 1g — Public API v1 contracts (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Era 17 public API per-route scope | `npm run test:ci:public-api-per-route-scope-era17:cert` | `era17-public-api-per-route-scope-v1`; guardPublicApiV1Resource; high-risk write scopes first |
| Era 16 public API partner confidence | `npm run test:ci:public-api-partner-confidence-era16:cert` | `era16-public-api-partner-confidence-v1`; partner checklist; OpenAPI bearer; live smoke skip honesty |
| Public API wiring cert | `npm run test:ci:public-api-v1:cert` | Eight v1 routes, `guardPublicApiV1Resource` fail-closed + scope 403, unit bundle script alignment; chains era17 scope + era16 partner cert |
| Public API v1 unit | `npm run test:ci:public-api-v1` | Auth, pagination, tenant scope, cross-tenant isolation, orders/recipes/webhooks contracts |

**Canonical guard:** `lib/api-public/guard.ts` — 401 without bearer auth, 429 rate limit, 503 when distributed rate limiting misconfigured.

**Wiring certification (tier 0):** `test:ci:public-api-v1:cert` + `test:ci:public-api-v1` chained in `test:ci:governance-bundles`.

**Era 16 partner readiness:** `era16-public-api-partner-confidence-v1` — integration-led pilot checklist; artifact `artifacts/public-api-partner-confidence-summary.json`.
