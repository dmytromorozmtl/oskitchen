/**
 * AO4 — Premotor / SMA planning publish: planning layer after AN4 motor cortex execution.
 */

import { toJsonValue } from "@/lib/prisma/json";
import {
  evaluateMotorCortexExecutionPublishGate,
  evaluateMidbrainWithMotorCortexCerebellumBasalGangliaAndThalamusPublishGate,
  isMotorCortexExecutionPublishEnabled,
  readMotorCortexExecutionPublish,
} from "@/lib/storefront/theme-experiment-motor-cortex-execution-publish";
import {
  isPrefrontalEthicsBoardEnabled,
  readPrefrontalEthicsBoard,
} from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";

export type PremotorSmaPlanningMode = "idle" | "sequence_plan" | "commit_plan_publish";

export type PremotorSmaPlanningPublishSnapshot = {
  at: string;
  planningMode: PremotorSmaPlanningMode;
  sequenceCoherence: number;
  motorExecutionCommitted: boolean;
  ethicsCleared: boolean;
  planningLocked: boolean;
  publishBlockedByPlanning: boolean;
};

export function isPremotorSmaPlanningPublishEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_PREMOTOR_SMA_PLANNING_PUBLISH === "1";
}

export function premotorMinSequenceCoherence(): number {
  return Number(process.env.THEME_EXPERIMENT_PREMOTOR_MIN_COHERENCE ?? "0.78");
}

export function readPremotorSmaPlanningPublish(raw: unknown): PremotorSmaPlanningPublishSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).premotorSmaPlanningPublish;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    planningMode: (s.planningMode as PremotorSmaPlanningMode) ?? "idle",
    sequenceCoherence: typeof s.sequenceCoherence === "number" ? s.sequenceCoherence : 0,
    motorExecutionCommitted: s.motorExecutionCommitted === true,
    ethicsCleared: s.ethicsCleared === true,
    planningLocked: s.planningLocked === true,
    publishBlockedByPlanning: s.publishBlockedByPlanning === true,
  };
}

export function mergePremotorSmaPlanningPublish(
  previousRaw: unknown,
  snap: PremotorSmaPlanningPublishSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.premotorSmaPlanningPublish = snap;
  return base;
}

export function syncPremotorSmaFromMotorCortexAndEthics(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: PremotorSmaPlanningPublishSnapshot;
} {
  const mc = readMotorCortexExecutionPublish(previousRaw);
  const ethics = readPrefrontalEthicsBoard(previousRaw);
  const ethicsVeto = ethics?.publishVetoActive ?? false;
  const ethicsCleared = !ethicsVeto && (ethics?.ethicsBoardReady ?? !isPrefrontalEthicsBoardEnabled());

  const motorExecutionCommitted =
    mc?.executionMode === "commit_publish" && !mc.publishBlockedByExecution;

  let planningMode: PremotorSmaPlanningMode = "commit_plan_publish";
  let sequenceCoherence = 0.82;

  if (ethicsVeto || !motorExecutionCommitted) {
    planningMode = "idle";
    sequenceCoherence = 0.2;
  } else if (!ethicsCleared) {
    planningMode = "sequence_plan";
    sequenceCoherence = 0.45;
  } else if ((mc?.executionPrecision ?? 1) < premotorMinSequenceCoherence()) {
    planningMode = "sequence_plan";
    sequenceCoherence = mc?.executionPrecision ?? 0.5;
  }

  const planningLocked = planningMode !== "commit_plan_publish";
  const publishBlockedByPlanning = planningLocked;

  const snap: PremotorSmaPlanningPublishSnapshot = {
    at: new Date().toISOString(),
    planningMode,
    sequenceCoherence,
    motorExecutionCommitted,
    ethicsCleared,
    planningLocked,
    publishBlockedByPlanning,
  };

  return { json: mergePremotorSmaPlanningPublish(previousRaw, snap), snap };
}

export function applyPremotorSmaPlanningToWetwareJson(previousRaw: unknown): Record<string, unknown> {
  const pm = readPremotorSmaPlanningPublish(previousRaw);
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  if (pm?.planningLocked) {
    base.premotorSmaPlanningLocked = true;
  }
  return base;
}

export function evaluatePremotorSmaPlanningPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isPremotorSmaPlanningPublishEnabled()) {
    return { passed: true, headline: "Premotor SMA planning publish off", detail: "" };
  }
  if (!isMotorCortexExecutionPublishEnabled()) {
    return {
      passed: false,
      headline: "Motor cortex execution required",
      detail: "Enable THEME_EXPERIMENT_MOTOR_CORTEX_EXECUTION_PUBLISH=1 (AN4).",
    };
  }
  if (isPrefrontalEthicsBoardEnabled() && readPrefrontalEthicsBoard(raw)?.publishVetoActive) {
    return {
      passed: false,
      headline: "Ethics board veto active",
      detail: "Clear ethics veto before premotor/SMA planning publish.",
    };
  }
  const mcGate = evaluateMotorCortexExecutionPublishGate(raw);
  if (!mcGate.passed) {
    return mcGate;
  }
  const pm = readPremotorSmaPlanningPublish(raw);
  if (pm?.publishBlockedByPlanning) {
    return {
      passed: false,
      headline: `Premotor SMA mode: ${pm.planningMode}`,
      detail: `Coherence ${pm.sequenceCoherence.toFixed(2)} — planning after motor cortex execution.`,
    };
  }
  if (!pm || pm.planningMode !== "commit_plan_publish") {
    return {
      passed: false,
      headline: "Premotor plan not committed",
      detail: "Run premotor/motor cortex/ethics sync before publish.",
    };
  }
  return {
    passed: true,
    headline: "Premotor SMA plan committed",
    detail: `Mode ${pm.planningMode} · coherence ${pm.sequenceCoherence.toFixed(2)}`,
  };
}

/** Gate midbrain path after premotor SMA planning and full motor chain. */
export function evaluateMidbrainWithPremotorSmaMotorCortexCerebellumBasalGangliaAndThalamusPublishGate(
  raw: unknown,
): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (isPremotorSmaPlanningPublishEnabled()) {
    const pm = evaluatePremotorSmaPlanningPublishGate(raw);
    if (!pm.passed) {
      return pm;
    }
  }
  return evaluateMidbrainWithMotorCortexCerebellumBasalGangliaAndThalamusPublishGate(raw);
}
