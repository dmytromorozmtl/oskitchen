# OS Kitchen Monitoring Stack

Free-tier monitoring for errors, performance, bundle size, and production availability.

| Tool | What it monitors | Free tier |
|------|------------------|-----------|
| **Sentry** | Runtime errors + traces | ~5k errors/mo |
| **Lighthouse CI** | Perf, a11y, SEO on marketing pages | Unlimited (CI) |
| **Bundle Analyzer** | Webpack bundle composition | Local / CI |
| **Health check** | Production URL availability | Unlimited |
| **Monitor suite** | All of the above in one command | Local |

## Error tracking: Sentry

- **Dashboard:** [sentry.io — os-kitchen](https://sentry.io/organizations/os-kitchen/)
- **Server DSN:** `SENTRY_DSN` (Vercel Production)
- **Browser DSN:** `NEXT_PUBLIC_SENTRY_DSN` (Replay + Feedback)
- **Wiring:** `instrumentation.ts`, `instrumentation-client.ts`, `sentry.{server,edge}.config.ts`, `withSentryConfig`, tunnel `/monitoring`
- **Setup guide:** [sentry-setup.md](./sentry-setup.md) (official Next.js SDK skill)
- **Activate on Vercel:** `npm run sentry:production:activate`

Verify production:

```bash
curl -s https://os-kitchen.com/api/health | jq '.checks.sentryServer, .checks.observability'
```

## Performance: Lighthouse CI

- **Config (marketing PRs):** `lighthouserc.marketing.cjs`
- **Config (storefront / staging):** `lighthouserc.cjs`
- **GitHub Actions:** `.github/workflows/lighthouse.yml` (pull requests)
- **Thresholds (marketing):** Performance ≥ 70, Accessibility / Best Practices / SEO ≥ 80

```bash
npm run build
npm run start
# other terminal:
npm run lighthouse
```

Storefront / deployed URL:

```bash
LHCI_BASE_URL=https://your-staging-host npm run lighthouse:storefront
```

## Bundle size

- **Analyze (webpack report):** `npm run analyze`
- **Human-readable report:** `npm run report:bundle`
- **Quick grep scan:** `bash scripts/check-bundle-size.sh`
- **CI regression vs baseline:** `npm run check:bundle-size-regression`

## Health check

Production smoke (no build required):

```bash
bash scripts/health-check.sh
```

## Full monitoring suite

Runs typecheck, tests, build, bundle scan, health check, and Lighthouse (if a server is already listening on port 3000):

```bash
npm run monitor
```

Skip slow or network steps:

```bash
SKIP_LIGHTHOUSE=1 SKIP_HEALTH=1 npm run monitor
```

## Related docs

- [sentry-setup.md](./sentry-setup.md) — DSN and Vercel activation
- [ops/PRODUCTION_OBSERVABILITY_SETUP.md](./ops/PRODUCTION_OBSERVABILITY_SETUP.md) — ops checklist
- [OBSERVABILITY.md](./OBSERVABILITY.md) — broader observability model
