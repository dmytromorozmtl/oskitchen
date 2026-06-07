import * as Sentry from "@sentry/nextjs";

/** Server boot: Sentry, production readiness, OTEL. See `docs/sentry-setup.md`. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertNodeStartupReadiness } = await import(
      "./lib/startup/production-readiness"
    );
    assertNodeStartupReadiness();
    await import("./sentry.server.config");
    if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim() && process.env.EXPERIMENT_OTEL !== "0") {
      const { initExperimentOtel } = await import("./lib/observability/experiment-otel-init");
      await initExperimentOtel();
    }
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
