/**
 * AJ4 — Midbrain arousal publish pacing: dynamic pacing over AI4 pons + AG4 spinal throttle.
 */

import { toJsonValue } from "@/lib/prisma/json";
import {
  isPonsAutonomicBridgeFailoverEnabled,
  readPonsAutonomicBridgeFailover,
} from "@/lib/storefront/theme-experiment-pons-autonomic-bridge-failover";
import {
  evaluateSpinalCordPublishThrottleGate,
  isSpinalCordPublishThrottleEnabled,
  readSpinalCordPublishThrottle,
} from "@/lib/storefront/theme-experiment-spinal-cord-publish-throttle";
import {
  isPrefrontalEthicsBoardEnabled,
  readPrefrontalEthicsBoard,
} from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";

export type MidbrainArousalLevel = "resting" | "alert" | "high_arousal";

export type MidbrainArousalPublishPacingSnapshot = {
  at: string;
  arousalLevel: MidbrainArousalLevel;
  arousalScalar: number;
  dynamicPacingMs: number;
  spinalBaseThrottleMs: number;
  ponsDegradeActive: boolean;
  pacingNominal: boolean;
  publishBlockedByArousal: boolean;
};

export function isMidbrainArousalPublishPacingEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_MIDBRAIN_AROUSAL_PUBLISH_PACING === "1";
}

export function midbrainMaxDynamicPacingMs(): number {
  return Number(process.env.THEME_EXPERIMENT_MIDBRAIN_MAX_PACING_MS ?? "15000");
}

export function midbrainMinDynamicPacingMs(): number {
  return Number(process.env.THEME_EXPERIMENT_MIDBRAIN_MIN_PACING_MS ?? "500");
}

export function readMidbrainArousalPublishPacing(raw: unknown): MidbrainArousalPublishPacingSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).midbrainArousalPublishPacing;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    arousalLevel: (s.arousalLevel as MidbrainArousalLevel) ?? "resting",
    arousalScalar: typeof s.arousalScalar === "number" ? s.arousalScalar : 0,
    dynamicPacingMs: typeof s.dynamicPacingMs === "number" ? s.dynamicPacingMs : 0,
    spinalBaseThrottleMs: typeof s.spinalBaseThrottleMs === "number" ? s.spinalBaseThrottleMs : 0,
    ponsDegradeActive: s.ponsDegradeActive === true,
    pacingNominal: s.pacingNominal === true,
    publishBlockedByArousal: s.publishBlockedByArousal === true,
  };
}

export function mergeMidbrainArousalPublishPacing(
  previousRaw: unknown,
  snap: MidbrainArousalPublishPacingSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.midbrainArousalPublishPacing = snap;
  return base;
}

export function syncMidbrainFromPonsAndSpinal(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: MidbrainArousalPublishPacingSnapshot;
} {
  const spinal = readSpinalCordPublishThrottle(previousRaw);
  const pons = readPonsAutonomicBridgeFailover(previousRaw);
  const ethics = readPrefrontalEthicsBoard(previousRaw);
  const ethicsVeto = ethics?.publishVetoActive ?? false;

  const spinalBase = spinal?.throttleMs ?? midbrainMinDynamicPacingMs();
  const ponsDegrade = pons?.gracefulDegradeActive ?? false;

  let arousalScalar = 0.2;
  let arousalLevel: MidbrainArousalLevel = "resting";

  if (ethicsVeto) {
    arousalScalar = 1;
    arousalLevel = "high_arousal";
  } else if (spinal?.publishThrottled) {
    arousalScalar = ponsDegrade ? 0.55 : 0.85;
    arousalLevel = ponsDegrade ? "alert" : "high_arousal";
  } else if (ponsDegrade) {
    arousalScalar = 0.45;
    arousalLevel = "alert";
  }

  const dynamicPacingMs = ponsDegrade
    ? (pons?.spinalThrottleMs ?? Math.round(spinalBase * (1 + arousalScalar)))
    : Math.round(spinalBase * (1 + arousalScalar));

  const pacingNominal =
    !ethicsVeto &&
    dynamicPacingMs <= midbrainMaxDynamicPacingMs() &&
    dynamicPacingMs >= midbrainMinDynamicPacingMs();

  const publishBlockedByArousal =
    ethicsVeto ||
    (spinal?.publishThrottled === true &&
      !ponsDegrade &&
      dynamicPacingMs > midbrainMaxDynamicPacingMs());

  const snap: MidbrainArousalPublishPacingSnapshot = {
    at: new Date().toISOString(),
    arousalLevel,
    arousalScalar,
    dynamicPacingMs,
    spinalBaseThrottleMs: spinalBase,
    ponsDegradeActive: ponsDegrade,
    pacingNominal,
    publishBlockedByArousal,
  };

  return { json: mergeMidbrainArousalPublishPacing(previousRaw, snap), snap };
}

export function applyMidbrainArousalToWetwareJson(previousRaw: unknown): Record<string, unknown> {
  const mid = readMidbrainArousalPublishPacing(previousRaw);
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  if (mid && !mid.pacingNominal) {
    base.midbrainDynamicPacingMs = mid.dynamicPacingMs;
  }
  return base;
}

export function evaluateMidbrainArousalPublishPacingGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isMidbrainArousalPublishPacingEnabled()) {
    return { passed: true, headline: "Midbrain arousal publish pacing off", detail: "" };
  }
  if (!isPonsAutonomicBridgeFailoverEnabled()) {
    return {
      passed: false,
      headline: "Pons autonomic bridge failover required",
      detail: "Enable THEME_EXPERIMENT_PONS_AUTONOMIC_BRIDGE_FAILOVER=1 (AI4).",
    };
  }
  if (!isSpinalCordPublishThrottleEnabled()) {
    return {
      passed: false,
      headline: "Spinal cord publish throttle required",
      detail: "Enable THEME_EXPERIMENT_SPINAL_CORD_PUBLISH_THROTTLE=1 (AG4).",
    };
  }
  const mid = readMidbrainArousalPublishPacing(raw);
  if (mid?.publishBlockedByArousal) {
    return {
      passed: false,
      headline: "Midbrain arousal blocks publish",
      detail: `Arousal ${mid.arousalLevel} · pacing ${mid.dynamicPacingMs}ms exceeds safe window.`,
    };
  }
  if (!mid?.pacingNominal) {
    return {
      passed: false,
      headline: "Midbrain dynamic pacing not nominal",
      detail: "Run midbrain/pons/spinal sync before publish.",
    };
  }
  const degradeNote = mid.ponsDegradeActive ? " · pons degrade" : "";
  return {
    passed: true,
    headline: "Midbrain arousal publish pacing OK",
    detail: `${mid.arousalLevel} · dynamic ${mid.dynamicPacingMs}ms${degradeNote}`,
  };
}

/** When midbrain enabled, replaces fixed spinal throttle gate for publish path. */
export function evaluateMidbrainOrSpinalPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (isMidbrainArousalPublishPacingEnabled()) {
    return evaluateMidbrainArousalPublishPacingGate(raw);
  }
  return evaluateSpinalCordPublishThrottleGate(raw);
}
