# Week 1 — storefront hardening (execution pack)

**Prerequisite:** Production HTTP smoke PASS — [`storefront-smoke-production-latest.md`](storefront-smoke-production-latest.md).

**Sign-off record:** [`WEEK1_SIGNOFF_RECORD.md`](WEEK1_SIGNOFF_RECORD.md) (auto: `npm run storefront:week1-artifacts`)

**One command (all automatable checks):**

```bash
npm run storefront:week1-complete
```

---

## Overview

| # | Workstream | Code | Your action |
|---|------------|------|-------------|
| 1 | Turnstile | ✅ | Vercel keys + redeploy |
| 2 | Redirects | ✅ | Flag + seed + smoke |
| 3 | Lighthouse | ✅ | LHCI on deployed host |
| 4 | Verify | ✅ | `storefront:week1-verify` |

---

## 0. Local prep (5 min)

```bash
cp .env.storefront.week1.example .env.storefront.week1.local
# Merge Turnstile + redirects into .env.production.local OR:
set -a && source .env.production.local && source .env.storefront.week1.local && set +a

npm run storefront:seed-week1-redirects
npm run storefront:week1-verify
```

---

## 1. Turnstile

**Guide:** [`STOREFRONT_TURNSTILE_VERCEL_SETUP.md`](STOREFRONT_TURNSTILE_VERCEL_SETUP.md)

| Step | Action | Done |
|------|--------|------|
| 1.1 | Cloudflare Turnstile widget | ☐ |
| 1.2 | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` → Vercel **Production + Preview** | ☐ |
| 1.3 | `TURNSTILE_SECRET_KEY` → Vercel **Production + Preview** | ☐ |
| 1.4 | Redeploy prod + staging | ☐ |
| 1.5 | `/s/hello/contact` submit | ☐ |
| 1.6 | `/s/hello/checkout` — widget visible | ☐ |

**Staging shortcut:** Cloudflare test keys (always pass) — see Turnstile guide § Test mode.

---

## 2. Redirects

| Step | Action | Done |
|------|--------|------|
| 2.1 | `STOREFRONT_PILOT_SLUG=hello npm run storefront:seed-week1-redirects` | ☐ |
| 2.2 | Vercel Production: `STOREFRONT_REDIRECTS_ENABLED=true` | ☐ |
| 2.3 | Ensure `STOREFRONT_MIDDLEWARE_SECRET` matches Vercel (already P0) | ☐ |
| 2.4 | Redeploy Production | ☐ |
| 2.5 | Redirect smoke (both rules) | ☐ |

```bash
export STOREFRONT_SMOKE_BASE_URL="https://xn---production-xijza32a.vercel.app"
export STOREFRONT_SMOKE_SLUG=hello
export STOREFRONT_REDIRECTS_ENABLED=true
npm run smoke:storefront-redirects -- /legacy-menu /menu
npm run smoke:storefront-redirects -- /order-now /menu
```

**Expected:** `301`/`302` with `Location` containing `/menu`.

**E2E (CI):** `e2e/storefront-week1-redirects.spec.ts` — requires `STOREFRONT_REDIRECTS_ENABLED=true`.

---

## 3. Lighthouse

Run against **deployed** staging or prod (not localhost unless `npm run dev` is up):

```bash
export LHCI_BASE_URL="https://xn---preview--staging-r4nxb5ja9d6q.vercel.app"
export E2E_STORE_SLUG=hello
npm run lighthouse:storefront
npm run storefront:week1-artifacts
```

| Page | Threshold |
|------|-----------|
| `/s/hello/menu` | Performance ≥ 0.85, LCP ≤ 2500ms |
| `/s/hello/checkout` | Same |

Fill/sign: [`WEEK1_LIGHTHOUSE_APPENDIX.md`](WEEK1_LIGHTHOUSE_APPENDIX.md).

---

## 4. Week 1 verify + sign-off

```bash
npm run storefront:week1-verify
npm run storefront:week1-complete
```

| Role | Approve in |
|------|-----------|
| Engineering | [`WEEK1_SIGNOFF_RECORD.md`](WEEK1_SIGNOFF_RECORD.md) |
| Product | Same + Lighthouse appendix |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Redirect smoke 404 | `STOREFRONT_REDIRECTS_ENABLED` not true or not redeployed |
| Redirect no Location | Seed not run; check admin → Redirects panel |
| Turnstile 500 | Secret mismatch or missing redeploy |
| Lighthouse fail | Run on warm deploy; check menu has content |
| Crons 401 | `CRON_SECRET` in Vercel matches cron auth header |

---

## After Week 1

→ [`STOREFRONT_WEEKS_2_4_BACKLOG.md`](STOREFRONT_WEEKS_2_4_BACKLOG.md) (media, slider QA, forms sprint)
