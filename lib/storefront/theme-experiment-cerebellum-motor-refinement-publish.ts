/**
 * AM4 — Cerebellum motor refinement publish: fine motor tuning after AL4 basal ganglia action selection.
 */

import { toJsonValue } from "@/lib/prisma/json";
import {
  evaluateBasalGangliaActionSelectionPublishGate,
  isBasalGangliaActionSelectionPublishEnabled,
  readBasalGangliaActionSelectionPublish,
  evaluateMidbrainWithBasalGangliaAndThalamusPublishGate,
} from "@/lib/storefront/theme-experiment-basal-ganglia-action-selection-publish";
import {
  isMidbrainArousalPublishPacingEnabled,
  readMidbrainArousalPublishPacing,
} from "@/lib/storefront/theme-experiment-midbrain-arousal-publish-pacing";
import {
  isPrefrontalEthicsBoardEnabled,
  readPrefrontalEthicsBoard,
} from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";

export type CerebellumRefinementPhase = "coarse" | "fine" | "publish_ready";

export type CerebellumMotorRefinementSnapshot = {
  at: string;
  refinementPhase: CerebellumRefinementPhase;
  refinementScalar: number;
  basalActionConfirmed: boolean;
  midbrainPacingNominal: boolean;
  motorRefinementComplete: boolean;
  publishBlockedByRefinement: boolean;
};

export function isCerebellumMotorRefinementPublishEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_CEREBELLUM_MOTOR_REFINEMENT_PUBLISH === "1";
}

export function cerebellumMinRefinementScalar(): number {
  return Number(process.env.THEME_EXPERIMENT_CEREBELLUM_MIN_REFINEMENT_SCALAR ?? "0.7");
}

export function readCerebellumMotorRefinementPublish(raw: unknown): CerebellumMotorRefinementSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).cerebellumMotorRefinementPublish;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    refinementPhase: (s.refinementPhase as CerebellumRefinementPhase) ?? "coarse",
    refinementScalar: typeof s.refinementScalar === "number" ? s.refinementScalar : 0,
    basalActionConfirmed: s.basalActionConfirmed === true,
    midbrainPacingNominal: s.midbrainPacingNominal === true,
    motorRefinementComplete: s.motorRefinementComplete === true,
    publishBlockedByRefinement: s.publishBlockedByRefinement === true,
  };
}

export function mergeCerebellumMotorRefinementPublish(
  previousRaw: unknown,
  snap: CerebellumMotorRefinementSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.cerebellumMotorRefinementPublish = snap;
  return base;
}

export function syncCerebellumFromBasalGangliaAndMidbrain(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: CerebellumMotorRefinementSnapshot;
} {
  const bg = readBasalGangliaActionSelectionPublish(previousRaw);
  const mid = readMidbrainArousalPublishPacing(previousRaw);
  const ethics = readPrefrontalEthicsBoard(previousRaw);
  const ethicsVeto = ethics?.publishVetoActive ?? false;

  const basalActionConfirmed =
    bg?.selectedAction === "publish_draft" || !isBasalGangliaActionSelectionPublishEnabled();
  const midbrainPacingNominal = mid?.pacingNominal ?? !isMidbrainArousalPublishPacingEnabled();

  let refinementScalar = 0.5;
  let refinementPhase: CerebellumRefinementPhase = "coarse";

  if (ethicsVeto || !basalActionConfirmed) {
    refinementScalar = 0.15;
    refinementPhase = "coarse";
  } else if (!midbrainPacingNominal) {
    refinementScalar = 0.45;
    refinementPhase = "fine";
  } else {
    refinementScalar = Math.min(1, (bg?.actionConfidence ?? 0.75) + 0.15);
    refinementPhase = refinementScalar >= cerebellumMinRefinementScalar() ? "publish_ready" : "fine";
  }

  const motorRefinementComplete =
    basalActionConfirmed &&
    midbrainPacingNominal &&
    refinementScalar >= cerebellumMinRefinementScalar() &&
    refinementPhase === "publish_ready";

  const publishBlockedByRefinement = !motorRefinementComplete;

  const snap: CerebellumMotorRefinementSnapshot = {
    at: new Date().toISOString(),
    refinementPhase,
    refinementScalar,
    basalActionConfirmed,
    midbrainPacingNominal,
    motorRefinementComplete,
    publishBlockedByRefinement,
  };

  return { json: mergeCerebellumMotorRefinementPublish(previousRaw, snap), snap };
}

export function applyCerebellumRefinementToWetwareJson(previousRaw: unknown): Record<string, unknown> {
  const cb = readCerebellumMotorRefinementPublish(previousRaw);
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  if (cb && !cb.motorRefinementComplete) {
    base.cerebellumRefinementPending = true;
  }
  return base;
}

export function evaluateCerebellumMotorRefinementPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isCerebellumMotorRefinementPublishEnabled()) {
    return { passed: true, headline: "Cerebellum motor refinement off", detail: "" };
  }
  if (!isBasalGangliaActionSelectionPublishEnabled()) {
    return {
      passed: false,
      headline: "Basal ganglia action selection required",
      detail: "Enable THEME_EXPERIMENT_BASAL_GANGLIA_ACTION_SELECTION_PUBLISH=1 (AL4).",
    };
  }
  if (!isMidbrainArousalPublishPacingEnabled()) {
    return {
      passed: false,
      headline: "Midbrain arousal pacing required",
      detail: "Enable THEME_EXPERIMENT_MIDBRAIN_AROUSAL_PUBLISH_PACING=1 (AJ4).",
    };
  }
  const bgGate = evaluateBasalGangliaActionSelectionPublishGate(raw);
  if (!bgGate.passed) {
    return bgGate;
  }
  const cb = readCerebellumMotorRefinementPublish(raw);
  if (cb?.publishBlockedByRefinement) {
    return {
      passed: false,
      headline: `Cerebellum refinement incomplete (${cb.refinementPhase})`,
      detail: `Scalar ${cb.refinementScalar.toFixed(2)} — fine motor tuning after basal ganglia.`,
    };
  }
  if (!cb?.motorRefinementComplete) {
    return {
      passed: false,
      headline: "Motor refinement not publish-ready",
      detail: "Run cerebellum/basal ganglia/midbrain sync before publish.",
    };
  }
  return {
    passed: true,
    headline: "Cerebellum motor refinement complete",
    detail: `Phase ${cb.refinementPhase} · scalar ${cb.refinementScalar.toFixed(2)}`,
  };
}

/** Gate midbrain path after cerebellum refinement and basal ganglia motor chain. */
export function evaluateMidbrainWithCerebellumBasalGangliaAndThalamusPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (isCerebellumMotorRefinementPublishEnabled()) {
    const cb = evaluateCerebellumMotorRefinementPublishGate(raw);
    if (!cb.passed) {
      return cb;
    }
  }
  return evaluateMidbrainWithBasalGangliaAndThalamusPublishGate(raw);
}
