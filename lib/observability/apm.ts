import * as Sentry from "@sentry/nextjs";

import { resolveObservabilityBackend } from "@/lib/observability/observability-config";

/** Sample rate for performance traces (server). Override via SENTRY_TRACES_SAMPLE_RATE. */
export function resolveTracesSampleRate(): number {
  const raw = process.env.SENTRY_TRACES_SAMPLE_RATE?.trim();
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0 && n <= 1) return n;
  }
  return process.env.NODE_ENV === "production" ? 0.1 : 1;
}

/**
 * Idempotent APM init — complements sentry.*.config.ts when imported from hot paths.
 * Safe to call multiple times; Sentry ignores duplicate init.
 */
export function initAPM(): void {
  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn || resolveObservabilityBackend() !== "SENTRY") return;

  Sentry.init({
    dsn,
    tracesSampleRate: resolveTracesSampleRate(),
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
  });
}

/** Wrap async work in a Sentry performance span when APM is configured. */
export async function tracePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  attributes?: Record<string, string | number | boolean>,
): Promise<T> {
  if (resolveObservabilityBackend() !== "SENTRY") {
    return fn();
  }

  return Sentry.startSpan({ name, op: "function", attributes }, async (span) => {
    try {
      const result = await fn();
      span.setStatus({ code: 1, message: "ok" });
      return result;
    } catch (err) {
      span.setStatus({
        code: 2,
        message: err instanceof Error ? err.message : "internal_error",
      });
      throw err;
    }
  });
}
