/**
 * W2 — Biological neuron assignment: wetware-sim fallback when photonic factorial > 64 cells.
 */

import { armFromWeightedBucket, stableBucketPercent } from "@/lib/storefront/theme-experiment-bucket";
import {
  factorialCellCount,
  readCompositionalExperiment,
} from "@/lib/storefront/theme-experiment-compositional-ui";
import type { LinUcbSnapshot } from "@/lib/storefront/theme-experiment-linucb";
import { createExperimentSpanId, recordExperimentSpan } from "@/lib/storefront/experiment-trace";
import {
  applyWetwareCalibrationToSnapshot,
  isWetwareCalibrationEnabled,
} from "@/lib/storefront/theme-experiment-wetware-calibration";

export type BioNeuronAssignResult = {
  armId: string;
  source: "wetware_sim" | "wetware_fallback";
  durationUs: number;
  synapticStrength: number;
  actionPotentials: number;
};

export function isBioNeuronAssignEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_BIO_NEURON_ASSIGN === "1";
}

export function bioNeuronMinFactorialCells(): number {
  return Number(process.env.THEME_EXPERIMENT_BIO_NEURON_MIN_CELLS ?? "64");
}

export function bioNeuronSloMicros(): number {
  return Number(process.env.THEME_EXPERIMENT_BIO_NEURON_SLO_US ?? "800");
}

/** Hodgkin-Huxley simplified wetware sim over arm weights. */
export function wetwareAssignCore(input: {
  visitorId: string;
  snapshot: LinUcbSnapshot;
  defaultWeights: Record<string, number>;
  synapses: number;
}): { armId: string; synapticStrength: number; actionPotentials: number } {
  const bucket = stableBucketPercent(input.visitorId);
  let membrane = -65;
  let spikes = 0;
  const weights: Record<string, number> = {};

  for (const a of input.snapshot.arms) {
    let current = 0;
    for (let s = 0; s < input.synapses; s++) {
      const stimulus = (a.theta[s % a.theta.length] ?? 0) * 0.5 + a.weight * 0.002;
      membrane += stimulus;
      if (membrane > -50) {
        spikes++;
        membrane = -70;
        current += 1;
      }
      membrane *= 0.92;
    }
    weights[a.armId] = Math.max(1, Math.round(a.weight + current * 3));
  }

  const armId = armFromWeightedBucket((bucket + spikes) % 100, weights);
  return {
    armId: armId || armFromWeightedBucket(bucket, input.defaultWeights),
    synapticStrength: Math.round((spikes / Math.max(1, input.synapses)) * 100) / 100,
    actionPotentials: spikes,
  };
}

export function shouldUseBioNeuronAssign(themeExperimentJson: unknown): boolean {
  if (!isBioNeuronAssignEnabled()) return false;
  const comp = readCompositionalExperiment(themeExperimentJson);
  if (!comp) return false;
  return factorialCellCount(comp.slots) > bioNeuronMinFactorialCells();
}

export function assignArmBioNeuronKernel(input: {
  storeSlug: string;
  visitorId: string;
  snapshot: LinUcbSnapshot;
  defaultWeights: Record<string, number>;
  themeExperimentJson?: unknown;
}): BioNeuronAssignResult {
  const started = performance.now();
  const comp = readCompositionalExperiment(input.themeExperimentJson);
  const cells = comp ? factorialCellCount(comp.slots) : 0;
  const synapses = Math.min(48, Math.max(12, Math.ceil(cells / 2)));

  const snapshot =
    isWetwareCalibrationEnabled() && input.themeExperimentJson
      ? applyWetwareCalibrationToSnapshot(input.snapshot, input.themeExperimentJson)
      : input.snapshot;

  const core = wetwareAssignCore({
    visitorId: input.visitorId,
    snapshot,
    defaultWeights: input.defaultWeights,
    synapses,
  });

  const durationUs = Math.round((performance.now() - started) * 1000);
  const slo = bioNeuronSloMicros();
  const source = durationUs <= slo ? "wetware_sim" : "wetware_fallback";

  recordExperimentSpan({
    traceId: createExperimentSpanId(),
    spanId: createExperimentSpanId(),
    name: "bio_neuron.assign_arm",
    durationMs: durationUs / 1000,
    fields: {
      store_slug: input.storeSlug,
      experiment_arm: core.armId,
      action_potentials: core.actionPotentials,
      factorial_cells: cells,
    },
  });

  return {
    armId: core.armId,
    source,
    durationUs,
    synapticStrength: core.synapticStrength,
    actionPotentials: core.actionPotentials,
  };
}

export function evaluateBioNeuronAssignGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isBioNeuronAssignEnabled()) {
    return { passed: true, headline: "Bio-neuron assign off", detail: "" };
  }
  if (!shouldUseBioNeuronAssign(raw)) {
    return {
      passed: true,
      headline: "Bio-neuron standby",
      detail: `Activates when factorial cells > ${bioNeuronMinFactorialCells()}.`,
    };
  }
  return {
    passed: true,
    headline: "Wetware assign path active",
    detail: `Hodgkin-Huxley sim · SLO <${bioNeuronSloMicros()}µs`,
  };
}
