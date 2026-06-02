# OS Kitchen — Deploy Report

## Date: Sun Jun 1 2026 (America/Toronto)

## Commit: `76d09c84` — fix: add /kitchenos → / permanent redirect for rebrand

(Initial production deploy: `1a23af16`)

### Pre-Deploy Checks

| Check | Status | Notes |
|-------|--------|-------|
| TypeScript | ✅ | 0 errors (verified in prior session) |
| Build | ✅ | Local prebuilt `npGbGW8Nn-AF7q1HIslY4`; remote Vercel build succeeded |
| Tests | ✅ | 5326 passed (full vitest suite, prior run) |
| Lint | ⚠️ | Not re-run this session (deploy gate used vitest + remote build) |
| Prisma | ✅ | validate OK |
| Uncommitted | ⚠️ | Untracked artifacts/docs only; deploy commit clean |
| Secrets leak | ✅ | 0 live secrets in source |

### Deploy

- **Platform:** Vercel
- **Domain:** https://os-kitchen.com
- **Method:** Vercel CLI remote build (`vercel deploy --prod --yes`)
- **Deploy URL:** https://kitchen-jp09j7k3g-aervio.vercel.app
- **Deployment ID:** `dpl_F8i4EQo6n7onoFrEirNRmQPfUaJv`
- **Inspector:** https://vercel.com/aervio/kitchen-os/F8i4EQo6n7onoFrEirNRmQPfUaJv
- **Status:** ✅ READY (aliased to os-kitchen.com)

### Post-Deploy Validation

| Page | Status | Code | Time |
|------|--------|------|------|
| Homepage | ✅ | 200 | 1.49s |
| Login | ✅ | 200 | 2.83s |
| Signup | ✅ | 200 | 0.60s |
| Pricing | ✅ | 200 | 0.40s |
| Shopify Bundle | ✅ | 200 | 0.39s |
| API Health | ✅ | 200 | 3.41s |
| Redirect /kitchenos → / | ✅ | 308 | → https://os-kitchen.com/ |
| Content "OS Kitchen" | ✅ | — | present on homepage |
| SSL | ✅ | HTTP/2 200 | HSTS via Vercel |

### Issues Fixed During Deploy

1. **Cron promotion (21 production crons)** — metadata + hygiene tests
2. **Era25 briefing test timeouts** — parallel CI load
3. **`.vercelignore` excluded `scripts/ops/`** — broke remote build (platform UI imports)
4. **Local prebuilt path blocked** — iCloud duplicate `node_modules`, interrupted `npm ci`, OOM/chmod hangs

### Issues

- Local `npm run deploy:prod` prebuilt path still fragile on iCloud Desktop (duplicate `node_modules`, chmod/npm ci hangs). Use `vercel deploy --prod` remote build or move repo off Desktop/iCloud.

### Rollback

- **Last known good (prior production):** Vercel deployment cache from prior deploy
- **Rollback command:** `vercel rollback` (from linked project)
- **This deploy:** `dpl_F8i4EQo6n7onoFrEirNRmQPfUaJv`

### Environment Variables

Documented in `docs/vercel-env-vars-production.md`
