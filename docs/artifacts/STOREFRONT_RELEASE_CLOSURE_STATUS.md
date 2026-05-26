# Storefront release closure status

**Last updated:** 2026-05-17 (auto: `npm run storefront:release-status`)
**Pilot slug:** `hello`
**Stripe decision:** Option A — Pay-later only (engineering ☑, product ☑)

**Master runbooks:**
- [`STOREFRONT_48H_EXECUTION.md`](../runbooks/STOREFRONT_48H_EXECUTION.md) · [`STOREFRONT_48H_STATUS.md`](STOREFRONT_48H_STATUS.md)
- [`STOREFRONT_TWO_HOUR_RELEASE.md`](../runbooks/STOREFRONT_TWO_HOUR_RELEASE.md)
- [`STOREFRONT_NEXT_ACTIONS.md`](../runbooks/STOREFRONT_NEXT_ACTIONS.md)

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Done / automated PASS |
| 🟡 | Prepared — needs deploy, Vercel, or human sign-off |
| ☐ | Not started / blocked |
| 🔴 | Failed — must fix before ship |

---

## Executive summary

| Item | Status |
|------|--------|
| Local env critical | 🔴 |
| `NEXT_PUBLIC_APP_URL` in .env.production.local | ✅ `http://localhost:3000` |
| Preflight | ✅ |
| Vercel P0 manifest | 9/9 SET locally |
| QA artifact HTTP smoke | 🔴 FAIL |
| Production post-deploy smoke | ✅ |
| Product Stripe sign-off | ✅ |

---

## Следующие 2 часа (вы)

| # | Step | Status | Exact action |
|---|------|--------|--------------|
| 1 | Apply deploy URLs locally | 🟡 | `npm run storefront:apply-deploy-urls` |
| 2 | `NEXT_PUBLIC_APP_URL` → Vercel Production | 🟡 | Copy from `.env.production.local` → Vercel → **Redeploy** |
| 3 | Product Stripe sign-off | 🟡 | [`PRODUCT_STRIPE_SIGNOFF_GUIDE.md`](PRODUCT_STRIPE_SIGNOFF_GUIDE.md) → sign record |
| 4 | Deploy staging | ☐ | Vercel preview branch; confirm slug `hello` published |
| 5 | Staging QA artifact | 🟡 | `npm run storefront:staging-qa` (uses staging URL) |
| 6 | Manual checkout/promo/blackout | ☐ | Sections in QA artifact + runbook |
| 7 | Vercel Production upload | 🟡 | [`VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md`](VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md) |
| 8 | Deploy prod + post-deploy | ☐ | `STOREFRONT_SMOKE_ENV=production npm run storefront:post-deploy` |

**Known hosts (override with env if changed):**

- Staging: `https://xn---preview--staging-r4nxb5ja9d6q.vercel.app`
- Production: `https://xn---production-xijza32a.vercel.app`

---

## Неделя 1

| Step | Status | Command / doc |
|------|--------|----------------|
| Turnstile keys in Vercel | 🟡 | Dashboard → redeploy |
| Redirects seed (`hello`) | ✅ | `npm run storefront:seed-week1-redirects` |
| `STOREFRONT_REDIRECTS_ENABLED=true` | 🟡 | Vercel Production → redeploy |
| Redirect smoke | 🟡 | `npm run smoke:storefront-redirects` |
| Lighthouse appendix | 🟡 | [`WEEK1_LIGHTHOUSE_APPENDIX.md`](WEEK1_LIGHTHOUSE_APPENDIX.md) |
| Week 1 verify | ✅ script | `npm run storefront:week1-verify` |

Detail: [`STOREFRONT_WEEK1_EXECUTION.md`](STOREFRONT_WEEK1_EXECUTION.md) · `npm run storefront:week1-complete`

---

## Недели 2–4

| Step | Status | Doc |
|------|--------|-----|
| Media bucket (Supabase) | 🟡 | [`PHASE_C_PILOT_HELLO.md`](PHASE_C_PILOT_HELLO.md) § C1 |
| Slider in builder | 🟡 | § C2 |
| Forms file-upload | ☐ | § C4 — separate sprint |

Detail: [`STOREFRONT_WEEKS_2_4_BACKLOG.md`](STOREFRONT_WEEKS_2_4_BACKLOG.md)

---

## One-shot commands

```bash
npm run storefront:apply-deploy-urls
npm run storefront:release-status
npm run storefront:two-hour-release
npm run storefront:staging-qa
STOREFRONT_SMOKE_BASE_URL=<prod> STOREFRONT_SMOKE_SLUG=hello STOREFRONT_SMOKE_ENV=production npm run storefront:post-deploy
```

## Artifact index

| File | Purpose |
|------|---------|
| `storefront-preflight-latest.md` | Pre-deploy |
| `VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md` | Vercel paste list |
| `storefront-qa-release-*.md` | QA sign-off |
| `storefront-smoke-production-latest.md` | Post-deploy HTTP |
| `STOREFRONT_MANUAL_QA_RUNBOOK.md` | Manual scenarios |
| `WEEK1_LIGHTHOUSE_APPENDIX.md` | Lighthouse scores |
