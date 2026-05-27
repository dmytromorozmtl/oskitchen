# DevOps, Release, And Enterprise Readiness

Status: canonical release-readiness and enterprise-ops checklist
Primary evidence: `package.json`, `.github/workflows/ci.yml`, `.github/workflows/e2e-staging.yml`, `README.md`, `vercel.json`, `next.config.ts`, `instrumentation.ts`, `scripts/`, `docs/OBSERVABILITY_RELEASE_OPS_AUDIT.md`, `docs/system-reality-model.md`

## CI Green Standard
- valid workflow references only
- static workflow-to-`package.json` script audit passes
- install-chain verification passes after dependency install, including Vitest preload (`suppress-warnings.cjs`), Chai, and focused-runner manifests; postinstall recreates the Vitest preload stub when missing
- `npm run test:pos-rbac` passes in CI (focused POS permission-negative suite)
- strict typecheck or approved split-typecheck replacement
- build passes using documented production-like env assumptions
- security suite passes
- release-critical smoke tests pass

## Typecheck Split
- Current state: one large typecheck target, with repo-scale memory concerns.
- Requirement: keep strictness, but allow split execution if needed for reliability.
- Output: one canonical developer workflow and one canonical CI workflow.

## Build Verification
- continue prebuilt release discipline until memory pressure is resolved
- verify `build` against production-like env placeholders and readiness checks
- require storefront and auth smoke after build

## Cron Validation
- cron allowlist, disk routes, archive manifest, production profile, and `vercel.json` must reconcile
- validation failure blocks release

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

## SSO / SAML Roadmap
- architecture/roadmap only today
- not sell-ready as a current enterprise capability

## SCIM Roadmap
- architecture/roadmap only today
- not sell-ready as a current enterprise capability

## Audit Export
- audit logging exists, but export maturity and governance need continued work
- enterprise readiness should require scoped, permissioned audit export

## Data Retention
- retention policy and deletion/DSAR posture must remain honest
- do not imply automated enterprise-grade retention governance unless implemented

## DPA / Privacy Support
- privacy support is currently more roadmap/process than enterprise productized flow
- keep claims modest until policies, exports, and request handling are formalized

## Security Questionnaire Support
- provide architecture-backed answers only
- avoid attestation language beyond implemented evidence and published roadmap

## Immediate Readiness Priorities
1. canonicalize RBAC and permission enforcement
2. eliminate CI/workflow drift
3. re-certify cron and smoke gates
4. harden upload/media
5. tighten release-critical smoke ownership
