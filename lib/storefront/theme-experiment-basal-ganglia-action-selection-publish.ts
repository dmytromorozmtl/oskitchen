/**
 * AL4 — Basal ganglia action selection publish: motor selection after AK4 thalamus sensory gate.
 */

import { toJsonValue } from "@/lib/prisma/json";
import {
  evaluateMidbrainOrSpinalPublishGate,
  isMidbrainArousalPublishPacingEnabled,
  readMidbrainArousalPublishPacing,
} from "@/lib/storefront/theme-experiment-midbrain-arousal-publish-pacing";
import {
  evaluateThalamusSensoryGatingPublishGate,
  isThalamusSensoryGatingPublishEnabled,
  readThalamusSensoryGatingPublish,
} from "@/lib/storefront/theme-experiment-thalamus-sensory-gating-publish";
import {
  isPrefrontalEthicsBoardEnabled,
  readPrefrontalEthicsBoard,
} from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";

export type BasalGangliaActionMode = "withhold" | "publish_draft" | "escalate_review";

export type BasalGangliaActionSelectionSnapshot = {
  at: string;
  selectedAction: BasalGangliaActionMode;
  actionConfidence: number;
  thalamusGateOpen: boolean;
  midbrainPacingNominal: boolean;
  motorSelectionLocked: boolean;
  publishBlockedByMotorSelection: boolean;
};

export function isBasalGangliaActionSelectionPublishEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_BASAL_GANGLIA_ACTION_SELECTION_PUBLISH === "1";
}

export function basalGangliaMinActionConfidence(): number {
  return Number(process.env.THEME_EXPERIMENT_BASAL_GANGLIA_MIN_CONFIDENCE ?? "0.55");
}

export function readBasalGangliaActionSelectionPublish(raw: unknown): BasalGangliaActionSelectionSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).basalGangliaActionSelectionPublish;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    selectedAction: (s.selectedAction as BasalGangliaActionMode) ?? "withhold",
    actionConfidence: typeof s.actionConfidence === "number" ? s.actionConfidence : 0,
    thalamusGateOpen: s.thalamusGateOpen === true,
    midbrainPacingNominal: s.midbrainPacingNominal === true,
    motorSelectionLocked: s.motorSelectionLocked === true,
    publishBlockedByMotorSelection: s.publishBlockedByMotorSelection === true,
  };
}

export function mergeBasalGangliaActionSelectionPublish(
  previousRaw: unknown,
  snap: BasalGangliaActionSelectionSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.basalGangliaActionSelectionPublish = snap;
  return base;
}

export function syncBasalGangliaFromThalamusAndMidbrain(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: BasalGangliaActionSelectionSnapshot;
} {
  const thal = readThalamusSensoryGatingPublish(previousRaw);
  const mid = readMidbrainArousalPublishPacing(previousRaw);
  const ethics = readPrefrontalEthicsBoard(previousRaw);
  const ethicsVeto = ethics?.publishVetoActive ?? false;

  const thalamusGateOpen = thal?.sensoryGateOpen ?? !isThalamusSensoryGatingPublishEnabled();
  const midbrainPacingNominal = mid?.pacingNominal ?? !isMidbrainArousalPublishPacingEnabled();

  let selectedAction: BasalGangliaActionMode = "publish_draft";
  let actionConfidence = 0.75;

  if (ethicsVeto || !thalamusGateOpen) {
    selectedAction = "escalate_review";
    actionConfidence = 0.2;
  } else if (!midbrainPacingNominal) {
    selectedAction = "withhold";
    actionConfidence = 0.45;
  } else if ((thal?.signalClarity ?? 1) < basalGangliaMinActionConfidence()) {
    selectedAction = "withhold";
    actionConfidence = thal?.signalClarity ?? 0.4;
  }

  const motorSelectionLocked = selectedAction !== "publish_draft";
  const publishBlockedByMotorSelection = motorSelectionLocked;

  const snap: BasalGangliaActionSelectionSnapshot = {
    at: new Date().toISOString(),
    selectedAction,
    actionConfidence,
    thalamusGateOpen,
    midbrainPacingNominal,
    motorSelectionLocked,
    publishBlockedByMotorSelection,
  };

  return { json: mergeBasalGangliaActionSelectionPublish(previousRaw, snap), snap };
}

export function applyBasalGangliaActionToWetwareJson(previousRaw: unknown): Record<string, unknown> {
  const bg = readBasalGangliaActionSelectionPublish(previousRaw);
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  if (bg?.motorSelectionLocked) {
    base.basalGangliaMotorLocked = true;
  }
  return base;
}

export function evaluateBasalGangliaActionSelectionPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isBasalGangliaActionSelectionPublishEnabled()) {
    return { passed: true, headline: "Basal ganglia action selection off", detail: "" };
  }
  if (!isThalamusSensoryGatingPublishEnabled()) {
    return {
      passed: false,
      headline: "Thalamus sensory gating required",
      detail: "Enable THEME_EXPERIMENT_THALAMUS_SENSORY_GATING_PUBLISH=1 (AK4).",
    };
  }
  if (!isMidbrainArousalPublishPacingEnabled()) {
    return {
      passed: false,
      headline: "Midbrain arousal pacing required",
      detail: "Enable THEME_EXPERIMENT_MIDBRAIN_AROUSAL_PUBLISH_PACING=1 (AJ4).",
    };
  }
  const thalGate = evaluateThalamusSensoryGatingPublishGate(raw);
  if (!thalGate.passed) {
    return thalGate;
  }
  const bg = readBasalGangliaActionSelectionPublish(raw);
  if (bg?.publishBlockedByMotorSelection) {
    return {
      passed: false,
      headline: `Basal ganglia selected: ${bg.selectedAction}`,
      detail: `Motor selection locked (confidence ${bg.actionConfidence.toFixed(2)}) — after sensory gate.`,
    };
  }
  if (!bg || bg.selectedAction !== "publish_draft") {
    return {
      passed: false,
      headline: "Motor action not selected for publish",
      detail: "Run basal ganglia/thalamus/midbrain sync before publish.",
    };
  }
  return {
    passed: true,
    headline: "Basal ganglia publish_draft selected",
    detail: `Confidence ${bg.actionConfidence.toFixed(2)} · thalamus open · midbrain nominal`,
  };
}

/** Gate midbrain path after basal ganglia motor selection and thalamus sensory gate. */
export function evaluateMidbrainWithBasalGangliaAndThalamusPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (isBasalGangliaActionSelectionPublishEnabled()) {
    const bg = evaluateBasalGangliaActionSelectionPublishGate(raw);
    if (!bg.passed) {
      return bg;
    }
  } else if (isThalamusSensoryGatingPublishEnabled()) {
    const thal = evaluateThalamusSensoryGatingPublishGate(raw);
    if (!thal.passed) {
      return thal;
    }
  }
  return evaluateMidbrainOrSpinalPublishGate(raw);
}
