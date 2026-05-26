import * as Sentry from "@sentry/nextjs";

import { resolveTracesSampleRate } from "@/lib/observability/apm";

const dsn = process.env.SENTRY_DSN?.trim();
if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: resolveTracesSampleRate(),
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
  });
}
