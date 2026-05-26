export type ObservabilityBackend = "NONE" | "SENTRY" | "OTEL";

export function resolveObservabilityBackend(): ObservabilityBackend {
  if (process.env.SENTRY_DSN?.trim()) return "SENTRY";
  if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim()) return "OTEL";
  return "NONE";
}
