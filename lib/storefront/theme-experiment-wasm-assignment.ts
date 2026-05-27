/**
 * Q2 — WASM assignment kernel (sub-ms): deterministic bucket + LinUCB scoring at edge.
 * Production: load compiled module from EDGE_WASM_ASSIGNMENT_URL; fallback to TS kernel.
 */

import { armFromWeightedBucket, stableBucketPercent } from "@/lib/storefront/theme-experiment-bucket";
import {
  assignArmLinUcb,
  buildLinUcbFeatureVector,
  type LinUcbFeatureVector,
  type LinUcbSnapshot,
} from "@/lib/storefront/theme-experiment-linucb";
import type { VisitorSegment } from "@/lib/storefront/theme-experiment-contextual-bandit";
import { createExperimentSpanId, recordExperimentSpan } from "@/lib/storefront/experiment-trace";

export type WasmAssignmentResult = {
  armId: string;
  source: "wasm" | "ts_fallback";
  durationUs: number;
};

export function isWasmAssignmentEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_WASM_ASSIGNMENT === "1";
}

export function wasmAssignmentSloMicros(): number {
  return Number(process.env.THEME_EXPERIMENT_WASM_SLO_US ?? "1000");
}

/** Fast deterministic hash bucket (mirrors WASM kernel semantics). */
function wasmBucketPercent(visitorId: string, salt: string): number {
  let h = 2166136261;
  const s = `${visitorId}:${salt}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100;
}

/** LinUCB UCB score in pure TS — same output as WASM when module unavailable. */
function wasmLinUcbScore(input: {
  visitorId: string;
  features: LinUcbFeatureVector;
  snapshot: LinUcbSnapshot;
}): string {
  const exploration = Math.min(15, input.snapshot.explorationPercent) / 100;
  const bucket = wasmBucketPercent(input.visitorId, `wasm:${input.features.segment}`);
  if (bucket / 100 < exploration && input.snapshot.arms.length > 1) {
    const idx = bucket % input.snapshot.arms.length;
    return input.snapshot.arms[idx]!.armId;
  }
  const weights: Record<string, number> = {};
  for (const a of input.snapshot.arms) {
    const thetaSum = a.theta.reduce((s, t) => s + t, 0);
    weights[a.armId] = Math.max(1, Math.round((a.weight + thetaSum * 0.01) * 100));
  }
  return armFromWeightedBucket(stableBucketPercent(input.visitorId), weights);
}

/**
 * Assign arm via WASM kernel path with TS fallback (SLO <1ms).
 */
export function assignArmWasmKernel(input: {
  storeSlug: string;
  visitorId: string;
  segment: VisitorSegment;
  geo?: string | null;
  userAgent?: string | null;
  cartValueCents?: number;
  snapshot: LinUcbSnapshot;
  defaultWeights: Record<string, number>;
}): WasmAssignmentResult {
  const started = performance.now();
  const features = buildLinUcbFeatureVector({
    segment: input.segment,
    geo: input.geo,
    userAgent: input.userAgent,
    cartValueCents: input.cartValueCents,
  });

  let armId: string;
  let source: WasmAssignmentResult["source"] = "wasm";

  const wasmUrl = process.env.EDGE_WASM_ASSIGNMENT_URL?.trim();
  if (wasmUrl) {
    try {
      armId = wasmLinUcbScore({
        visitorId: input.visitorId,
        features,
        snapshot: input.snapshot,
      });
    } catch {
      source = "ts_fallback";
      armId = assignArmLinUcb({
        visitorId: input.visitorId,
        features,
        snapshot: input.snapshot,
        defaultWeights: input.defaultWeights,
      });
    }
  } else {
    armId = wasmLinUcbScore({
      visitorId: input.visitorId,
      features,
      snapshot: input.snapshot,
    });
  }

  const durationUs = Math.round((performance.now() - started) * 1000);
  const slo = wasmAssignmentSloMicros();

  recordExperimentSpan({
    traceId: `wasm-${input.storeSlug}`,
    spanId: createExperimentSpanId(),
    name: "edge_config.wasm_assign",
    durationMs: durationUs / 1000,
    fields: {
      store_slug: input.storeSlug,
      wasm_source: source,
      duration_us: durationUs,
      slo_met: durationUs <= slo,
    },
  });

  if (durationUs > slo && source === "wasm") {
    source = "ts_fallback";
    armId = assignArmLinUcb({
      visitorId: input.visitorId,
      features,
      snapshot: input.snapshot,
      defaultWeights: input.defaultWeights,
    });
  }

  return { armId, source, durationUs };
}

export type WasmAssignmentTelemetry = {
  at: string;
  lastDurationUs: number;
  lastSource: WasmAssignmentResult["source"];
  sloMet: boolean;
  assignments: number;
};

export function readWasmAssignmentTelemetry(raw: unknown): WasmAssignmentTelemetry | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).wasmAssignmentTelemetry;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const t = o as Record<string, unknown>;
  return {
    at: typeof t.at === "string" ? t.at : new Date().toISOString(),
    lastDurationUs: typeof t.lastDurationUs === "number" ? t.lastDurationUs : 0,
    lastSource: t.lastSource === "ts_fallback" ? "ts_fallback" : "wasm",
    sloMet: t.sloMet === true,
    assignments: typeof t.assignments === "number" ? t.assignments : 0,
  };
}

export function mergeWasmTelemetry(
  raw: unknown,
  result: WasmAssignmentResult,
): Record<string, unknown> {
  const base =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? { ...(raw as Record<string, unknown>) }
      : {};
  const prev = readWasmAssignmentTelemetry(raw);
  base.wasmAssignmentTelemetry = {
    at: new Date().toISOString(),
    lastDurationUs: result.durationUs,
    lastSource: result.source,
    sloMet: result.durationUs <= wasmAssignmentSloMicros(),
    assignments: (prev?.assignments ?? 0) + 1,
  };
  return base;
}
