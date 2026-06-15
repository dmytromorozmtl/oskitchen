import {
  isExperimentOtelInitialized,
  isOtelExportEnabled,
  markExperimentOtelInitialized,
} from "@/lib/observability/experiment-otel-state";

/** Register Node SDK exporter once (server runtime only). */
export async function initExperimentOtel(): Promise<void> {
  if (isExperimentOtelInitialized() || !isOtelExportEnabled()) return;
  if (process.env.NEXT_RUNTIME === "edge") return;

  const { NodeTracerProvider, BatchSpanProcessor } = await import("@opentelemetry/sdk-trace-node");
  const { OTLPTraceExporter } = await import("@opentelemetry/exporter-trace-otlp-http");
  const { Resource } = await import("@opentelemetry/resources");
  const { ATTR_SERVICE_NAME } = await import("@opentelemetry/semantic-conventions");

  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT!.trim();
  const headers: Record<string, string> = {};
  const ddKey = process.env.DD_API_KEY?.trim();
  if (ddKey) headers["dd-api-key"] = ddKey;
  const honeyKey = process.env.HONEYCOMB_API_KEY?.trim();
  if (honeyKey) headers["x-honeycomb-team"] = honeyKey;

  const provider = new NodeTracerProvider({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME?.trim() || "kitchenos-storefront-experiment",
    }),
  });

  provider.addSpanProcessor(
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: endpoint.endsWith("/v1/traces") ? endpoint : `${endpoint.replace(/\/$/, "")}/v1/traces`,
        headers,
      }),
    ),
  );

  provider.register();
  markExperimentOtelInitialized();
}
