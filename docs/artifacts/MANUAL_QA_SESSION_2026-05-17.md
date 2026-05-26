# Manual QA session — storefront pilot `hello`

**Date:** 2026-05-17  
**Tester:** ___________  
**Base URL:** `http://localhost:3000` (local pilot — update to Vercel URL after Day 3)  
**Stripe:** Option A — pay-later only

**Runbook:** [`STOREFRONT_MANUAL_QA_RUNBOOK.md`](STOREFRONT_MANUAL_QA_RUNBOOK.md)

---

## Session prep

| Item | Done |
|------|------|
| HTTP smoke PASS on this base URL | ☑ (10/10 local — `storefront-smoke-local-latest.md`) |
| Incognito browser ready | ☐ |
| Admin access `/dashboard/storefront` | ☐ |
| Ordering: Pay later ON, Online payments OFF | ☐ |

---

## Results (copy to QA artifact)

| # | Scenario | Pass | Notes |
|---|----------|------|-------|
| 1 | Draft / preview only for owner | ☐ | |
| 2 | Menu storefrontVisible filter | ☐ | |
| 3 | Product UUID + publicSlug URLs | ☐ | |
| 4 | Pay-later checkout E2E | ☐ | |
| 5 | Disabled storefront → 404 | ☐ | |
| 6 | Unpublished → 404 guest | ☐ | |
| 7 | Promo valid + invalid | ☐ | |
| 8 | Blackout blocks checkout | ☐ | |
| 9 | Honeypot contact | ☐ | |

---

## Deep-dive (release blockers)

### Checkout

| Step | Pass | Notes |
|------|------|-------|
| Add to cart | ☐ | |
| Checkout form submit | ☐ | |
| Confirmation page | ☐ | |
| Order Hub entry | ☐ | |

### Promo

| Case | Pass |
|------|------|
| Valid code reduces total | ☐ |
| INVALID999 errors | ☐ |

### Blackout

| Step | Pass |
|------|------|
| Blocked date message | ☐ |
| Normal date after remove | ☐ |

---

## Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Engineering | | | ☐ |
| Product / Ops | | | ☐ |

**Ready for Ship:** ☐ Yes ☐ No — reason: ___________
