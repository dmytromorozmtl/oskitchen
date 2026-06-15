import {
  isExperimentOtelInitialized,
  isOtelExportEnabled,
} from "@/lib/observability/experiment-otel-state";

export type ExperimentOtelSpanInput = {
  traceId: string;
  spanId: string;
  parentSpanId?: string | null;
  name: string;
  durationMs?: number;
  attributes?: Record<string, string | number | boolean | null | undefined>;
};

function hexToSpanContext(
  api: typeof import("@opentelemetry/api"),
  traceId: string,
  spanId: string,
  parentSpanId?: string | null,
) {
  const carrier: Record<string, string> = {
    traceparent: `00-${traceId.padStart(32, "0").slice(0, 32)}-${spanId.padStart(16, "0").slice(0, 16)}-01`,
  };
  if (parentSpanId) {
    carrier.tracestate = `kos.parent=${parentSpanId}`;
  }
  return api.propagation.extract(api.context.active(), carrier);
}

/**
 * Emit native OTLP span linked to OS Kitchen trace headers (middleware → rsc → checkout).
 * Loads @opentelemetry/api only when OTEL export is enabled and the SDK was initialized.
 */
export async function recordExperimentOtelSpan(input: ExperimentOtelSpanInput): Promise<void> {
  if (!isOtelExportEnabled() || !isExperimentOtelInitialized()) return;

  const api = await import("@opentelemetry/api");
  const tracer = api.trace.getTracer("kitchenos-storefront-experiment");
  const parentCtx = input.parentSpanId
    ? hexToSpanContext(api, input.traceId, input.parentSpanId)
    : hexToSpanContext(api, input.traceId, input.spanId);

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
