import { context, trace, propagation } from "@opentelemetry/api";

let tracerInitialized = false;

function isOtelExportEnabled(): boolean {
  return Boolean(process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim()) && process.env.EXPERIMENT_OTEL !== "0";
}

/** Register Node SDK exporter once (server runtime only). */
export async function initExperimentOtel(): Promise<void> {
  if (tracerInitialized || !isOtelExportEnabled()) return;
  if (process.env.NEXT_RUNTIME === "edge") return;

  const { NodeTracerProvider } = await import("@opentelemetry/sdk-trace-node");
  const { OTLPTraceExporter } = await import("@opentelemetry/exporter-trace-otlp-http");
  const { Resource } = await import("@opentelemetry/resources");
  const { ATTR_SERVICE_NAME } = await import("@opentelemetry/semantic-conventions");
  const { BatchSpanProcessor } = await import("@opentelemetry/sdk-trace-node");

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
  tracerInitialized = true;
}

function hexToSpanContext(traceId: string, spanId: string, parentSpanId?: string | null) {
  const carrier: Record<string, string> = {
    traceparent: `00-${traceId.padStart(32, "0").slice(0, 32)}-${spanId.padStart(16, "0").slice(0, 16)}-01`,
  };
  if (parentSpanId) {
    carrier.tracestate = `kos.parent=${parentSpanId}`;
  }
  return propagation.extract(context.active(), carrier);
}

export type ExperimentOtelSpanInput = {
  traceId: string;
  spanId: string;
  parentSpanId?: string | null;
  name: string;
  durationMs?: number;
  attributes?: Record<string, string | number | boolean | null | undefined>;
};

/**
 * Emit native OTLP span linked to KitchenOS trace headers (middleware → rsc → checkout).
 */
export function recordExperimentOtelSpan(input: ExperimentOtelSpanInput): void {
  if (!isOtelExportEnabled() || !tracerInitialized) return;

  const tracer = trace.getTracer("kitchenos-storefront-experiment");
  const parentCtx = input.parentSpanId
    ? hexToSpanContext(input.traceId, input.parentSpanId)
    : hexToSpanContext(input.traceId, input.spanId);

  const span = tracer.startSpan(
    input.name,
    {
      attributes: {
        "kos.trace_id": input.traceId,
        "kos.span_id": input.spanId,
        ...(input.parentSpanId ? { "kos.parent_span_id": input.parentSpanId } : {}),
        ...Object.fromEntries(
          Object.entries(input.attributes ?? {}).filter(([, v]) => v !== undefined && v !== null),
        ),
      },
      startTime: input.durationMs ? Date.now() - input.durationMs : undefined,
    },
    parentCtx,
  );

  if (input.durationMs) {
    span.end(Date.now());
  } else {
    span.end();
  }
}

export function experimentTraceUrl(traceId: string): string | null {
  const ddSite = process.env.DATADOG_SITE?.trim() || "datadoghq.com";
  const ddApp = process.env.DATADOG_APP_URL?.trim();
  if (ddApp) {
    return `${ddApp.replace(/\/$/, "")}/apm/traces?query=trace_id:${traceId}`;
  }
  if (process.env.DATADOG_API_KEY?.trim()) {
    return `https://app.${ddSite}/apm/traces?query=trace_id:${traceId}`;
  }
  const honeycomb = process.env.HONEYCOMB_APP_URL?.trim();
  if (honeycomb) {
    return `${honeycomb.replace(/\/$/, "")}?trace_id=${traceId}`;
  }
  return null;
}
