/** Server boot: production readiness, Sentry (`sentry.server.config` when `SENTRY_DSN` set), OTEL. See `docs/sentry-setup.md`. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertNodeStartupReadiness } = await import(
      "./lib/startup/production-readiness"
    );
    assertNodeStartupReadiness();
    await import("./sentry.server.config");
    const { initExperimentOtel } = await import("./lib/observability/experiment-otel");
    await initExperimentOtel();
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
