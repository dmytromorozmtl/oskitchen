# KitchenOS Phase 1 Hardening Release Checklist

## Scope
Phase 1 hardens the platform foundation before competitor-parity work:

- canonical order write path via `services/orders/order-creation-service.ts`
- encrypted-at-rest order PII with legacy backfill tooling
- explicit API route registry coverage with CI validation
- production-critical distributed rate-limit enforcement
- reduced `userId` / `dataUserId` / `workspaceId` drift in touched mutation paths

## Release Gates
- Run `node ./node_modules/tsx/dist/cli.mjs scripts/validate-order-write-paths.ts`
- Run `node ./node_modules/tsx/dist/cli.mjs scripts/validate-api-route-registry.ts`
- Run `node ./node_modules/tsx/dist/cli.mjs scripts/validate-production-crons.ts` so the production cron allowlist, active route files, archive manifest, `config/vercel/crons-production.json`, and `vercel.json` reconcile before deploy
- Run `node ./node_modules/tsx/dist/cli.mjs scripts/validate-startup-readiness.ts --production` before a production deploy so missing distributed rate-limit / webhook-drain prerequisites fail fast
- Run `npm run test:security` so the canonical order-entrypoint routing suite and tenant/auth regression tests execute together
- Ensure the DB-backed `security-db` CI job stays green; it now applies the Prisma schema and runs `tests/integration/tenant-isolation.test.ts` as a merge gate
- Ensure `tests/integration/order-entrypoint-pii.integration.test.ts` stays green in the DB-backed security job; it verifies encrypted-at-rest customer fields across dashboard, API, POS, and channel-import entrypoints
- Ensure `tests/integration/storefront-order-pii.integration.test.ts` stays green; it verifies both the canonical `Order` row and the `StorefrontOrder` sidecar keep customer PII encrypted at rest
- Ensure `tests/integration/derived-order-pii.integration.test.ts` stays green; it verifies catering-quote and meal-plan generated orders still preserve encrypted-at-rest customer fields while updating their source records and audit/timeline links
- Ensure `tests/integration/storefront-order-read-paths.integration.test.ts` stays green; it verifies guest lookup, signed-in storefront account history, guest-account OTP, and Stripe completion still work when `StorefrontOrder.customerEmail` is encrypted at rest
- Confirm `/api/health` returns `rateLimitAdapter.ok=true` in the target production-like environment

## Order Pipeline Checks
- Verify `actions/orders.ts`, `app/api/public/v1/orders/route.ts`, and `actions/storefront-order.ts` no longer call `prisma.order.create()` directly
- Confirm all new application order writes flow through `services/orders/order-creation-service.ts`
- Verify direct `prisma.order.create()` remains limited to approved seed/demo/test files only

## PII Checks
- Run `node ./node_modules/tsx/dist/cli.mjs scripts/backfill-order-pii.ts` first and archive the dry-run summary
- Run `node ./node_modules/tsx/dist/cli.mjs scripts/backfill-order-pii.ts --execute` only after confirming `ENCRYPTION_KEY` is present
- Verify newly-created orders store:
  - `customerName` with `enc:v1:`
  - `customerPhone` with `enc:v1:`
  - `customerEmail` with `enc:order-email:v1:`
- Verify newly-created `StorefrontOrder` sidecar rows also store:
  - `customerName` with `enc:v1:`
  - `customerPhone` with `enc:v1:`
  - `customerEmail` with `enc:storefront-order-email:v1:`
- Support/platform surfaces should default to masked values; workspace-authorized views may use full decrypted values where operationally required

## API Registry Checks
- Confirm every `app/api/**/route.ts` path is covered by `lib/api/route-registry.ts`
- Treat any new top-level `/api/*` subtree as a required registry update before merge
- Keep handler-authenticated routes explicitly classified rather than relying on broad middleware exemptions

## Rate-Limit Checks
- Production-critical flows must not run on the in-memory adapter
- Public API and storefront rate-limit failures should return a configuration error when distributed Redis is missing in production
- `/api/health` must degrade readiness if production traffic would rely on memory-only limits
- Real production node boot should fail early when fatal startup-readiness blockers remain (`VERCEL_ENV=production` or explicit `STARTUP_READINESS_FATAL=1`)

## Cron Reconciliation Checks
- Production allowlist cron routes must exist under `app/api/cron/*`
- `vercel.json` and `config/vercel/crons-production.json` must exactly match `services/cron/production-manifest.ts`
- Archived cron routes must stay disjoint from the production allowlist, and `config/cron-archive-manifest.json` must match archived folders on disk
- `/api/health` must report `cronExecution.ok=true` once critical fast production cron routes (`webhook-jobs`, `storefront-edge-sync`, `storefront-cart-recovery`, `doordash-sync`, `kds-overdue-alerts`) have fresh heartbeat evidence in the database
- `dashboard/system-health/cron-execution` should distinguish `open` vs `acknowledged` incidents, and only platform incident managers may acknowledge or reopen a degraded cron cycle

## Tenant Boundary Target State
- `session user -> tenant owner/workspace -> workspace permission set -> scoped resource helpers`
- Prefer `actor.userId` over deprecated alias-only `actor.dataUserId` in new code
- Prefer workspace-scoped helpers for order queries and mutations when `workspaceId` is available

## Rollout Notes
- Deploy Phase 1 before enabling additional competitor-parity modules
- Run the PII backfill in dry-run mode on staging first and keep the JSON summary with release evidence
- Monitor `/api/health`, public API 503s, and storefront checkout failures during rollout for rate-limit config regressions
