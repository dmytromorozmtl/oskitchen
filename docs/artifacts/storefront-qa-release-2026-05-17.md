# Storefront release QA artifact — 2026-05-17

## Release metadata

| Field | Value |
|-------|-------|
| Release tag / commit | _fill_ |
| Environment | staging → production |
| Base URL | https://xn---production-xijza32a.vercel.app |
| Store slug | hello |
| Stripe decision | **Option A** |
| Automated smoke (target) | **FAIL** |
| Env critical (local file) | **FAIL** |

## Release gates

| Gate | Status | Owner | Unblock |
|------|--------|-------|---------|
| G1 Local preflight | 🔴 FAIL | Engineering | `npm run storefront:release-preflight` |
| G2 HTTP smoke (target) | 🔴 FAIL | Engineering | Deploy + publish slug `hello`; re-run `storefront:qa-artifact` |
| G3 Vercel P0 secrets | see checklist | Engineering | `VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md` |
| G4 Manual QA (9 scenarios) | ☐ pending | Engineering + Product | `STOREFRONT_MANUAL_QA_RUNBOOK.md` |
| G5 Stripe Option A sign-off | ☐ Product | Product | `STOREFRONT_STRIPE_SIGNOFF_RECORD.md` |
| G6 Ship decision | ☐ | Product + Eng | All gates green |

### Smoke failure — typical fixes

| Symptom | Fix |
|---------|-----|
| All routes **404** | Slug not published, wrong base URL, or deploy not live — run `npm run storefront:list-slugs` against prod DB |
| **DEPLOYMENT_NOT_FOUND** on crons | Set real `STAGING_BASE_URL` / prod URL in Vercel + `CRON_SECRET` |
| Placeholder URL in export | Use ASCII URL only in zsh (no Cyrillic in host) |

## Automated HTTP smoke

| Check | Pass | Detail |
|-------|------|--------|
| Published storefront home | ☐ | GET /s/hello → 404 |
| Menu page | ☐ | GET /s/hello/menu → 404 |
| Cart page | ☐ | GET /s/hello/cart → 404 |
| Checkout page | ☐ | GET /s/hello/checkout → 404 |
| Contact page | ☐ | GET /s/hello/contact → 404 |
| Catering page | ☐ | GET /s/hello/catering → 404 |
| FAQ page | ☐ | GET /s/hello/faq → 404 |
| Privacy policy | ☐ | GET /s/hello/policies/privacy → 404 |
| Terms policy | ☐ | GET /s/hello/policies/terms → 404 |
| Sitemap XML 200 | ☐ | GET /s/hello/sitemap.xml → 404 |

## Manual smoke (required)

| # | Scenario | Pass | Tester notes |
|---|----------|------|--------------|
| 1 | Draft visible only to owner / preview cookie | ☐ | |
| 2 | Menu shows only storefrontVisible products | ☐ | |
| 3 | Product resolves by UUID and publicSlug | ☐ | |
| 4 | Pay-later: cart → checkout → confirmation + notes | ☐ | |
| 5 | Disabled storefront → 404 (guest) | ☐ | |
| 6 | Unpublished storefront → 404 (guest) | ☐ | |
| 7 | Promo: valid reduces total; invalid errors | ☐ | |
| 8 | Blackout date blocks checkout | ☐ | |
| 9 | Honeypot companyUrl does not create submission | ☐ | |

## Manual deep-dive — checkout / promo / blackout

Complete in **incognito** on the same base URL as HTTP smoke. Record pass/fail in notes column above.

### Pay-later checkout (required)

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 1 | `/s/hello/menu` → add item → Cart | Cart shows line items | ☐ |
| 2 | Checkout → fill name, email, fulfillment | No Stripe redirect (Option A) | ☐ |
| 3 | Submit pay-later / request order | Confirmation page with order id | ☐ |
| 4 | Order Hub (admin) | Order visible, total + notes match | ☐ |

### Promo codes (required)

| Case | Steps | Expected | Pass |
|------|-------|----------|------|
| Valid | Admin → Promotions → active code → apply at checkout | Total reduced | ☐ |
| Invalid | Code `INVALID999` at checkout | Inline error; order not placed | ☐ |

### Blackout date (required)

| Step | Action | Expected | Pass |
|------|--------|----------|------|
| 1 | Admin → Ordering → blackout for test date | Saved | ☐ |
| 2 | Checkout for blocked date | Clear block message; cannot complete | ☐ |
| 3 | Remove blackout | Checkout allowed again | ☐ |

## Stripe sign-off

See `docs/artifacts/STOREFRONT_STRIPE_SIGNOFF_RECORD.md` — Option **A**.

## Local preflight (repo)

| Check | Status |
|-------|--------|
| `npm run storefront:release-preflight` | See `docs/artifacts/storefront-preflight-latest.md` |
| `npm run storefront:vercel-manifest` | See `docs/artifacts/VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md` |

## Manual QA runbook

Complete after HTTP smoke passes: `docs/artifacts/STOREFRONT_MANUAL_QA_RUNBOOK.md`

## Deploy checklist

- [ ] `vercel.json` crons = 6 (`npm run vercel:crons:production`)
- [ ] Vercel Production secrets — `npm run storefront:vercel-manifest`
- [ ] GitHub required checks: CI + Storefront staging gate
- [ ] Post-deploy: `npm run storefront:post-deploy` on prod URL

## Sign-off

| Role | Name | Date | Approved |
|------|------|------|----------|
| Engineering | | | ☐ |
| Product / Ops | | | ☐ |

**Ship decision:** ☐ Ship ☐ Hold
