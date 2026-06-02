import * as Sentry from "@sentry/nextjs";

import { resolveSentryServerDsn, resolveTracesSampleRate } from "@/lib/observability/apm";

const dsn = resolveSentryServerDsn();
if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: resolveTracesSampleRate(),
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    enableLogs: true,
  });
}
