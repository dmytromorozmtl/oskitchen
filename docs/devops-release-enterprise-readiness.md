# DevOps, Release, And Enterprise Readiness

Status: canonical release-readiness and enterprise-ops checklist
Primary evidence: `package.json`, `.github/workflows/ci.yml`, `.github/workflows/e2e-staging.yml`, `README.md`, `vercel.json`, `next.config.ts`, `instrumentation.ts`, `scripts/`, `docs/OBSERVABILITY_RELEASE_OPS_AUDIT.md`, `docs/system-reality-model.md`

## CI Green Standard
- valid workflow references only
- static workflow-to-`package.json` script audit passes
- install-chain verification passes after dependency install, including Vitest preload (`suppress-warnings.cjs`), Chai, focused-runner manifests, and resolvable manifests for `date-fns`, `zustand`, `next`, and `typescript`; postinstall recreates the Vitest preload stub when missing
- `npm run test:pos-rbac` passes in CI (focused POS permission-negative suite)
- strict typecheck or approved split-typecheck replacement; `npm run typecheck` and CI `quality` / gate workflows use `NODE_OPTIONS=--max-old-space-size=8192` (aligned with `scripts/predeploy-verify.sh`)
- build passes using documented production-like env assumptions
- security suite passes (`npm run test:security` — includes `test:ci:rbac-wave4` wave-4 action RBAC at end of security-db job)
- release-critical smoke tests pass

## Typecheck Split
- **Policy (Era 4 Cycle 7 + Era 5 Cycle 2):** `era5-typecheck-slice-v2` in `lib/ci/typecheck-slice-policy.ts` (supersedes `era4-typecheck-slice-v1` slice set).
- **Full CI / release gate (unchanged):** `npm run typecheck` → `npm run typecheck:full` — `tsc --noEmit -p tsconfig.typecheck.json` with **8GB** heap (`node --max-old-space-size=8192`); CI `quality` / gate workflows keep `NODE_OPTIONS=--max-old-space-size=8192`.
- **Slice A — services core (local fast path):** `npm run typecheck:slice:services-core` — `tsconfig.slice.services-core.json` (services + actions + lib; no App Router); **6GB** heap; omits `.next/types` to avoid stale Next validator refs after cron archive.
- **Slice B — dashboard / API spine:** `npm run typecheck:slice:dashboard-services-api` — dashboard + API + components + shared spine; **6GB** heap. Strictness inherited from `tsconfig.base.json` (`strict: true`).
- **Slice C — storefront / marketing:** `npm run typecheck:slice:storefront-marketing` — public storefront (`app/s`, `app/b`), GTM/marketing pages, `app/dashboard/storefront`, storefront API routes; **6GB** heap.
- **Wiring cert (tier 0):** `npm run test:ci:typecheck-slice:cert` + `npm run test:ci:typecheck-slice` (in `test:ci:governance-bundles`).
- **Parallel CI job (Era 6 Cycle 3):** `era6-typecheck-slice-ci-v1` — workflow job `typecheck-slices` runs `npm run typecheck:ci:slices` at **6GB** heap in parallel with `quality`; **does not** replace `npm run typecheck` → `typecheck:full` (8GB) as canonical gate.

## Build Verification
- continue prebuilt release discipline until memory pressure is resolved
- verify `build` against production-like env placeholders and readiness checks
- require storefront and auth smoke after build

## Cron Validation
- cron allowlist, disk routes, archive manifest, production profile, and `vercel.json` must reconcile
- validation failure blocks release
- CI `quality` job runs `validate:production-crons` and `validate:cron-inventory` (both include `tests/unit/cron-hygiene-live.test.ts`)
- CI `quality` job runs `npm run test:ci:governance-bundles` (doc canon, public API v1 contracts, nav maturity, integration honesty) and `npm run test:ci:rbac-wave3` (Era 3 costing/purchasing/export platform RBAC gates)
- local focused bundle: `npm run test:ci:cron-hygiene`
- production schedule: **16** allowlisted slugs; experimental routes require `ENABLE_EXPERIMENTAL_CRONS` in production

## Staging E2E
- staging must only run when required secrets and URLs are valid
- preflight scripts should fail early on env mismatch
- staging smoke should cover auth, storefront, and at least one protected dashboard path

## Production Smoke
- public health route
- login route
- storefront critical path
- webhook/cron synthetic checks
- billing/webhook path if release touches commerce

## Lighthouse
- keep storefront and critical marketing routes in the performance checklist
- treat major regressions as release warnings or blockers depending on severity

## k6
- prioritize storefront checkout and any future high-volume queue drains
- use k6 as a pilot/scale certification tool, not just as an engineering experiment

## Sentry Release Tracking
- tie releases to Sentry environments
- ensure server and edge instrumentation stays deterministic
- link incidents back to release/version where possible

## Health Monitoring
- public `/api/health`
- platform/internal health dashboards
- queue, cron, webhook, and error recovery visibility

## Backup Verification
- database backup posture must be documented for each environment
- verification should include proof of recent backup, not just that backups are enabled

## Restore Rehearsal
- at least one periodic restore rehearsal should exist for production-scale confidence
- document restore owner, expected RTO/RPO, and evidence artifact location

## Rollback Plan
- application rollback: previous prebuilt deployment or last known-good deploy
- config rollback: last known-good env and cron manifests
- database rollback: non-destructive forward-fix first; migration rollback only with explicit reviewed plan

## Release Checklist
1. CI green
2. typecheck/build green
3. cron validation green
4. release-critical smoke green
5. feature maturity updated
6. integration maturity updated if relevant
7. docs updated
8. rollback notes recorded

## Incident Runbooks
Required runbooks:
- storefront outage
- Stripe webhook failure
- cron failure
- upload/media failure
- POS checkout failure
- integration sync failure
- tenant-scope incident
- impersonation/support incident

## Environment Inventory
- local developer
- CI
- staging
- production
- any pilot-only or internal verification environments

Each environment should have:
- owner
- base URL
- required secrets
- allowed smoke suites
- data safety rules

## Secret Scanning
- no secrets in repo
- env placeholders clearly separated from real secrets
- workflow and release processes should include secret hygiene review

## Dependency Scanning
- dependency review and vulnerability scanning should be part of regular release hygiene
- critical dependencies: auth, payments, storage, analytics, observability, Prisma, Next.js

## Uptime / Status
- internal health surfaces are real
- public status posture should remain honest until status/public incident process is formalized

## Enterprise procurement (Era 4 Cycle 8)

- **Canonical pack:** [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) — policy `era4-procurement-honesty-v1`
- **CI:** `npm run test:ci:enterprise-procurement:cert` (in `test:ci:governance-bundles`) — scans pack for required sections and forbidden false certification claims
- **Rule:** questionnaires, RFPs, and sales decks must align with the pack; do not cite deprecated `docs/ENTERPRISE_*_FINAL.md` or `enterprise-full-audit-*` for current posture

## SSO / SAML Roadmap

See procurement pack § SSO — **not available today**; phased roadmap only.

## SCIM Roadmap

See procurement pack § SCIM — **not available today**; depends on SSO pilot.

## SOC 2 Readiness

See procurement pack § SOC 2 — **not certified**; internal readiness mapping only.

## Audit Export

See procurement pack § Audit — logging + permission-gated export (`audit.export`); no SIEM-by-default.

## Data Retention

See procurement pack § Data retention — honest limits; no enterprise retention SKU.

## DPA / Privacy Support

See procurement pack § Data retention and privacy — process + gated exports; not a full privacy center.

## Security Questionnaire Support

See procurement pack § Security questionnaire guide — evidence pointers only, no attestation language.

## Immediate Readiness Priorities
1. canonicalize RBAC and permission enforcement
2. eliminate CI/workflow drift
3. re-certify cron and smoke gates
4. harden upload/media
5. tighten release-critical smoke ownership
