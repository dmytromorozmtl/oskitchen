# Storefront — 48-hour execution runbook

**Live dashboard:** [`STOREFRONT_48H_STATUS.md`](../artifacts/STOREFRONT_48H_STATUS.md) (`npm run storefront:48h-status`)

**Automated run:** `npm run storefront:48h-run`

---

## Before you start

| Rule | Why |
|------|-----|
| Never `source .env.production.local` in zsh | Breaks `DATABASE_URL` |
| Always use `npm run …` | Safe dotenv loader |
| Fix deploy URL first | All smoke/Lighthouse depend on **200** `/s/hello` |

---

# Day 1 — Morning (2 h) — Phase 0

**Goal:** Live production deploy + HTTP smoke PASS.

## 0.1 Bind real Vercel URL (20 min)

1. Vercel → Deployments → **Production** → copy domain  
2. Optional: Preview URL for staging  

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22
cd /Users/dmytro/Desktop/2026/KitchenOS

export STOREFRONT_KNOWN_PRODUCTION_URL="https://YOUR-PROD.vercel.app"
export STOREFRONT_KNOWN_STAGING_URL="https://YOUR-PREVIEW.vercel.app"
npm run storefront:bind-deploy-url
npm run storefront:diagnose-deploy
```

| Result | Action |
|--------|--------|
| ✅ 200 | Continue |
| DEPLOYMENT_NOT_FOUND | Wrong URL — re-copy from Vercel |
| 404 | Admin → publish `hello` or redeploy with `DATABASE_URL` |

## 0.2 Vercel Production secrets (45 min)

[`VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md`](../artifacts/VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md)

- Paste all **✓ SET** rows → Production  
- `NEXT_PUBLIC_APP_URL` = same as prod domain  
- `STOREFRONT_SUPABASE_STORAGE_BUCKET=storefront-media`  
- **Redeploy**

## 0.3 Automated verification (15 min)

```bash
npm run storefront:release-preflight
npm run storefront:vercel-manifest

export STOREFRONT_SMOKE_BASE_URL="https://YOUR-PROD.vercel.app"
export STOREFRONT_SMOKE_SLUG=hello
export STOREFRONT_SMOKE_ENV=production
npm run storefront:post-deploy
```

**Gate:** `storefront-smoke-production-latest.md` — 10/10 ✓

## 0.4 Staging QA (optional, 15 min)

```bash
npm run storefront:staging-qa
```

---

# Day 1 — Afternoon (3 h) — Phase 1

**Goal:** Ship sign-off.

## 1.1 Product Stripe (15 min)

[`PRODUCT_STRIPE_SIGNOFF_GUIDE.md`](../artifacts/PRODUCT_STRIPE_SIGNOFF_GUIDE.md) → sign [`STOREFRONT_STRIPE_SIGNOFF_RECORD.md`](../artifacts/STOREFRONT_STRIPE_SIGNOFF_RECORD.md)

## 1.2 Manual QA (60 min)

[`STOREFRONT_MANUAL_QA_RUNBOOK.md`](../artifacts/STOREFRONT_MANUAL_QA_RUNBOOK.md)  
Tracker: [`MANUAL_QA_SESSION_2026-05-17.md`](../artifacts/MANUAL_QA_SESSION_2026-05-17.md)

Required: pay-later checkout, promo valid/invalid, blackout date.

## 1.3 Sign-off (15 min)

Update [`storefront-qa-release-2026-05-17.md`](../artifacts/storefront-qa-release-2026-05-17.md):

- Engineering ☑ + date  
- Product ☑ + date  
- **Ship decision: Ship**

```bash
npm run storefront:release-status
```

---

# Day 2 (4 h) — Phase 2

**Goal:** Week 1 hardening + media env on Vercel.

## 2.1 Turnstile (45 min)

[`STOREFRONT_TURNSTILE_VERCEL_SETUP.md`](../artifacts/STOREFRONT_TURNSTILE_VERCEL_SETUP.md) → Vercel Prod + Preview → redeploy

## 2.2 Redirects (30 min)

Vercel: `STOREFRONT_REDIRECTS_ENABLED=true` → redeploy

```bash
export STOREFRONT_REDIRECTS_ENABLED=true
export STOREFRONT_SMOKE_BASE_URL="https://YOUR-PROD.vercel.app"
npm run storefront:week1-complete
```

## 2.3 Media env on Vercel (15 min)

`STOREFRONT_SUPABASE_STORAGE_BUCKET=storefront-media` → redeploy

```bash
npm run storefront:week2-complete
```

Sign-off: [`WEEK1_SIGNOFF_RECORD.md`](../artifacts/WEEK1_SIGNOFF_RECORD.md)

---

# Day 3–4 (2 h)

## 3.1 Media upload (45 min)

1. `/dashboard/storefront/media` → upload JPEG  
2. Builder → Slider/home → bucket URL  
3. Public `/s/hello` — image loads  

[`WEEK2_MEDIA_SIGNOFF_RECORD.md`](../artifacts/WEEK2_MEDIA_SIGNOFF_RECORD.md)

## 3.2 Slider QA (45 min)

[`STOREFRONT_SLIDER_QA_CHECKLIST.md`](../artifacts/STOREFRONT_SLIDER_QA_CHECKLIST.md)

---

# Later — Week 4 (15 min)

```bash
gh issue create --template storefront-forms-file-upload.yml
```

Or: GitHub → New issue → **Storefront — forms file upload**

---

## Quick reference

| Command | When |
|---------|------|
| `npm run storefront:bind-deploy-url` | Once, after copying Vercel URL |
| `npm run storefront:48h-run` | After bind + Vercel redeploy |
| `npm run storefront:48h-status` | Anytime — dashboard |
| `npm run storefront:week1-complete` | Day 2 |
| `npm run storefront:week2-complete` | Day 2–3 |
