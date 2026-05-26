# Pilot Monitoring — 18 May 2026

First-week observability for meal-prep / preorder paid pilot.

---

## Key metrics

| Metric | Where | Alert threshold |
|--------|-------|-----------------|
| Vercel 5xx | Sentry / Vercel | >0 sustained 15 min |
| API latency p95 | Vercel Analytics | >2s on dashboard |
| Cron failures | Sentry tag `cron` / `cron_failure` | Any production slug failure |
| Experimental cron hit | Sentry `risk:experimental_cron` | Should be **zero** in prod |
| Webhook failures | Sentry tag `webhook` | >5% of deliveries |
| DB pool | Supabase dashboard | >80% utilization |
| Rate limit denials | Upstash (when enabled) | Spike vs baseline |
| Stripe failed payments | Stripe dashboard | >5% of attempts |
| POS errors | Sentry `pos` / checkout actions | >0 per hour in pilot window |

---

## Daily checklist (week 1)

- [ ] Sentry: new issues, regressions since yesterday
- [ ] Vercel Cron: all **10** production slugs succeeded (`docs/CRON_INVENTORY.md`)
- [ ] Supabase: connections, slow queries
- [ ] Stripe: failed checkouts / disputes
- [ ] Pilot operator feedback (support channel)
- [ ] `GET /api/health` on staging/production URL

---

## Production cron slugs to watch

`webhook-jobs`, `storefront-edge-sync`, `storefront-cart-recovery`, `storefront-theme-publish`, `reminders`, `storefront-domain-recheck`, `storefront-webhook-retention`, `storefront-team-invite-reminders`, `storefront-invite-audit-retention`, `storefront-ga4-parity`

---

## Escalation

1. Page on-call in `#incidents`
2. Roll back Vercel deployment if 5xx > 1% (`docs/PILOT_STAGING_RUNBOOK.md` rollback)
3. Disable experimental crons in Vercel UI if any non-allowlisted path scheduled
