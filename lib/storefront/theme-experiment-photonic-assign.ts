/**
 * V2 — Photonic co-processor assignment: simulated photonic matmul for LinUCB at >32 factorial cells.
 */

import { armFromWeightedBucket, stableBucketPercent } from "@/lib/storefront/theme-experiment-bucket";
import {
  factorialCellCount,
  readCompositionalExperiment,
} from "@/lib/storefront/theme-experiment-compositional-ui";
import type { LinUcbSnapshot } from "@/lib/storefront/theme-experiment-linucb";
import { createExperimentSpanId, recordExperimentSpan } from "@/lib/storefront/experiment-trace";

export type PhotonicAssignResult = {
  armId: string;
  source: "photonic_sim" | "photonic_fallback";
  durationUs: number;
  matrixDim: number;
  opticalPowerMw: number;
};

export function isPhotonicAssignEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_PHOTONIC_ASSIGN === "1";
}

export function photonicMinFactorialCells(): number {
  return Number(process.env.THEME_EXPERIMENT_PHOTONIC_MIN_CELLS ?? "32");
}

export function photonicSloMicros(): number {
  return Number(process.env.THEME_EXPERIMENT_PHOTONIC_SLO_US ?? "300");
}

/** Simulated photonic matrix multiply (MZI mesh) over arm theta vectors. */
export function photonicMatmulAssign(input: {
  visitorId: string;
  snapshot: LinUcbSnapshot;
  defaultWeights: Record<string, number>;
  dim: number;
}): { armId: string; opticalPowerMw: number } {
  const bucket = stableBucketPercent(input.visitorId);
  const scores: Record<string, number> = {};

  for (const a of input.snapshot.arms) {
    let dot = 0;
    for (let i = 0; i < Math.min(input.dim, a.theta.length); i++) {
      const phase = (a.theta[i] ?? 0) * Math.PI;
      dot += Math.cos(phase) * Math.sin(phase * (i + 1));
    }
    scores[a.armId] = Math.max(0.001, dot + a.weight * 0.01);
  }

  const opticalPowerMw = Object.values(scores).reduce((s, v) => s + v, 0) * 0.5;
  const armId = armFromWeightedBucket(bucket, scores);
  return { armId: armId || armFromWeightedBucket(bucket, input.defaultWeights), opticalPowerMw };
}

export function shouldUsePhotonicAssign(themeExperimentJson: unknown): boolean {
  if (!isPhotonicAssignEnabled()) return false;
  const comp = readCompositionalExperiment(themeExperimentJson);
  if (!comp) return false;
  return factorialCellCount(comp.slots) > photonicMinFactorialCells();
}

export function assignArmPhotonicKernel(input: {
  storeSlug: string;
  visitorId: string;
  snapshot: LinUcbSnapshot;
  defaultWeights: Record<string, number>;
  themeExperimentJson?: unknown;
}): PhotonicAssignResult {
  const started = performance.now();
  const comp = readCompositionalExperiment(input.themeExperimentJson);
  const cells = comp ? factorialCellCount(comp.slots) : 0;
  const dim = Math.min(16, Math.max(4, Math.ceil(Math.sqrt(cells))));

  const { armId, opticalPowerMw } = photonicMatmulAssign({
    visitorId: input.visitorId,
    snapshot: input.snapshot,
    defaultWeights: input.defaultWeights,
    dim,
  });

  const durationUs = Math.round((performance.now() - started) * 1000);
  const slo = photonicSloMicros();
  const source = durationUs <= slo ? "photonic_sim" : "photonic_fallback";

  recordExperimentSpan({
    traceId: createExperimentSpanId(),
    spanId: createExperimentSpanId(),
    name: "photonic.assign_arm",
    durationMs: durationUs / 1000,
    fields: {
      store_slug: input.storeSlug,
      experiment_arm: armId,
      optical_power_mw: opticalPowerMw,
      factorial_cells: cells,
    },
  });

  return { armId, source, durationUs, matrixDim: dim, opticalPowerMw };
}

export function evaluatePhotonicAssignGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isPhotonicAssignEnabled()) {
    return { passed: true, headline: "Photonic assign off", detail: "" };
  }
  if (!shouldUsePhotonicAssign(raw)) {
    return {
      passed: true,
      headline: "Photonic standby",
      detail: `Activates when factorial cells > ${photonicMinFactorialCells()}.`,
    };
  }
  return {
    passed: true,
    headline: "Photonic co-processor active",
    detail: `Photonic matmul · SLO <${photonicSloMicros()}µs`,
  };
}
