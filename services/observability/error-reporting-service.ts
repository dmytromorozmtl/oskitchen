import * as Sentry from "@sentry/nextjs";

import { resolveObservabilityBackend } from "@/lib/observability/observability-config";
import { redactObservabilityContext } from "@/lib/observability/redaction";
import { logger } from "@/lib/logger";

function serverSentryDsnPresent(): boolean {
  return Boolean(process.env.SENTRY_DSN?.trim());
}

/**
 * Captures to Sentry when `SENTRY_DSN` is set and the Node SDK finished `Sentry.init` (via `instrumentation.ts`).
 * Otherwise no-op — never sends raw payloads or secrets through this helper.
 */
export function captureErrorSafe(err: unknown, context?: Record<string, string>): void {
  const backend = resolveObservabilityBackend();
  if (backend !== "SENTRY" || !serverSentryDsnPresent()) {
    return;
  }

  const client = Sentry.getClient();
  if (!client) {
    if (process.env.NODE_ENV === "development") {
      logger.warn("[observability] SENTRY_DSN is set but Sentry client is not initialized (check instrumentation).");
    }
    return;
  }

  Sentry.withScope((scope) => {
    const redacted = redactObservabilityContext(context);
    if (redacted) {
      for (const [k, v] of Object.entries(redacted)) {
        scope.setTag(k, v.length > 200 ? `${v.slice(0, 200)}…` : v);
      }
    }
    const ex =
      err instanceof Error
        ? err
        : new Error(typeof err === "string" ? err : JSON.stringify(err));
    Sentry.captureException(ex);
  });
}
