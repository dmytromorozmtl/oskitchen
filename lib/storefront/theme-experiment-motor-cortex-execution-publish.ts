/**
 * AN4 — Motor cortex execution publish: execution layer after AM4 cerebellum motor refinement.
 */

import { toJsonValue } from "@/lib/prisma/json";
import {
  evaluateCerebellumMotorRefinementPublishGate,
  evaluateMidbrainWithCerebellumBasalGangliaAndThalamusPublishGate,
  isCerebellumMotorRefinementPublishEnabled,
  readCerebellumMotorRefinementPublish,
} from "@/lib/storefront/theme-experiment-cerebellum-motor-refinement-publish";
import {
  isMidbrainArousalPublishPacingEnabled,
  readMidbrainArousalPublishPacing,
} from "@/lib/storefront/theme-experiment-midbrain-arousal-publish-pacing";
import {
  isPrefrontalEthicsBoardEnabled,
  readPrefrontalEthicsBoard,
} from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";

export type MotorCortexExecutionMode = "plan" | "execute" | "commit_publish";

export type MotorCortexExecutionPublishSnapshot = {
  at: string;
  executionMode: MotorCortexExecutionMode;
  executionPrecision: number;
  cerebellumRefinementComplete: boolean;
  midbrainPacingNominal: boolean;
  motorExecutionLocked: boolean;
  publishBlockedByExecution: boolean;
};

export function isMotorCortexExecutionPublishEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_MOTOR_CORTEX_EXECUTION_PUBLISH === "1";
}

export function motorCortexMinExecutionPrecision(): number {
  return Number(process.env.THEME_EXPERIMENT_MOTOR_CORTEX_MIN_PRECISION ?? "0.75");
}

export function readMotorCortexExecutionPublish(raw: unknown): MotorCortexExecutionPublishSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).motorCortexExecutionPublish;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    executionMode: (s.executionMode as MotorCortexExecutionMode) ?? "plan",
    executionPrecision: typeof s.executionPrecision === "number" ? s.executionPrecision : 0,
    cerebellumRefinementComplete: s.cerebellumRefinementComplete === true,
    midbrainPacingNominal: s.midbrainPacingNominal === true,
    motorExecutionLocked: s.motorExecutionLocked === true,
    publishBlockedByExecution: s.publishBlockedByExecution === true,
  };
}

export function mergeMotorCortexExecutionPublish(
  previousRaw: unknown,
  snap: MotorCortexExecutionPublishSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.motorCortexExecutionPublish = snap;
  return base;
}

export function syncMotorCortexFromCerebellumAndMidbrain(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: MotorCortexExecutionPublishSnapshot;
} {
  const cb = readCerebellumMotorRefinementPublish(previousRaw);
  const mid = readMidbrainArousalPublishPacing(previousRaw);
  const ethics = readPrefrontalEthicsBoard(previousRaw);
  const ethicsVeto = ethics?.publishVetoActive ?? false;

  const cerebellumRefinementComplete =
    cb?.motorRefinementComplete ?? !isCerebellumMotorRefinementPublishEnabled();
  const midbrainPacingNominal = mid?.pacingNominal ?? !isMidbrainArousalPublishPacingEnabled();

  let executionMode: MotorCortexExecutionMode = "commit_publish";
  let executionPrecision = 0.8;

  if (ethicsVeto || !cerebellumRefinementComplete) {
    executionMode = "plan";
    executionPrecision = 0.25;
  } else if (!midbrainPacingNominal) {
    executionMode = "execute";
    executionPrecision = 0.55;
  } else if ((cb?.refinementScalar ?? 1) < motorCortexMinExecutionPrecision()) {
    executionMode = "execute";
    executionPrecision = cb?.refinementScalar ?? 0.5;
  }

  const motorExecutionLocked = executionMode !== "commit_publish";
  const publishBlockedByExecution = motorExecutionLocked;

  const snap: MotorCortexExecutionPublishSnapshot = {
    at: new Date().toISOString(),
    executionMode,
    executionPrecision,
    cerebellumRefinementComplete,
    midbrainPacingNominal,
    motorExecutionLocked,
    publishBlockedByExecution,
  };

  return { json: mergeMotorCortexExecutionPublish(previousRaw, snap), snap };
}

export function applyMotorCortexExecutionToWetwareJson(previousRaw: unknown): Record<string, unknown> {
  const mc = readMotorCortexExecutionPublish(previousRaw);
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  if (mc?.motorExecutionLocked) {
    base.motorCortexExecutionLocked = true;
  }
  return base;
}

export function evaluateMotorCortexExecutionPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isMotorCortexExecutionPublishEnabled()) {
    return { passed: true, headline: "Motor cortex execution publish off", detail: "" };
  }
  if (!isCerebellumMotorRefinementPublishEnabled()) {
    return {
      passed: false,
      headline: "Cerebellum motor refinement required",
      detail: "Enable THEME_EXPERIMENT_CEREBELLUM_MOTOR_REFINEMENT_PUBLISH=1 (AM4).",
    };
  }
  if (!isMidbrainArousalPublishPacingEnabled()) {
    return {
      passed: false,
      headline: "Midbrain arousal pacing required",
      detail: "Enable THEME_EXPERIMENT_MIDBRAIN_AROUSAL_PUBLISH_PACING=1 (AJ4).",
    };
  }
  const cbGate = evaluateCerebellumMotorRefinementPublishGate(raw);
  if (!cbGate.passed) {
    return cbGate;
  }
  const mc = readMotorCortexExecutionPublish(raw);
  if (mc?.publishBlockedByExecution) {
    return {
      passed: false,
      headline: `Motor cortex mode: ${mc.executionMode}`,
      detail: `Precision ${mc.executionPrecision.toFixed(2)} — execution after cerebellum refinement.`,
    };
  }
  if (!mc || mc.executionMode !== "commit_publish") {
    return {
      passed: false,
      headline: "Motor execution not committed",
      detail: "Run motor cortex/cerebellum/midbrain sync before publish.",
    };
  }
  return {
    passed: true,
    headline: "Motor cortex execution committed",
    detail: `Mode ${mc.executionMode} · precision ${mc.executionPrecision.toFixed(2)}`,
  };
}

/** Gate midbrain path after motor cortex execution and full motor chain. */
export function evaluateMidbrainWithMotorCortexCerebellumBasalGangliaAndThalamusPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (isMotorCortexExecutionPublishEnabled()) {
    const mc = evaluateMotorCortexExecutionPublishGate(raw);
    if (!mc.passed) {
      return mc;
    }
  }
  return evaluateMidbrainWithCerebellumBasalGangliaAndThalamusPublishGate(raw);
}
