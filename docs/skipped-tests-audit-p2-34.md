# Skipped tests audit (P2-34)

Twenty historically skipped Playwright specs were audited and **fixed** by wiring them to the `chromium-authed` project (`auth.setup.ts` + `E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD`) instead of skipping on missing session cookies or login redirects.

## Registry (20 fixed)

| ID | File | Test | Prior skip | Resolution |
|----|------|------|------------|------------|
| p2-34-01 | `e2e/verticals/ghost-kitchen.spec.ts` | brands command center | E2E_SESSION_COOKIE | chromium-authed |
| p2-34-02 | `e2e/verticals/meal-prep.spec.ts` | today command center | E2E_SESSION_COOKIE | chromium-authed |
| p2-34-03 | `e2e/verticals/cafe.spec.ts` | POS terminal page | E2E_SESSION_COOKIE | chromium-authed |
| p2-34-04 | `e2e/real-time-profit.spec.ts` | profit page mobile | login redirect | chromium-authed |
| p2-34-05 | `e2e/real-time-profit.spec.ts` | profit API snapshot | 401 skip | chromium-authed |
| p2-34-06 | `e2e/real-time-profit.spec.ts` | profit engine API | 401 skip | chromium-authed |
| p2-34-07 | `e2e/real-time-profit.spec.ts` | profit engine breakdown | login redirect | chromium-authed |
| p2-34-08 | `e2e/dynamic-pricing.spec.ts` | panel + toggle | skipIfLoginRedirect | chromium-authed |
| p2-34-09 | `e2e/dynamic-pricing.spec.ts` | API dashboard shape | 401 skip | chromium-authed |
| p2-34-10 | `e2e/invoice-scanner.spec.ts` | scanner page loads | skipIfLoginRedirect | chromium-authed |
| p2-34-11 | `e2e/loyalty-2.0.spec.ts` | program builder | No authed session | chromium-authed |
| p2-34-12 | `e2e/gift-cards-system.spec.ts` | gift cards hub | No authed session | chromium-authed |
| p2-34-13 | `e2e/menu-templates.spec.ts` | cuisine cards | login redirect | chromium-authed |
| p2-34-14 | `e2e/menu-templates.spec.ts` | preview modal | login redirect | chromium-authed |
| p2-34-15 | `e2e/instant-payouts.spec.ts` | instant payouts page | No authed session | chromium-authed |
| p2-34-16 | `e2e/qr-ordering.spec.ts` | qr codes dashboard | login redirect | chromium-authed |
| p2-34-17 | `e2e/handheld-ordering.spec.ts` | table picker grid | unauthed + POS gate | chromium-authed (POS gate kept) |
| p2-34-18 | `e2e/voice-ordering.spec.ts` | voice settings page | No authed session | chromium-authed |
| p2-34-19 | `e2e/white-label-pwa.spec.ts` | PWA branding settings | No authed session | chromium-authed |
| p2-34-20 | `e2e/referral-program.spec.ts` | referrals settings | No authed session | chromium-authed |

## Remaining intentional skips (keep-gated)

These patterns are **not** defects — they gate on env, staging data, or live infra:

- `describe.skipIf(!run)` — DB integration suites (`RUN_DB_INTEGRATION=1`)
- `describe.skipIf(!runLive)` — Today page perf (`RUN_PERF_TESTS=1`)
- `test.skip(!PLAYWRIGHT_BASE_URL)` — hosted staging smokes
- `test.skip(true, "No POS register")` — tenant-specific POS seed gaps
- `test.skip(!SUPABASE_SERVICE_ROLE_KEY)` — guest demo launch

Run inventory scan:

```bash
npm run audit:skipped-tests-p2-34
```
