/**
 * Aggregated analytics placeholders until a metrics pipeline (Datadog / OTEL) is wired.
 * Values are explicitly non-secret and safe for owner dashboards.
 */
export function getPlatformAnalyticsStub(): {
  window: "24h" | "7d" | "30d";
  apiLatencyP50Ms: number | null;
  apiLatencyP95Ms: number | null;
  note: string;
} {
  return {
    window: "24h",
    apiLatencyP50Ms: null,
    apiLatencyP95Ms: null,
    note: "Connect OpenTelemetry or APM to populate latency percentiles.",
  };
}
