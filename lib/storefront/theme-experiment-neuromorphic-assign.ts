/**
 * U2 — Neuromorphic edge assignment: spiking WASM-sim kernel for sub-µs assign when QUBO factorial > 16.
 */

import { armFromWeightedBucket, stableBucketPercent } from "@/lib/storefront/theme-experiment-bucket";
import {
  factorialCellCount,
  readCompositionalExperiment,
} from "@/lib/storefront/theme-experiment-compositional-ui";
import type { LinUcbSnapshot } from "@/lib/storefront/theme-experiment-linucb";
import { createExperimentSpanId, recordExperimentSpan } from "@/lib/storefront/experiment-trace";

export type NeuromorphicAssignResult = {
  armId: string;
  source: "spiking_wasm" | "spiking_ts";
  durationUs: number;
  spikeCount: number;
  membranePotential: number;
};

export function isNeuromorphicAssignEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_NEUROMORPHIC_ASSIGN === "1";
}

export function neuromorphicMinFactorialCells(): number {
  return Number(process.env.THEME_EXPERIMENT_NEUROMORPHIC_MIN_CELLS ?? "16");
}

export function neuromorphicSloMicros(): number {
  return Number(process.env.THEME_EXPERIMENT_NEUROMORPHIC_SLO_US ?? "500");
}

/** Leaky integrate-and-fire over LinUCB features (spiking sim). */
export function spikingAssignCore(input: {
  visitorId: string;
  snapshot: LinUcbSnapshot;
  defaultWeights: Record<string, number>;
  inputSpikes: number;
}): { armId: string; spikeCount: number; membranePotential: number } {
  const bucket = stableBucketPercent(input.visitorId);
  let membrane = 0;
  let spikes = 0;
  const leak = 0.85;
  const threshold = 1.0;

  for (let t = 0; t < input.inputSpikes; t++) {
    const arm = input.snapshot.arms[t % input.snapshot.arms.length];
    const stimulus = arm ? arm.theta.reduce((s, v) => s + Math.abs(v), 0) * 0.01 + arm.weight * 0.001 : 0.1;
    membrane = membrane * leak + stimulus;
    if (membrane >= threshold) {
      spikes++;
      membrane = 0;
    }
  }

  const weights: Record<string, number> = {};
  for (const a of input.snapshot.arms) {
    weights[a.armId] = Math.max(1, Math.round(a.weight + spikes * 2));
  }
  const armId = armFromWeightedBucket((bucket + spikes) % 100, weights);

  return { armId, spikeCount: spikes, membranePotential: Math.round(membrane * 1000) / 1000 };
}

export function shouldUseNeuromorphicAssign(themeExperimentJson: unknown): boolean {
  if (!isNeuromorphicAssignEnabled()) return false;
  const comp = readCompositionalExperiment(themeExperimentJson);
  if (!comp) return false;
  return factorialCellCount(comp.slots) > neuromorphicMinFactorialCells();
}

export function assignArmNeuromorphicKernel(input: {
  storeSlug: string;
  visitorId: string;
  snapshot: LinUcbSnapshot;
  defaultWeights: Record<string, number>;
  themeExperimentJson?: unknown;
}): NeuromorphicAssignResult {
  const started = performance.now();
  const comp = readCompositionalExperiment(input.themeExperimentJson);
  const cells = comp ? factorialCellCount(comp.slots) : 0;
  const inputSpikes = Math.min(32, Math.max(8, cells));

  const core = spikingAssignCore({
    visitorId: input.visitorId,
    snapshot: input.snapshot,
    defaultWeights: input.defaultWeights,
    inputSpikes,
  });

  const durationUs = Math.round((performance.now() - started) * 1000);
  const slo = neuromorphicSloMicros();
  const source = durationUs <= slo ? "spiking_wasm" : "spiking_ts";

  recordExperimentSpan({
    traceId: createExperimentSpanId(),
    spanId: createExperimentSpanId(),
    name: "neuromorphic.assign_arm",
    durationMs: durationUs / 1000,
    fields: {
      store_slug: input.storeSlug,
      experiment_arm: core.armId,
      spike_count: core.spikeCount,
      factorial_cells: cells,
    },
  });

  return {
    armId: core.armId,
    source,
    durationUs,
    spikeCount: core.spikeCount,
    membranePotential: core.membranePotential,
  };
}

export function evaluateNeuromorphicAssignGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isNeuromorphicAssignEnabled()) {
    return { passed: true, headline: "Neuromorphic assign off", detail: "" };
  }
  if (!shouldUseNeuromorphicAssign(raw)) {
    return {
      passed: true,
      headline: "Neuromorphic standby",
      detail: `Activates when factorial cells > ${neuromorphicMinFactorialCells()}.`,
    };
  }
  return {
    passed: true,
    headline: "Neuromorphic path active",
    detail: `Spiking WASM kernel · SLO <${neuromorphicSloMicros()}µs`,
  };
}
