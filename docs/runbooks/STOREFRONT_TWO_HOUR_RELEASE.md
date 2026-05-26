# Storefront — 2-hour release runbook

Single path from local preflight → Vercel → staging QA → prod post-deploy.

---

## Prerequisites

- Filled `.env.production.local` (from `.env.storefront.production.example`)
- Published pilot slug: `hello` (`npm run storefront:list-slugs`)
- Vercel project access

---

## Minute 0–15 — Local

```bash
npm run storefront:two-hour-release
# or step-by-step:
npm run storefront:env:sync-local
npm run storefront:secrets:generate
# Edit .env.production.local → NEXT_PUBLIC_APP_URL=https://<real-prod-host>
npm run storefront:vercel-manifest
npm run storefront:release-preflight
```

**Exit:** preflight PASS; manifest shows P0 keys SET.

---

## Minute 15–30 — Sign-offs

| Doc | Action |
|-----|--------|
| [`STOREFRONT_STRIPE_SIGNOFF_RECORD.md`](../artifacts/STOREFRONT_STRIPE_SIGNOFF_RECORD.md) | Product signs Option A |
| [`PRODUCT_STRIPE_SIGNOFF_GUIDE.md`](../artifacts/PRODUCT_STRIPE_SIGNOFF_GUIDE.md) | Product checklist |

---

## Minute 30–90 — Staging

1. Deploy staging (Vercel preview or staging branch).
2. Create `.env.storefront.staging.local`:

```bash
cp .env.storefront.staging.example .env.storefront.staging.local
# STOREFRONT_SMOKE_BASE_URL=https://xxx.vercel.app
# STOREFRONT_SMOKE_SLUG=hello
```

3. Run:

```bash
npm run storefront:staging-qa
```

4. Manual QA (~45 min): [`STOREFRONT_MANUAL_QA_RUNBOOK.md`](../artifacts/STOREFRONT_MANUAL_QA_RUNBOOK.md)

---

## Minute 90–120 — Production

1. Upload secrets: [`VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md`](../artifacts/VERCEL_PRODUCTION_UPLOAD_CHECKLIST.md) (regenerate with `storefront:vercel-manifest`).
2. Vercel → **Redeploy** Production.
3. Post-deploy:

```bash
export STOREFRONT_SMOKE_BASE_URL="https://your-prod.vercel.app"
export STOREFRONT_SMOKE_SLUG=hello
npm run storefront:post-deploy
```

4. Monitor 24h: Order Hub, Vercel cron logs.

---

## Week 1 (after stable prod)

```bash
# Turnstile keys in Vercel → redeploy
STOREFRONT_PILOT_SLUG=hello npm run storefront:seed-week1-redirects
# Vercel: STOREFRONT_REDIRECTS_ENABLED=true → redeploy
STOREFRONT_SMOKE_BASE_URL=<host> STOREFRONT_SMOKE_SLUG=hello \
  STOREFRONT_REDIRECT_FROM=/legacy-menu STOREFRONT_REDIRECT_TO=/menu \
  npm run smoke:storefront-redirects
npm run storefront:week1-verify
# Lighthouse → docs/artifacts/WEEK1_LIGHTHOUSE_APPENDIX.md
```

---

## Phase C

[`PHASE_C_PILOT_HELLO.md`](../artifacts/PHASE_C_PILOT_HELLO.md)
