import { logger } from "@/lib/logger";
import { recordExperimentOtelSpan } from "@/lib/observability/experiment-otel";

export const KOS_TRACE_ID_HEADER = "x-kos-trace-id";
export const KOS_SPAN_ID_HEADER = "x-kos-span-id";
export const KOS_PARENT_SPAN_ID_HEADER = "x-kos-parent-span-id";

export type ExperimentSpanName =
  | "middleware.assign_arm"
  | "rsc.theme"
  | "checkout_submit"
  | "edge_config.read"
  | "edge_config.majority_read"
  | "edge_config.planet_read"
  | "edge_config.wasm_assign"
  | "crdt.gossip_merge"
  | "crdt.lww_merge"
  | "ebpf.assign_arm"
  | "bio_neuron.assign_arm"
  | "neuromorphic.assign_arm"
  | "organoid.assign_arm"
  | "photonic.assign_arm"
  | "qubo.assign_arm";

export type ExperimentSpanFields = Record<string, string | number | boolean | null | undefined>;

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function createExperimentTraceId(): string {
  return randomHex(16);
}

export function createExperimentSpanId(): string {
  return randomHex(8);
}

export function traceIdFromHeaders(headers: Headers): string | null {
  const v = headers.get(KOS_TRACE_ID_HEADER)?.trim();
  return v && /^[a-f0-9]{32}$/i.test(v) ? v : null;
}

export function ensureTraceId(existing: string | null | undefined): string {
  if (existing && /^[a-f0-9]{32}$/i.test(existing)) return existing;
  return createExperimentTraceId();
}

/** Stamp trace context on forward request + response for RSC/analytics correlation. */
export function stampExperimentTraceHeaders(input: {
  requestHeaders: Headers;
  responseHeaders: Headers;
  traceId: string;
  spanId: string;
  parentSpanId?: string | null;
}): void {
  input.requestHeaders.set(KOS_TRACE_ID_HEADER, input.traceId);
  input.requestHeaders.set(KOS_SPAN_ID_HEADER, input.spanId);
  if (input.parentSpanId) {
    input.requestHeaders.set(KOS_PARENT_SPAN_ID_HEADER, input.parentSpanId);
  }
  input.responseHeaders.set(KOS_TRACE_ID_HEADER, input.traceId);
  input.responseHeaders.set(KOS_SPAN_ID_HEADER, input.spanId);
}

/**
 * Structured experiment span — correlates in Datadog/Honeycomb via `trace_id`.
 * Filter: `event_type = experiment_span`.
 */
export function recordExperimentSpan(input: {
  traceId: string;
  spanId: string;
  parentSpanId?: string | null;
  name: ExperimentSpanName;
  durationMs?: number;
  fields?: ExperimentSpanFields;
}): void {
  if (process.env.EXPERIMENT_TRACE_ENABLED === "0") return;

  logger.info("experiment_span", {
    event_type: "experiment_span",
    trace_id: input.traceId,
    span_id: input.spanId,
    parent_span_id: input.parentSpanId ?? null,
    span_name: input.name,
    duration_ms: input.durationMs ?? null,
    service: "kitchenos-storefront",
    ...input.fields,
  });

  recordExperimentOtelSpan({
    traceId: input.traceId,
    spanId: input.spanId,
    parentSpanId: input.parentSpanId,
    name: input.name,
    durationMs: input.durationMs,
    attributes: input.fields as Record<string, string | number | boolean | null | undefined>,
  });
}
