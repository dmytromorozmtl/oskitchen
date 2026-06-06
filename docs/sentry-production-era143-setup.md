# Sentry production smoke setup (Era 143)

Era 143 certifies Sentry production wiring: `Sentry.init()` SDK, error capture, and health probe — with `SENTRY_DSN` activation on Vercel Production.

## Wiring surfaces

| Path | Role |
|------|------|
| `instrumentation.ts` | Loads sentry.server.config + sentry.edge.config on boot |
| `instrumentation-client.ts` | Browser SDK init |
| `sentry.server.config.ts` | Server `Sentry.init()` when DSN present |
| `sentry.edge.config.ts` | Edge runtime SDK |
| `services/observability/error-reporting-service.ts` | `captureErrorSafe` wrapper |
| `app/api/health/route.ts` | `checks.sentryServer.ok` probe |
| `scripts/push-vercel-production-sentry.ts` | Vercel DSN push — `npm run sentry:production:activate` |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:sentry-production-era143` | Full era143 cert + wiring audit |
| `npm run test:ci:sentry-production-era143` | Era143 + era70 + integration tests |
| `npm run test:ci:sentry-production-era143:cert` | Wiring cert only (CI gate) |
| `npm run sentry:production:activate` | Push SENTRY_DSN to Vercel Production |

## Human activation

1. Create Sentry Next.js project and copy DSN.
2. Run `npm run sentry:production:activate -- --apply --mirror-public-dsn`.
3. Redeploy Vercel Production.
4. Verify `GET /api/health` → `checks.sentryServer.ok: true`.
5. Run `npm run smoke:sentry-production-era143` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `sdk_init` | instrumentation + sentry.*.config.ts + withSentryConfig |
| `error_capture` | captureErrorSafe + onRequestError |
| `health_probe` | /api/health sentryServer check |

## Artifact

Summary written to `artifacts/sentry-production-era143-smoke-summary.json` (gitignored).

See also: [sentry-production-setup.md](./sentry-production-setup.md)
