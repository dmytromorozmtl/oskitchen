/**
 * X2 — Online wetware calibration: synaptic plasticity from assignment outcomes (W2 + U2).
 */

import type { LinUcbSnapshot } from "@/lib/storefront/theme-experiment-linucb";
import {
  isBioNeuronAssignEnabled,
  shouldUseBioNeuronAssign,
} from "@/lib/storefront/theme-experiment-bio-neuron-assign";
import { isNeuromorphicAssignEnabled } from "@/lib/storefront/theme-experiment-neuromorphic-assign";

export type WetwareSynapse = {
  armId: string;
  weight: number;
  lastOutcome: "win" | "loss" | "neutral";
  plasticity: number;
  updates: number;
};

export type WetwareCalibrationSnapshot = {
  at: string;
  synapses: WetwareSynapse[];
  learningRate: number;
  calibrated: boolean;
  totalOutcomes: number;
};

export function isWetwareCalibrationEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_WETWARE_CALIBRATION === "1";
}

export function wetwareLearningRate(): number {
  return Number(process.env.THEME_EXPERIMENT_WETWARE_LEARNING_RATE ?? "0.05");
}

export function wetwareMinOutcomesForCalibrated(): number {
  return Number(process.env.THEME_EXPERIMENT_WETWARE_MIN_OUTCOMES ?? "20");
}

export function readWetwareCalibration(raw: unknown): WetwareCalibrationSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).wetwareCalibration;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    synapses: Array.isArray(s.synapses) ? (s.synapses as WetwareSynapse[]) : [],
    learningRate: typeof s.learningRate === "number" ? s.learningRate : wetwareLearningRate(),
    calibrated: s.calibrated === true,
    totalOutcomes: typeof s.totalOutcomes === "number" ? s.totalOutcomes : 0,
  };
}

export function mergeWetwareCalibration(
  previousRaw: unknown,
  snap: WetwareCalibrationSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.wetwareCalibration = snap;
  return base;
}

/** Hebbian-style update: strengthen winning arm synapse, weaken others. */
export function recordWetwareOutcome(
  previousRaw: unknown,
  outcome: {
    armId: string;
    converted: boolean;
    liftSignal?: number;
    snapshot?: LinUcbSnapshot;
  },
): { json: Record<string, unknown>; snap: WetwareCalibrationSnapshot } {
  const prev = readWetwareCalibration(previousRaw);
  const lr = prev?.learningRate ?? wetwareLearningRate();
  const synapseMap = new Map<string, WetwareSynapse>();

  for (const s of prev?.synapses ?? []) {
    synapseMap.set(s.armId, { ...s });
  }
  for (const a of outcome.snapshot?.arms ?? []) {
    if (!synapseMap.has(a.armId)) {
      synapseMap.set(a.armId, {
        armId: a.armId,
        weight: a.weight,
        lastOutcome: "neutral",
        plasticity: 1,
        updates: 0,
      });
    }
  }

  const signal = outcome.liftSignal ?? (outcome.converted ? 1 : -0.2);
  for (const [armId, syn] of synapseMap) {
    const delta = armId === outcome.armId ? lr * signal : -lr * signal * 0.25;
    const weight = Math.max(1, Math.round(syn.weight + delta * 10));
    const plasticity = Math.min(2, Math.max(0.1, syn.plasticity + (armId === outcome.armId ? 0.02 : -0.01)));
    synapseMap.set(armId, {
      armId,
      weight,
      lastOutcome:
        armId === outcome.armId ? (outcome.converted ? "win" : "loss") : syn.lastOutcome,
      plasticity,
      updates: syn.updates + 1,
    });
  }

  const totalOutcomes = (prev?.totalOutcomes ?? 0) + 1;
  const snap: WetwareCalibrationSnapshot = {
    at: new Date().toISOString(),
    synapses: [...synapseMap.values()],
    learningRate: lr,
    calibrated: totalOutcomes >= wetwareMinOutcomesForCalibrated(),
    totalOutcomes,
  };

  return { json: mergeWetwareCalibration(previousRaw, snap), snap };
}

/** Apply calibrated weights to LinUCB snapshot arms for wetware path. */
export function applyWetwareCalibrationToSnapshot(
  snapshot: LinUcbSnapshot,
  raw: unknown,
): LinUcbSnapshot {
  const cal = readWetwareCalibration(raw);
  if (!cal?.calibrated) return snapshot;
  const weightByArm = new Map(cal.synapses.map((s) => [s.armId, s.weight]));
  return {
    ...snapshot,
    arms: snapshot.arms.map((a) => ({
      ...a,
      weight: weightByArm.get(a.armId) ?? a.weight,
    })),
  };
}

export function evaluateWetwareCalibrationGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isWetwareCalibrationEnabled()) {
    return { passed: true, headline: "Wetware calibration off", detail: "" };
  }
  if (!isBioNeuronAssignEnabled()) {
    return {
      passed: false,
      headline: "Bio-neuron assign required",
      detail: "Enable THEME_EXPERIMENT_BIO_NEURON_ASSIGN=1 (W2).",
    };
  }
  if (!isNeuromorphicAssignEnabled()) {
    return {
      passed: false,
      headline: "Neuromorphic assign required",
      detail: "Enable THEME_EXPERIMENT_NEUROMORPHIC_ASSIGN=1 (U2).",
    };
  }
  if (!shouldUseBioNeuronAssign(raw)) {
    return {
      passed: true,
      headline: "Wetware calibration standby",
      detail: "Activates with bio-neuron path (>64 factorial cells).",
    };
  }
  const cal = readWetwareCalibration(raw);
  if (!cal) {
    return {
      passed: true,
      headline: "Wetware accumulating outcomes",
      detail: "Plasticity updates on assignment conversion signals.",
    };
  }
  if (!cal.calibrated) {
    return {
      passed: false,
      headline: `Wetware calibrating (${cal.totalOutcomes}/${wetwareMinOutcomesForCalibrated()})`,
      detail: "Need more assignment outcomes for stable synaptic weights.",
    };
  }
  return {
    passed: true,
    headline: `Wetware calibrated (${cal.synapses.length} synapses)`,
    detail: `η=${cal.learningRate} · ${cal.totalOutcomes} outcomes`,
  };
}
