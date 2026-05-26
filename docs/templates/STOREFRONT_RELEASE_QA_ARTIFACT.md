# Storefront Release QA Artifact

> Копируйте этот файл на каждый релиз (Notion / PR / issue attachment).  
> Чеклист сценариев: `docs/STOREFRONT_QA_CHECKLIST.md`  
> Полный план: `docs/STOREFRONT_RELEASE_READINESS_PLAN.md`

---

## Release metadata

| Field | Value |
|-------|-------|
| **Release tag / commit** | `git sha: ________` |
| **Environment** | ☐ Staging ☐ Production |
| **Base URL** | `https://________________` |
| **Store slug tested** | `________________` |
| **Tester** | `________________` |
| **Date (UTC)** | `YYYY-MM-DD` |
| **Stripe on this release?** | ☐ No (pay-later only) ☐ Yes (smoke completed) |

---

## Automated gates

| Check | Pass | Notes |
|-------|------|-------|
| `npm run typecheck` | ☐ | |
| `npm run build` | ☐ | |
| `npm test` | ☐ | |
| `npm run check-env` (staging/prod shell) | ☐ | No secrets logged |

---

## Manual smoke (`STOREFRONT_QA_CHECKLIST.md`)

| # | Scenario | Pass | Notes / URL |
|---|----------|------|-------------|
| 1 | Published storefront loads | ☐ | `/s/{slug}` |
| 2 | Draft visible only to owner/preview | ☐ | |
| 3 | Menu: `storefrontVisible` only | ☐ | |
| 4 | Product by UUID + `publicSlug` | ☐ | |
| 5 | Pay-later checkout E2E | ☐ | |
| 6 | Confirmation shows notes | ☐ | |
| 7 | Disabled → 404 | ☐ | |
| 8 | Unpublished guest → 404 | ☐ | |
| 9 | Policies render | ☐ | privacy + terms |
| 10 | Sitemap 200 + product URLs | ☐ | |
| 11 | Promo valid / invalid | ☐ | |
| 12 | Blackout blocks checkout | ☐ | |
| 13 | Honeypot (`companyUrl`) | ☐ | |

### Stripe smoke (only if online payments enabled)

| Step | Pass | Notes |
|------|------|-------|
| Redirect to Stripe Checkout | ☐ | |
| Test card payment success | ☐ | |
| Webhook 200 in Stripe Dashboard | ☐ | event id: ________ |
| Order Hub `paid` after webhook | ☐ | order id: ________ |
| Duplicate webhook idempotent | ☐ | |

**Screenshot:** attach confirmation page + Order Hub paid state.

---

## Env verification (production cutover)

| Variable | Set | Verified |
|----------|-----|----------|
| `DATABASE_URL` (:6543 pooler) | ☐ | ☐ |
| `DIRECT_URL` | ☐ | ☐ |
| `NEXT_PUBLIC_APP_URL` (no trailing slash) | ☐ | ☐ |
| `STOREFRONT_MIDDLEWARE_SECRET` | ☐ | ☐ |
| `CRON_SECRET` | ☐ | ☐ |
| `AUTH_SECRET` / auth provider | ☐ | ☐ |
| Resend (if email) | ☐ | ☐ |
| Stripe keys (if online) | ☐ | ☐ |

---

## Cron / ops (P0-5)

| Item | Pass | Notes |
|------|------|-------|
| Prod `vercel.json` cron count ≤ agreed limit | ☐ | count: ____ / limit: ____ |
| No mass 401 on `/api/cron/*` after deploy | ☐ | |
| Experiment crons disabled or staging-only | ☐ | |

---

## Delivery zones honesty (P0-4)

| Item | Pass |
|------|------|
| No customer copy promises GPS radius delivery | ☐ |
| Fulfillment admin shows radius = diagnostic only | ☐ |
| Zones configured with postal/region where needed | ☐ |

---

## Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Engineering | | | ☐ |
| Product / Ops | | | ☐ |

**Blockers found (if any):**

```
1.
2.
```

**Decision:** ☐ Ship ☐ Hold — reason: ________________
