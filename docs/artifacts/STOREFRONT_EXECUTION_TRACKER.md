# Storefront pilot execution tracker

**Pilot slug:** `hello`  
**Last automated run:** 2026-05-17 (local)

## Day 1 — Local stability ✅

| Action | Status | Evidence |
|--------|--------|----------|
| `rm -rf .next && npm run dev:safe` | ✅ | Dev on :3000, home/policies/menu **200** |
| `npm run storefront:phase0-complete` | ✅ | All automated steps PASS |
| HTTP smoke 10/10 | ✅ | `docs/artifacts/storefront-smoke-local-latest.md` |
| Policies E2E | ✅ | `npm run test:e2e:storefront-policies` (2/2) |
| DB connectivity | ✅ | `check:database-connectivity` SELECT 1 OK |
| Server cart API | ✅ | `POST /api/storefront/cart` → `ok: true` |
| Dashboard path | 📋 | Use Launch → Builder → Ordering → Menu (skip Advanced) |

## Day 2 — Manual QA ☐

| Item | Status |
|------|--------|
| Template | `docs/artifacts/MANUAL_QA_SESSION_2026-05-17.md` |
| Checkout E2E | ☐ Human |
| Promo valid/invalid | ☐ Human |
| Blackout | ☐ Human |

## Day 3 — Prod URL ☐

| Item | Status |
|------|--------|
| Real Vercel Production URL | ☐ Copy from Vercel → Deployments |
| `storefront:bind-deploy-url` | ☐ `STAGING_KNOWN_PRODUCTION_URL=https://<real> npm run …` |
| `storefront:post-deploy` | ☐ After bind |
| Stale `xn---…` URLs | 🔴 Still 404 until replaced |

**Local pilot bind (dev only):** `http://localhost:3000` patched into env — not a substitute for prod.

## Day 4 — Media ⚠️

| Item | Status |
|------|--------|
| Bucket `storefront-media` | ✅ |
| `storefront:week2-complete` | ✅ Automated PASS |
| Admin upload + Builder slider | ☐ Human (Vercel bucket env + redeploy) |

## Days 5–7 — Week 1 prod ☐

| Item | Status |
|------|--------|
| Turnstile keys on Vercel | ⚠️ Not in local env |
| `STOREFRONT_REDIRECTS_ENABLED=true` | ☐ |
| `storefront:seed-week1-redirects` | Run after redirects on |
| `storefront:week1-complete` | 🔴 Blocked (needs https prod URL + Turnstile) |
| GitHub `PLAYWRIGHT_BASE_URL` | ☐ |

## Phase 0 gate summary

```
✅ 0.1 DB/env
✅ 0.3 Policies (local)
✅ 0.5 Media bucket (automated)
✅ 0.7 Crons Tier A (6 paths)
✅ 0.8 E2E specs + workflows (needs PLAYWRIGHT_BASE_URL for CI)
☐ 0.2 Prod deploy smoke
☐ 0.4 Manual QA
☐ 0.6 Turnstile + redirects prod
```

## Commands (copy-paste)

```bash
# Daily dev
npm run dev:safe

# Gate
npm run storefront:phase0-complete

# When Vercel URL known
export STOREFRONT_KNOWN_PRODUCTION_URL="https://YOUR-PROJECT.vercel.app"
npm run storefront:bind-deploy-url
npm run storefront:post-deploy
npm run storefront:week1-complete
```
