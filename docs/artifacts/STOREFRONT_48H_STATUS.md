# Storefront — 48-hour execution status

**Updated:** 2026-05-17 · `npm run storefront:48h-status`
**Pilot slug:** `hello`

## Deploy health

| Host | URL | Probe |
|------|-----|-------|
| Production | `https://xn---production-xijza32a.vercel.app` | 🔴 DEPLOYMENT_NOT_FOUND |
| Staging | `https://xn---preview--staging-r4nxb5ja9d6q.vercel.app` | 🔴 missing |

> **Blocker:** `STOREFRONT_KNOWN_PRODUCTION_URL=https://<real> npm run storefront:bind-deploy-url`

---

## 48-hour timeline

| Day | Block | Status | Gate |
|-----|-------|--------|------|
| **Day 1 AM** | Phase 0 — URL + Vercel + smoke | 🔴 | prod `/s/hello` 200 + post-deploy PASS |
| **Day 1 PM** | Phase 1 — sign-off + manual QA | ☐ | QA artifact Ship ☑ |
| **Day 2** | Phase 2 — Week 1 + media env | ☐ | `storefront:week1-complete` + Vercel media |
| **Day 3–4** | Week 2 upload + Slider QA | 🟡 | WEEK2 sign-off + SLIDER checklist |
| **Later** | Week 4 file-upload issue | ☐ | GitHub issue created |

---

## Automated (repo) — done

| Item | Status |
|------|--------|
| Preflight | ✅ |
| Env critical (local) | 🔴 |
| Vercel manifest 9/9 local | ✅ |
| Redirects DB seed | ✅ |
| Media bucket Supabase | ✅ |
| Week 2 script | ✅ |

---

## Day 1 AM — Phase 0 checklist

| # | Task | Done |
|---|------|------|
| 0.1 | Copy prod URL from Vercel → storefront:bind-deploy-url | ☐ |
| 0.2 | Upload P0 to Vercel Production → redeploy | ☐ |
| 0.3 | Publish slug hello | ☐ |
| 0.4 | `storefront:post-deploy` 10/10 | ✅ |
| 0.5 | `storefront:staging-qa` | ☐ |

Runbook: [`STOREFRONT_48H_EXECUTION.md`](../runbooks/STOREFRONT_48H_EXECUTION.md) · Day 1 AM

## Day 1 PM — Phase 1

| # | Task | Done |
|---|------|------|
| 1.1 | Product Stripe sign-off | ☐ |
| 1.2 | Manual QA runbook (60 min) | ☐ |
| 1.3 | QA artifact Ship decision | ☐ |

## Day 2 — Week 1 + media Vercel

| # | Task | Done |
|---|------|------|
| 2.1 | Turnstile keys → Vercel | ☐ |
| 2.2 | STOREFRONT_REDIRECTS_ENABLED + smoke | ☐ |
| 2.3 | `storefront:week1-complete` | ☐ |
| 2.4 | Vercel `STOREFRONT_SUPABASE_STORAGE_BUCKET` | ☐ |

## Day 3–4

| # | Task | Done |
|---|------|------|
| 3.1 | Admin media upload + public hello | ☐ |
| 3.2 | `STOREFRONT_SLIDER_QA_CHECKLIST.md` | ☐ |
| 4.1 | GitHub issue file-upload | ☐ |

---

## One-shot commands

```bash
npm run storefront:bind-deploy-url
npm run storefront:48h-run
npm run storefront:48h-status
```
