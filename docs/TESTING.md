# Testing

OS Kitchen uses **Vitest** for unit tests and **Playwright** for end-to-end smoke tests.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run test` | Alias for `test:unit` |
| `npm run test:unit` | Vitest (CI-friendly, no watch) |
| `npm run test:pos-rbac` | Focused POS permission-negative Vitest suite (`vitest.pos.config.ts`) |
| `npm run verify:install-chain` | Post-install integrity checks for Vitest/Vite runner files |
| `npm run test:e2e` | Playwright headless |
| `npm run test:e2e:dashboard` | Playwright — auth setup + dashboard + POS checkout flow |
| `npm run test:e2e:storefront` | Playwright — `e2e/storefront.spec.ts` only |
| `npm run test:visual` | Playwright visual baselines (`tests/visual`, project `visual`) |
| `npm run test:visual:update` | Regenerate visual snapshot PNGs |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run db:seed:e2e-pos` | Prisma — ensure POS E2E register / staff / catalog / PRO plan |
| `npm run db:prune:e2e-pos-orders` | Prune POS E2E orders (dry-run unless `-- --execute`) |
| `npm run smoke:production-tenant` | Hosted HTTP smoke + optional tenant preflight (warnings allowed) |
| `npm run smoke:production-tenant:strict` | Same smoke, but fails on all blocking tenant readiness gates |
| `npm run pilot:readiness -- --email=owner@pilot.com` | One-command real pilot strict-readiness check (DB preflight + hosted strict smoke) |
| `npm run final:100` | Final truth gate for live readiness: health, prod env presence, tenant smoke, strict pilot target, manual flags |

## Unit tests

- Location: `tests/unit/**/*.test.ts`
- Config: `vitest.config.ts`
- Covers: action result shape, plan gating helpers, ingredient demand aggregation.

Run:

```bash
npm run test:unit
```

### POS RBAC (focused)

Narrow Vitest config for POS permission gates — faster than the full unit suite and run in CI after `npm test`.

```bash
npm run test:pos-rbac
```

If Vitest fails immediately with `Cannot find module '.../vitest/suppress-warnings.cjs'` or missing `chai`, the local `node_modules` tree is incomplete. Repair with a lockfile install (`npm ci`) and confirm `npm run verify:install-chain` passes. Postinstall runs `scripts/ensure-vitest-suppress-warnings-shim.cjs` to recreate the Vitest preload stub when the `vitest` package folder exists but the file is missing.

If `npm run typecheck` OOMs or reports missing `date-fns` / `zustand` / `next` / `typescript`, run `npm ci` and re-run `npm run verify:install-chain`. The `typecheck` script already sets `--max-old-space-size=8192`; for other Node commands use `NODE_OPTIONS=--max-old-space-size=8192` (see `scripts/predeploy-verify.sh`).

Upload malware/content-safety scans run by default on all hardened upload paths (`lib/upload-policy/malware-scan.ts`). Disable locally with `UPLOAD_MALWARE_SCAN=0`. Optional external webhook: `UPLOAD_MALWARE_SCAN_EXTERNAL=1` and `UPLOAD_MALWARE_SCAN_URL` (JSON `{ "safe": true }` or `{ "safe": false, "threat": "..." }`).

## End-to-end

- Location: `e2e/**/*.spec.ts` (Playwright default) and `tests/e2e/**/*.spec.ts` (CI critical paths)
- Config: `playwright.config.ts`
- Default `baseURL`: `http://127.0.0.1:3000`

### Quick reference — credentials

| Variable | Used for |
|----------|----------|
| `E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD` | Dashboard + POS checkout (`chromium-authed`) |
| `E2E_STOREFRONT_SLUG` | Public storefront slug (default `hello`) |
| `E2E_SEED_USER_ID` | `db:seed:e2e-pos` fixture user UUID |
| `CRON_SECRET` | Cron route tests (optional) |
| `STOREFRONT_E2E_STRIPE=1` + `STRIPE_SECRET_KEY` | Live Stripe iframe checkout (optional CI tier when secret configured) |
| `PLAYWRIGHT_BASE_URL` / `SMOKE_BASE_URL` | Remote smoke against staging/production |

### Storefront order E2E

`tests/e2e/storefront-order-flow.spec.ts` — guest menu → cart API → pay-later checkout → order confirmation.

```bash
# Turnstile must be off locally
unset TURNSTILE_SECRET_KEY
npm run dev:safe
E2E_STOREFRONT_SLUG=hello npx playwright test tests/e2e/storefront-order-flow.spec.ts --project=ci-critical-paths
```

### OpenAPI docs

- Spec JSON: `/api/openapi.json` (auto-scanned from `app/api/**/route.ts`)
- Swagger UI: `/api/docs`

### Integration tests (Vitest)

```bash
npm run test:unit   # includes tests/integration/*.integration.test.ts
```

Stripe webhook contract + OpenAPI route count: `tests/integration/stripe-checkout.integration.test.ts`.

### POS keyboard shortcuts

On `/dashboard/pos/terminal`: **F1** search · **F2** add first product · **F3** cash · **F4** complete · **Esc** clear cart.

### CI-critical-paths project

Runs all `tests/e2e/*.spec.ts` except pilot journeys. Includes:

- `public-health.spec.ts`, `platform-access-denial.spec.ts`
- `storefront-order-flow.spec.ts`, `webhook-woo-async.spec.ts` (cron 401)
- `pos-production.spec.ts` (health smoke), `signup-order.spec.ts` (signup page)

Prerequisites:

```bash
npx playwright install   # once per machine
npm run dev              # in another terminal
npm run test:e2e
```

Smoke suite verifies public pages, help routes, and unauthenticated dashboard redirect.

### Authenticated dashboard E2E

When **`E2E_LOGIN_EMAIL`** and **`E2E_LOGIN_PASSWORD`** are set (shell **or** merged from `.env` / `.env.local` — see
`e2e/load-playwright-env.ts`), Playwright adds a **`setup`** project that signs in once and writes
**`e2e/.auth/user.json`**, then a **`chromium-authed`** project reuses that storage for **`e2e/dashboard-auth.spec.ts`**
(home overview, Order hub, mapping activity). The default **`chromium`** project ignores those files so public smoke
tests stay unauthenticated.

If those variables are **unset**, the auth storage file is removed when the config loads (avoids stale sessions), and
only the public **`chromium`** project runs.

| Variable | Description |
|----------|-------------|
| `E2E_LOGIN_EMAIL` | Existing Supabase user email |
| `E2E_LOGIN_PASSWORD` | That user’s password |

Requires `npm run dev` (or `start`) against a database where the user has dashboard access. **`e2e/.auth/`** is
gitignored — do not commit `user.json`.

### Remote E2E (GitHub Actions)

Workflow **`.github/workflows/e2e-remote-smoke.yml`** (`workflow_dispatch`):

1. **Actions → E2E remote smoke → Run workflow** and paste **`target_url`** (e.g. `https://your-preview.vercel.app`).
2. **Public job** always runs: `e2e/smoke.spec.ts` + `e2e/help-order-hub.spec.ts` against that host.
3. **Storefront job** runs when **`PLAYWRIGHT_INCLUDE_STOREFRONT`** is **`true`**. Set secret **`E2E_STOREFRONT_SLUG`**
   to a storefront slug that exists on **`target_url`** (published `/s/{slug}`).
4. **Dashboard job** runs only when repository variable **`PLAYWRIGHT_INCLUDE_DASHBOARD`** is set to **`true`**.  
   Add repository secrets **`E2E_LOGIN_EMAIL`** and **`E2E_LOGIN_PASSWORD`** (same as local Playwright).  
   The job runs `e2e/auth.setup.ts` + `e2e/dashboard-auth.spec.ts` + `e2e/pos-checkout-flow.spec.ts` (Order hub, mapping,
   POS shell, and a **mutating** cash checkout that asserts the new order on `/dashboard/orders` when register, staff,
   and catalog preconditions are met).
5. **Optional prune** after dashboard: set **`PLAYWRIGHT_PRUNE_AFTER_E2E=true`** to run **`db:prune:e2e-pos-orders --execute`**
   (needs **`E2E_DATABASE_URL`** + **`E2E_SEED_USER_ID`** on the runner; staging only).

The default PR **CI** workflow does not start a server or hit the network; use the manual remote workflow for hosted smoke.

### Storefront money-path job (`storefront-money-path`)

Dedicated job **`.github/workflows/ci.yml` → `storefront-money-path`** always runs tier-2 **unit** tests and **pay-later** Playwright E2E. **Stripe live-card checkout** E2E runs only when repository secret **`STRIPE_SECRET_KEY`** is configured.

An **always-on** policy step (`npm run test:ci:storefront-stripe-e2e:policy`) runs at the end of every `storefront-money-path` job and:

- prints **`Storefront Stripe E2E CI: PASSED | SKIPPED | FAILED`** with a reason,
- writes **`ci-artifacts/storefront-stripe-e2e-summary.json`** (uploaded as **`storefront-stripe-e2e-summary`**),
- fails the job only when Stripe E2E was required to run and failed (`FAILED`).

Policy ids: **`era7-storefront-stripe-optional-v1`** and **`era7-storefront-stripe-secrets-accept-v1`**. Forks without `STRIPE_SECRET_KEY` may stay green when pay-later E2E passes; the artifact must report **`SKIPPED`**, not a silent pass. See **`docs/ci-e2e-tier-matrix.md`** tier 2.

**Optional local Stripe E2E:**

```bash
unset TURNSTILE_SECRET_KEY
export STRIPE_SECRET_KEY=sk_test_...
export STOREFRONT_E2E_STRIPE=1
export E2E_STOREFRONT_SLUG=hello
npm run build && npm run start -- -p 3000 &
export PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000
npm run test:ci:storefront-money-path:stripe-e2e
```

### POS money-path job (`pos-money-path`)

Dedicated job **`.github/workflows/ci.yml` → `pos-money-path`** always runs tier-2b **unit**, **integration**, and **inventory** tests. **Playwright POS checkout** runs only when repository secrets **`E2E_LOGIN_EMAIL`** and **`E2E_LOGIN_PASSWORD`** are configured.

An **always-on** policy step (`npm run test:ci:pos-browser-e2e:policy`) runs at the end of every `pos-money-path` job and:

- prints **`POS browser E2E CI: PASSED | SKIPPED | FAILED`** with a reason,
- writes **`ci-artifacts/pos-browser-e2e-summary.json`** (uploaded as GitHub artifact **`pos-browser-e2e-summary`**),
- fails the job only when browser E2E was required to run and failed (`FAILED`).

Policy ids: **`era4-tier2b-optional-v1`** (status artifact) and **`era5-pos-e2e-secrets-accept-v1`** (forks without secrets may stay green when tier-2b always-on certs pass; browser tier must report **`SKIPPED`** in `pos-browser-e2e-summary`, never a silent pass). See **`docs/ci-e2e-tier-matrix.md`** tier 2b.

**Fork / PR without secrets (accepted):** do not add `E2E_LOGIN_*` unless you intend to run Playwright POS checkout in CI. Unit + integration + inventory still certify the software money path.

**Enable browser tier on `main` or staging forks:** add repository secrets **`E2E_LOGIN_EMAIL`** and **`E2E_LOGIN_PASSWORD`** (dashboard user with POS access). Optional **`E2E_CI_POS_USER_ID`** for `npm run db:seed:e2e-pos` fixture alignment. After `pos-money-path` runs, download artifact **`pos-browser-e2e-summary`** and confirm status **`PASSED`** (not **`SKIPPED`**).

### Hosted production tenant smoke

Use this when you want a quick hosted check without launching Playwright:

```bash
npm run smoke:production-tenant
```

If `SMOKE_PREFLIGHT_EMAIL` or `E2E_LOGIN_EMAIL` is set, the script also runs tenant readiness gates
from `runKitchenPreflight()`. In default mode, non-critical issues can surface as `⚠️` warnings
without failing the command.

For true readiness semantics, use strict mode:

```bash
npm run smoke:production-tenant:strict
```

Strict mode fails on any blocking gate, including `Demo mode off`.
It also requires `SMOKE_PREFLIGHT_EMAIL` explicitly and ignores `E2E_LOGIN_EMAIL` fallback, so the
default E2E bootstrap tenant is not treated as a production pilot by accident.

### Real pilot readiness

To validate a specific pilot tenant end-to-end without guessing env vars:

```bash
npm run pilot:readiness -- --email=owner@pilot.com
```

This combines:

- DB-backed `runKitchenPreflight(email)`
- hosted strict smoke against `https://os-kitchen.com`
- targeted hints when demo mode is still enabled

### Final 100 gate

When you want one consolidated answer for “what still blocks true 100/100”, run:

```bash
npm run final:100
```

Optional flags:

```bash
SMOKE_PREFLIGHT_EMAIL=owner@pilot.com npm run final:100
VISUAL_SIGNOFF_DONE=1 MONITORING_WINDOW_DONE=1 SMOKE_PREFLIGHT_EMAIL=owner@pilot.com npm run final:100
```

This gate checks:

- live `/api/health`
- Vercel Production env presence for Sentry
- default hosted tenant smoke
- strict pilot readiness (only when `SMOKE_PREFLIGHT_EMAIL` is explicit)
- manual completion flags for visual sign-off and 24–48h monitoring

On **GitHub Actions**, `CI` is set so Playwright emits an **HTML report** under **`playwright-report/`** and **JUnit** under
**`test-results/junit.xml`**. The **E2E remote smoke** workflow uploads those folders as job artifacts (even when tests
fail) for triage — download from the workflow run’s **Artifacts** section. The same JUnit file is also published to
**GitHub Checks** via **dorny/test-reporter** (check runs named **E2E remote · public / storefront / dashboard** on the
workflow run or commit).

### POS E2E database fixture

For **`e2e/pos-checkout-flow.spec.ts`** to pass (not skip), the workspace needs **PRO** subscription, a **POS register**,
**active staff**, and at least one **POS-visible** product on an active menu. One command (uses `DATABASE_URL` / Prisma):

```bash
E2E_SEED_USER_ID=<same-uuid-as-supabase-auth-user> npm run db:seed:e2e-pos
```

`SEED_USER_ID` works as an alias. Re-run any time; it only creates missing rows.

**Order hub:** internal rows expose `data-order-id` for automation. The POS E2E spec asserts the **POS** channel cell only
when that order appears in the current Order hub table (preview). If it does not (large backlog), the test still passes
after validating **`/dashboard/orders/{id}`** (source badge) and records an annotation.

### Remote workflow — optional DB seed

When repository variable **`PLAYWRIGHT_RUN_E2E_DB_SEED`** is **`true`**, the **dashboard** job in
**`.github/workflows/e2e-remote-smoke.yml`** runs **`prisma migrate deploy`** and **`npm run db:seed:e2e-pos`** against
secrets **`E2E_DATABASE_URL`**, **`E2E_DIRECT_URL`**, and **`E2E_SEED_USER_ID`**. Use **only** on a disposable staging
database — never point at production.

When **`PLAYWRIGHT_PRUNE_AFTER_E2E`** is **`true`**, the same job runs **`npm run db:prune:e2e-pos-orders -- --execute --max-age-hours=168`**
after Playwright (requires **`E2E_DATABASE_URL`** and **`E2E_SEED_USER_ID`**). Use on staging only.

### GitHub Environment (recommended for DB steps)

To require **manual approval** before migrate/seed/prune touch Postgres, create a GitHub **Environment** named
`staging-e2e` (Settings → Environments), add **required reviewers**, and move secrets **`E2E_DATABASE_URL`**,
**`E2E_DIRECT_URL`**, **`E2E_SEED_USER_ID`** to **environment secrets** instead of repository secrets. Then add to the
**`dashboard-smoke`** job in **`.github/workflows/e2e-remote-smoke.yml`**:

```yaml
dashboard-smoke:
  environment: staging-e2e
```

(Only add this line when the environment exists; the workflow ships without it so forks stay zero-config.)

### Prune POS E2E orders (staging)

After many Playwright runs, delete synthetic **`POS_SALE`** rows tied to the seeded **E2E POS item** line (see
`scripts/prune-e2e-pos-orders.ts`). Default is **dry-run**; pass **`--execute`** to delete. Optional
**`--max-age-hours=168`** scopes by `createdAt`.

```bash
E2E_SEED_USER_ID=<uuid> npm run db:prune:e2e-pos-orders
E2E_SEED_USER_ID=<uuid> npm run db:prune:e2e-pos-orders -- --execute --max-age-hours=720
```

## Visual regression (Playwright snapshots)

Storefront UI baselines run against isolated pages under **`/visual-test/*`** (not linked in production nav; `robots: noindex`).

| Page | Route | Spec |
|------|-------|------|
| Theme presets | `/visual-test/theme-presets` | `tests/visual/theme-presets.spec.ts` |
| Collection catalog | `/visual-test/collection-preview` | `tests/visual/collection-preview.spec.ts` |
| Checkout shell | `/visual-test/checkout-shell` | `tests/visual/checkout-shell.spec.ts` |
| Navigation tokens | `/visual-test/nav-tokens` | `tests/visual/nav-tokens.spec.ts` |

Committed PNG baselines live next to each spec (platform-agnostic names, shared by local + CI):

`tests/visual/<name>.spec.ts-snapshots/*.png`

Playwright project `visual` sets `snapshotPathTemplate` without `{platform}` and allows `maxDiffPixelRatio: 0.02` for minor font rendering differences between macOS and Linux.

### Local workflow

Prerequisites:

1. **Playwright Chromium** — installed automatically before `test:visual` via `pretest:visual` (or once manually: `npm run playwright:install`).
2. **Production build** — Playwright starts `next start` on **port 3001** by default (so `next dev` on 3000 can stay running). Override with `PW_VISUAL_PORT`.

Run **one command per line** (do not paste `# comments` on the same line — the shell or npm may pass them to `next` / Playwright and break the run).

```bash
npm run build
npm run test:visual
```

After intentional UI changes:

```bash
npm run test:visual:update
```

Update a single spec:

```bash
npx playwright test tests/visual/checkout-shell.spec.ts --project=visual --update-snapshots
```

### Visual tests troubleshooting

| Symptom | Fix |
|---------|-----|
| `Executable doesn't exist` … `chrome-headless-shell` | `npm run playwright:install` (or re-run `npm run test:visual` — `pretest:visual` installs Chromium) |
| `Invalid project directory` … `OS Kitchen/#` | You ran `npm run build` with a trailing `# comment` on the same line; run `npm run build` alone |
| `argument '#' is invalid` for `--update-snapshots` | Same issue: run `npm run test:visual:update` without `# …` on the line |
| `net::ERR_CONNECTION_REFUSED` on `:3000` | Run `npm run build` first so `npm run start` (started by Playwright) can serve the app |
| `Internal Server Error` / testids not found | Stop `npm run dev` on port 3000 — Playwright was reusing dev instead of `next start`. Or run `npm run build` then `npm run test:visual` (production server starts automatically) |

Shared screenshot options: `tests/visual/visual-screenshot.ts` (`animations: disabled`, `caret: hide`).

### CI (GitHub Actions)

Workflow **`.github/workflows/chromatic-visual.yml`** (on PR/push to paths above):

1. `npm ci` → `prisma generate` → `npm run build`
2. `npx playwright test tests/visual --project=visual`
3. On **success**: artifact **`visual-regression-baselines-{run_id}`** — copy of `tests/visual/**/*-snapshots/` (30-day retention)
4. On **failure**: artifact **`visual-regression-diff-{run_id}`** — `test-results/` + HTML report for pixel diffs

**Storybook / Chromatic** are optional and not required for this pipeline. Add `CHROMATIC_PROJECT_TOKEN` only if you introduce Storybook for design review.

To refresh baselines from CI: **Actions → Visual regression → Run workflow** with **update_baselines** checked, then download artifact `visual-regression-baselines-*` and commit the PNGs.

### When a visual test fails in CI

1. Download **`visual-regression-diff-*`** or **`visual-regression-report-*`** from the workflow run.
2. Reproduce locally with `npm run test:visual`.
3. If the change is intentional, run `npm run test:visual:update` and commit the updated `*-snapshots/*.png` files.

## CI recommendations

- Run `npm run typecheck`, `npm run test:unit`, and `npm run build` on every PR.
- Run Playwright against preview deployments on a schedule or before release tags.

## Adding tests

- Prefer pure functions and small modules for unit coverage.
- For E2E, avoid reliance on live third-party APIs; use demo mode or mocks where available.
