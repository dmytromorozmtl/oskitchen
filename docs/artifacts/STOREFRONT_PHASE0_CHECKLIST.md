# Phase 0 checklist — pilot `hello`

## Automated (run locally)

```bash
npm run storefront:phase0-complete
```

Includes: `validate:database-env`, `check:database-connectivity`, `release-preflight`, `local-smoke` (if dev up), `vercel:crons:production`.

## If pages return 500 (`_document.js` / semver)

Corrupted `.next` after long dev sessions — not policies logic:

```bash
rm -rf .next
npm run dev:safe
```

Then: `npm run storefront:local-smoke`

## Human gates

| Step | Command / action |
|------|------------------|
| Real Vercel URL | Dashboard → Production URL → `npm run storefront:bind-deploy-url -- https://…` |
| Post-deploy smoke | `npm run storefront:post-deploy` |
| Manual QA | Checkout, promo, blackout on `/s/hello` |
| Media | Builder upload → slider visible |
| Week 1 prod | Turnstile keys, redirects, `npm run storefront:week1-complete` |
| GitHub | `PLAYWRIGHT_BASE_URL`, required checks: Storefront staging gate + Playwright storefront |

## Flags (Vercel production)

- Do **not** set `STOREFRONT_EXPERIMENTS_ENABLED` (pilot)
- Optional: `STOREFRONT_SERVER_CART=0` to disable server cart API
- `STOREFRONT_REDIRECTS_ENABLED=true` after week1 seed
