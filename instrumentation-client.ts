import * as Sentry from "@sentry/nextjs";

import { resolveClientTracesSampleRate, resolveSentryRelease } from "@/lib/observability/apm";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
if (dsn) {
  const browserIntegrations =
    typeof window !== "undefined"
      ? [
          Sentry.replayIntegration(),
          Sentry.feedbackIntegration({
            colorScheme: "system",
          }),
        ]
      : [];

  Sentry.init({
    dsn,
    tracesSampleRate: resolveClientTracesSampleRate(),
    release: resolveSentryRelease(),
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    enableLogs: true,
    integrations: browserIntegrations,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
