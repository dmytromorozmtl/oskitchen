/**
 * Y2 — Organoid wetware cluster: multi-synapse ensemble assign with variance reduction (X2 + W2).
 */

import { armFromWeightedBucket, stableBucketPercent } from "@/lib/storefront/theme-experiment-bucket";
import {
  isBioNeuronAssignEnabled,
  shouldUseBioNeuronAssign,
  wetwareAssignCore,
} from "@/lib/storefront/theme-experiment-bio-neuron-assign";
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
import { applyCorticalMeshToWetwareJson } from "@/lib/storefront/theme-experiment-cortical-organoid-mesh";
import { applyHippocampalMeshToWetwareJson } from "@/lib/storefront/theme-experiment-hippocampal-organoid-mesh";
import { applyPrefrontalMeshToWetwareJson } from "@/lib/storefront/theme-experiment-prefrontal-organoid-mesh";
import { applyEthicsVetoToWetwareJson } from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";
import { applyCerebellarReflexToWetwareJson } from "@/lib/storefront/theme-experiment-cerebellar-motor-organoid";
import { applyBrainstemAutonomicToWetwareJson } from "@/lib/storefront/theme-experiment-brainstem-autonomic-guard";
import { applySpinalThrottleToWetwareJson } from "@/lib/storefront/theme-experiment-spinal-cord-publish-throttle";
import { applyMedullaEmergencyToWetwareJson } from "@/lib/storefront/theme-experiment-medulla-oblongata-emergency-halt";
import { applyPonsFailoverToWetwareJson } from "@/lib/storefront/theme-experiment-pons-autonomic-bridge-failover";
import { applyMidbrainArousalToWetwareJson } from "@/lib/storefront/theme-experiment-midbrain-arousal-publish-pacing";
import { applyThalamusSensoryToWetwareJson } from "@/lib/storefront/theme-experiment-thalamus-sensory-gating-publish";
import { applyBasalGangliaActionToWetwareJson } from "@/lib/storefront/theme-experiment-basal-ganglia-action-selection-publish";
import { applyCerebellumRefinementToWetwareJson } from "@/lib/storefront/theme-experiment-cerebellum-motor-refinement-publish";
import { applyMotorCortexExecutionToWetwareJson } from "@/lib/storefront/theme-experiment-motor-cortex-execution-publish";
import { applyPremotorSmaPlanningToWetwareJson } from "@/lib/storefront/theme-experiment-premotor-sma-planning-publish";

export type OrganoidAssignResult = {
  armId: string;
  source: "organoid_ensemble" | "organoid_fallback";
  durationUs: number;
  ensembleSize: number;
  varianceReduced: number;
  consensusStrength: number;
};

export function isOrganoidWetwareEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_ORGANOID_WETWARE === "1";
}

export function organoidEnsembleSize(): number {
  return Number(process.env.THEME_EXPERIMENT_ORGANOID_ENSEMBLE_SIZE ?? "5");
}

export function organoidMaxVariance(): number {
  return Number(process.env.THEME_EXPERIMENT_ORGANOID_MAX_VARIANCE ?? "0.15");
}

export function shouldUseOrganoidWetware(themeExperimentJson: unknown): boolean {
  if (!isOrganoidWetwareEnabled()) return false;
  return shouldUseBioNeuronAssign(themeExperimentJson);
}

/** Run N wetware cores and majority-vote arm with variance penalty. */
export function organoidEnsembleAssign(input: {
  visitorId: string;
  snapshot: LinUcbSnapshot;
  defaultWeights: Record<string, number>;
  synapses: number;
  ensembleSize: number;
}): {
  armId: string;
  varianceReduced: number;
  consensusStrength: number;
} {
  const votes = new Map<string, number>();
  const strengths: number[] = [];

  for (let e = 0; e < input.ensembleSize; e++) {
    const seedVisitor = `${input.visitorId}:organoid:${e}`;
    const core = wetwareAssignCore({
      visitorId: seedVisitor,
      snapshot: input.snapshot,
      defaultWeights: input.defaultWeights,
      synapses: input.synapses,
    });
    votes.set(core.armId, (votes.get(core.armId) ?? 0) + 1);
    strengths.push(core.synapticStrength);
  }

  let bestArm = "";
  let bestVotes = 0;
  for (const [armId, count] of votes) {
    if (count > bestVotes) {
      bestVotes = count;
      bestArm = armId;
    }
  }

  const mean = strengths.reduce((s, v) => s + v, 0) / Math.max(1, strengths.length);
  const variance =
    strengths.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(1, strengths.length);
  const varianceReduced = Math.max(0, Math.round((organoidMaxVariance() - variance) * 100) / 100);
  const consensusStrength = bestVotes / input.ensembleSize;

  const bucket = stableBucketPercent(input.visitorId);
  const armId =
    bestArm ||
    armFromWeightedBucket(bucket, input.defaultWeights) ||
    input.snapshot.arms[0]?.armId ||
    "published";

  return { armId, varianceReduced, consensusStrength };
}

export function assignArmOrganoidKernel(input: {
  storeSlug: string;
  visitorId: string;
  snapshot: LinUcbSnapshot;
  defaultWeights: Record<string, number>;
  themeExperimentJson?: unknown;
}): OrganoidAssignResult {
  const started = performance.now();

  let themeJson =
    input.themeExperimentJson && typeof input.themeExperimentJson === "object"
      ? applyCorticalMeshToWetwareJson(input.themeExperimentJson)
      : input.themeExperimentJson;
  if (themeJson && typeof themeJson === "object") {
    themeJson = applyHippocampalMeshToWetwareJson(themeJson);
    themeJson = applyPrefrontalMeshToWetwareJson(themeJson);
    themeJson = applyEthicsVetoToWetwareJson(themeJson);
    themeJson = applyCerebellarReflexToWetwareJson(themeJson);
    themeJson = applyBrainstemAutonomicToWetwareJson(themeJson);
    themeJson = applySpinalThrottleToWetwareJson(themeJson);
    themeJson = applyMedullaEmergencyToWetwareJson(themeJson);
    themeJson = applyPonsFailoverToWetwareJson(themeJson);
    themeJson = applyMidbrainArousalToWetwareJson(themeJson);
    themeJson = applyThalamusSensoryToWetwareJson(themeJson);
    themeJson = applyBasalGangliaActionToWetwareJson(themeJson);
    themeJson = applyCerebellumRefinementToWetwareJson(themeJson);
    themeJson = applyMotorCortexExecutionToWetwareJson(themeJson);
    themeJson = applyPremotorSmaPlanningToWetwareJson(themeJson);
  }

  const comp = readCompositionalExperiment(themeJson ?? input.themeExperimentJson);
  const cells = comp ? factorialCellCount(comp.slots) : 0;
  const synapses = Math.min(64, Math.max(16, Math.ceil(cells / 2)));
  const ensembleSize = organoidEnsembleSize();

  let snapshot = input.snapshot;
  if (isWetwareCalibrationEnabled() && themeJson) {
    snapshot = applyWetwareCalibrationToSnapshot(snapshot, themeJson);
  }

  const core = organoidEnsembleAssign({
    visitorId: input.visitorId,
    snapshot,
    defaultWeights: input.defaultWeights,
    synapses,
    ensembleSize,
  });

  const durationUs = Math.round((performance.now() - started) * 1000);
  const slo = Number(process.env.THEME_EXPERIMENT_ORGANOID_SLO_US ?? "1200");
  const source = durationUs <= slo ? "organoid_ensemble" : "organoid_fallback";

  recordExperimentSpan({
    traceId: createExperimentSpanId(),
    spanId: createExperimentSpanId(),
    name: "organoid.assign_arm",
    durationMs: durationUs / 1000,
    fields: {
      store_slug: input.storeSlug,
      experiment_arm: core.armId,
      ensemble_size: ensembleSize,
      consensus: core.consensusStrength,
    },
  });

  return {
    armId: core.armId,
    source,
    durationUs,
    ensembleSize,
    varianceReduced: core.varianceReduced,
    consensusStrength: core.consensusStrength,
  };
}

export function evaluateOrganoidWetwareGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isOrganoidWetwareEnabled()) {
    return { passed: true, headline: "Organoid wetware off", detail: "" };
  }
  if (!isBioNeuronAssignEnabled()) {
    return {
      passed: false,
      headline: "Bio-neuron assign required",
      detail: "Enable THEME_EXPERIMENT_BIO_NEURON_ASSIGN=1 (W2).",
    };
  }
  if (!isWetwareCalibrationEnabled()) {
    return {
      passed: false,
      headline: "Wetware calibration required",
      detail: "Enable THEME_EXPERIMENT_WETWARE_CALIBRATION=1 (X2).",
    };
  }
  if (!shouldUseOrganoidWetware(raw)) {
    return {
      passed: true,
      headline: "Organoid standby",
      detail: "Activates with bio-neuron path (>64 factorial cells).",
    };
  }
  return {
    passed: true,
    headline: `Organoid ensemble active (n=${organoidEnsembleSize()})`,
    detail: `Variance cap ${organoidMaxVariance()} · multi-synapse vote`,
  };
}
