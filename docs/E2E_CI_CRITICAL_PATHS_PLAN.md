# E2E CI — critical paths plan

## Objective

Cover **honest** critical paths with Playwright under `tests/e2e/*.spec.ts`, runnable in CI with **fixtures + isolated DB**, not with production partner credentials.

## CI-ready smoke (no secrets)

With the app running locally (`npm run dev`) or against a preview URL:

```bash
npm run test:e2e:public-smoke
```

This runs `tests/e2e/public-health.spec.ts` and `tests/e2e/platform-access-denial.spec.ts` (unauthenticated `/platform` → `/login`).

Set `PLAYWRIGHT_BASE_URL` when not targeting `http://127.0.0.1:3000`.

## DB integration tests (Vitest)

```bash
RUN_DB_INTEGRATION=1 npm test
```

Requires a reachable `DATABASE_URL` with migrations applied. Enables `tests/integration/*.integration.test.ts`.

## Spec files (scaffolded)

| File | Path intent |
|------|-------------|
| `signup-order.spec.ts` | Signup → onboarding → first order |
| `pos-production.spec.ts` | POS → made-to-order → production artifacts |
| `support-reply.spec.ts` | Ticket → operator reply → customer visibility |
| `platform-access-denial.spec.ts` | Client user blocked from `/platform` |
| `webhook-woo-async.spec.ts` | Fixture Woo payload → job → cron → `PROCESSED` |
| `storefront-order.spec.ts` | Storefront submission → Order Hub |

All specs currently `test.skip(...)` with explicit reasons — **CI activation is a separate PR** once DB + secrets exist.

## Playwright wiring

- Project `ci-critical-paths` in `playwright.config.ts` with `testDir: ./tests/e2e`.

## Exit criteria for “CI ready”

- Deterministic seed script (`db:seed` variant) creates founder + normal user.
- `PLAYWRIGHT_BASE_URL` points at ephemeral env.
- No `.env` secrets committed; GitHub Actions OIDC or encrypted secrets only.

See `docs/E2E_CI_SECRETS_AND_FIXTURES.md`.
