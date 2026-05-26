# Production safety guards

Implemented patterns:

| Guard | Implementation |
|-------|----------------|
| Demo import/reset in prod | `lib/production-guards.ts` + `actions/demo.ts` — requires `DEMO_MODE_ENABLED` when `NODE_ENV=production` |
| Supervised demo tenant exit | `npm run tenant:demo:reset -- --email=...` (dry-run by default; requires `DEMO_MODE_ENABLED=true` + `--execute` + `--confirm-email=...` to mutate) |
| Seed scripts public exposure | No `/api/seed` route — CLI only |
| Cron auth | `/api/cron/reminders` requires `Authorization: Bearer CRON_SECRET` |
| Stripe webhooks | Signature verification with `STRIPE_WEBHOOK_SECRET` |
| Owner-only diagnostics | `/dashboard/developer`, `/dashboard/beta-applications`, email preview (dev-only) |
| Stack traces to users | `safeError()` masks non-forbidden messages in production |
| Secrets in logs | `lib/logger.ts` redaction helpers |
| Beta spam | Honeypot field `website_hp` in beta form |
| Email preview | `/dashboard/developer/email-preview` returns **404** in production |

Recommended future work: rate limiting on `/beta`, CAPTCHA if abused, Sentry for error aggregation.
