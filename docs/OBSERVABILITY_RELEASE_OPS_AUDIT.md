# OS Kitchen — Observability & Release Ops Audit

**Date:** 2026-05-15

---

## 1. Error reporting

- **Sentry:** `@sentry/nextjs` dependency present — see `docs/SENTRY_REAL_INTEGRATION_READINESS.md` / `docs/OBSERVABILITY_SENTRY_READINESS.md` for no-op vs real DSN behavior.
- **Rule:** Never commit DSNs; use env.

---

## 2. Health endpoints

- `/api/health` — load balancer / uptime checks.
- Platform health pages under `/platform/health` and `/platform/system-health` (internal).

---

## 3. Cron monitoring

- Webhook job cron: `app/api/cron/webhook-jobs/route.ts`.
- Reminders cron: `app/api/cron/reminders/route.ts` — verify same secret pattern if applicable (**spot-check**).

**Ops gap (P1):** Alert if cron returns non-200 for consecutive runs (Vercel cron analytics or external ping).

---

## 4. Node / engine consistency

- `package.json` engines: `>=22 <23`
- `.nvmrc`: `22`
- **Observation:** Local audit machine may use newer Node (e.g. 26) — **P2** document “CI should pin 22” in README (README already recommends 22).

---

## 5. Runbooks (required topics)

Embed or link existing docs:

| Scenario | Doc pointer |
|----------|-------------|
| Webhook failure | `docs/STAGING_WEBHOOK_ASYNC_VERIFICATION_RUNBOOK.md`, `docs/FAILED_WEBHOOK_TO_ERROR_RECOVERY.md` |
| Cron failure | `docs/WEBHOOK_CRON_ROUTE_HARDENING.md` |
| POS checkout | `docs/POS_WORKFLOW_COMPLETION_FINAL.md` |
| Storefront outage | `docs/STOREFRONT_CHECKOUT_FINAL.md`, middleware env sections |
| Import failure | `docs/IMPORT_CENTER_COMMIT_FLOW.md` |
| Email failure | `docs/EMAIL_SETUP.md` |
| Migration failure | README prisma sections + `db:repair-*` scripts |
| Platform access | `docs/PLATFORM_ADMIN_SUPPORT_COMPLETION.md` |

**This audit:** consolidated index above; **no code changes** to observability stack.

---

## 6. Release checklist (additions)

1. Verify `CRON_SECRET`, `STOREFRONT_MIDDLEWARE_SECRET`, rate limit Redis envs in prod.
2. Run `npm run production-check` / `scripts/production-check.sh` where applicable.
3. Smoke Playwright `test:e2e:public-smoke` on release candidate.

---

## 7. Fixes applied

- None to Sentry wiring in this pass (scope-safe).
