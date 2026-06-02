# Sentry setup — OS Kitchen (official Next.js SDK)

Follows [Sentry for AI — Next.js SDK skill](https://github.com/getsentry/sentry-for-ai/blob/main/skills/sentry-nextjs-sdk/SKILL.md).

Production health reports `sentryServer.ok: false` when `SENTRY_DSN` is unset. This guide activates the live SDK.

## Prerequisites

- Sentry project at [sentry.io](https://sentry.io) (Next.js)
- Vercel access for `os-kitchen.com`
- `@sentry/nextjs` in `package.json` — run `npm install @sentry/nextjs@latest` after pulling

## How initialization works

| Layer | File | Trigger |
|-------|------|---------|
| Instrumentation hook | `instrumentation.ts` | `register()` + `onRequestError` |
| Node server SDK | `sentry.server.config.ts` | `SENTRY_DSN` (or public DSN fallback) |
| Edge SDK | `sentry.edge.config.ts` | Same as server |
| Browser SDK | `instrumentation-client.ts` | `NEXT_PUBLIC_SENTRY_DSN` — Replay + Feedback |
| Build plugin | `next.config.ts` → `withSentryConfig` | Source maps when `SENTRY_AUTH_TOKEN` set |
| Tunnel (ad-blocker bypass) | `/monitoring` | Created by Sentry webpack plugin |
| Root errors | `app/global-error.tsx` | `Sentry.captureException` |
| Safe capture API | `captureErrorSafe()` | Server paths; no-op without DSN |

## Environment variables (Vercel Production)

| Variable | Required | Notes |
|----------|:--------:|-------|
| `SENTRY_DSN` | **Yes** | Server + edge |
| `NEXT_PUBLIC_SENTRY_DSN` | Recommended | Browser, Replay, Feedback |
| `SENTRY_TRACES_SAMPLE_RATE` | No | Default `0.1` prod / `1` dev (`lib/observability/apm.ts`) |
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | No | Default `0.1` prod / `1` dev |
| `SENTRY_AUTH_TOKEN` | Build only | Source map upload — **never commit** |
| `SENTRY_ORG` | Build | Default `os-kitchen` in `next.config.ts` |
| `SENTRY_PROJECT` | Build | Default `os-kitchen` |

Local build with source maps (gitignored):

```bash
# .env.sentry-build-plugin
SENTRY_AUTH_TOKEN=sntrys_...
```

## Activate on Vercel

```bash
npm run sentry:production:activate
# Apply + redeploy:
SENTRY_DSN=https://YOUR_DSN NEXT_PUBLIC_SENTRY_DSN=https://YOUR_DSN \
  npm run sentry:production:activate -- --apply --deploy
```

## Verify

```bash
curl -s https://os-kitchen.com/api/health | jq '.checks.sentryServer, .checks.observability'
```

Expect `sentryServer.ok: true` and `status: "live"` after redeploy.

Optional smoke (staging only):

```typescript
import { captureErrorSafe } from "@/services/observability/error-reporting-service";
captureErrorSafe(new Error("Sentry smoke test"), { tags: { smoke: "sentry-setup" } });
```

## Do not

- Commit `SENTRY_AUTH_TOKEN` or `.sentryclirc`
- Use `tracesSampleRate: 1.0` in production (defaults are env-aware)
- Call `Sentry.init` in both `instrumentation-client.ts` and `sentry.client.config.ts`

## Related

- [monitoring.md](./monitoring.md) — Lighthouse, bundle, health scripts
- [SENTRY_ALERT_RULES.md](./SENTRY_ALERT_RULES.md) — alert rules
