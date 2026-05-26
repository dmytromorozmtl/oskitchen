# Storefront roadmap — Phases 0–3

## Phase 0 — Pilot `hello` (2–4 weeks) — **current**

| ID | Task | Automated | Human |
|----|------|-----------|-------|
| 0.1 | Stable DB/env | `validate:database-env`, `check:database-connectivity`, `dev:safe` | Fresh terminal; never `source .env.production.local` |
| 0.2 | Vercel URL + smoke | `storefront:diagnose-deploy`, `post-deploy` | Bind real deploy URL from Vercel dashboard |
| 0.3 | Policies 200 | `storefront:local-smoke`, `e2e/storefront-policies.spec.ts` | — |
| 0.4 | Manual QA | — | `docs/artifacts/MANUAL_QA_SESSION_*.md` |
| 0.5 | Media pilot | `storefront:setup-media-bucket` | Upload in Builder; slider on `/s/hello` |
| 0.6 | Turnstile + redirects prod | `storefront:week1-complete` | Vercel env + redeploy |
| 0.7 | Crons Tier A | `vercel:crons:production` (6 paths) | Deploy `vercel.json` |
| 0.8 | E2E gate | `storefront-staging-gate.yml`, `playwright-storefront.yml` | `PLAYWRIGHT_BASE_URL` in GitHub |

**Orchestrator:** `npm run storefront:phase0-complete`

**Pilot flags (default):**

- `STOREFRONT_EXPERIMENTS_ENABLED` — unset (experiments off)
- `STOREFRONT_SERVER_CART` — on (signed cookie cart API)

---

## Phase 1 — Shopify Lite (months 2–3)

- Cart v2: server cart + abandoned recovery accuracy
- Builder: media, slider QA, mobile preview, publish checklist (strict Zod)
- Inventory: `ProductAvailability` → menu badge + block add-to-cart
- Analytics v1: visits → checkout → orders funnel
- Domains: DNS poll worker → status in UI
- Stripe Option B documented + prod test

---

## Phase 2 — Shopify Core (months 4–6)

- Variants/modifiers, tax & shipping v1, customer portal
- Multi-staff roles, checkout extensions (tips, deposit)
- Performance: RSC cache, image CDN, Lighthouse ≥85

---

## Phase 3 — Platform (months 7–12)

- Multi-store per workspace, markets/currency
- App webhooks, theme blocks / plugin API
- Subscriptions, reorder, experiment module (enterprise)

---

## Bek/front alignment principles

1. **Single source of truth** — prices, stock, published theme from server on render.
2. **Contract tests** — shared Zod for cart/checkout (see `lib/storefront/server-cart.ts`, `sections.ts`).
3. **Server cart id in cookie** — `POST /api/storefront/cart` with `kos_sf_cart`.
4. **Optimistic UI** — client updates; server authoritative on errors.
5. **Feature flags** — experiments off unless `STOREFRONT_EXPERIMENTS_ENABLED=1`.
6. **Error boundaries** — `app/dashboard/storefront/error.tsx`, `advanced/error.tsx`.
7. **Smoke pyramid** — unit → `storefront:local-smoke` → staging E2E → `post-deploy`.
