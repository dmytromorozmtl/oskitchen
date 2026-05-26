# E2E critical paths — implementation notes

## Framework

- Playwright (`playwright.config.ts`).
- Public specs in `e2e/*.spec.ts` (no credentials).
- Authed dashboard suite requires `E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD`.

## Added in this pass

- `e2e/webhook-cron-public.spec.ts` — cron 401/503 behavior + optional dry-run with `CRON_SECRET`.

## Roadmap tests (no fake partners)

1. Signup → first order — needs stable test user + DB seed.
2. POS → production — `e2e/pos-checkout-flow.spec.ts` exists when authed env set.
3. Support reply — extend with fixtures.
4. Webhook async Woo — mock server or Prisma test DB.
5. Storefront order — `e2e/storefront.spec.ts`.
6. Platform denial — add route check `/platform` as non-admin.

## CI recommendation

- Run Vitest always.
- Run Playwright public project always; gate authed projects on secrets.
