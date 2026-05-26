/**
 * AK4 — Thalamus sensory gating publish: sensory filter before AJ4 midbrain arousal pacing.
 */

import { toJsonValue } from "@/lib/prisma/json";
import {
  evaluateMidbrainOrSpinalPublishGate,
  isMidbrainArousalPublishPacingEnabled,
  readMidbrainArousalPublishPacing,
} from "@/lib/storefront/theme-experiment-midbrain-arousal-publish-pacing";
import {
  isSpinalCordPublishThrottleEnabled,
  readSpinalCordPublishThrottle,
} from "@/lib/storefront/theme-experiment-spinal-cord-publish-throttle";
import {
  isPrefrontalEthicsBoardEnabled,
  readPrefrontalEthicsBoard,
} from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";

export type ThalamusSensoryChannel = "visual" | "auditory" | "proprioceptive";

export type ThalamusSensoryGatingSnapshot = {
  at: string;
  activeChannels: ThalamusSensoryChannel[];
  noiseFloor: number;
  signalClarity: number;
  sensoryGateOpen: boolean;
  midbrainReady: boolean;
  spinalSignalClear: boolean;
  publishBlockedBySensoryGate: boolean;
};

export function isThalamusSensoryGatingPublishEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_THALAMUS_SENSORY_GATING_PUBLISH === "1";
}

export function thalamusNoiseFloorMax(): number {
  return Number(process.env.THEME_EXPERIMENT_THALAMUS_NOISE_FLOOR_MAX ?? "0.35");
}

export function thalamusSignalClarityMin(): number {
  return Number(process.env.THEME_EXPERIMENT_THALAMUS_SIGNAL_CLARITY_MIN ?? "0.65");
}

export function readThalamusSensoryGatingPublish(raw: unknown): ThalamusSensoryGatingSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).thalamusSensoryGatingPublish;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    activeChannels: Array.isArray(s.activeChannels) ? (s.activeChannels as ThalamusSensoryChannel[]) : [],
    noiseFloor: typeof s.noiseFloor === "number" ? s.noiseFloor : 0,
    signalClarity: typeof s.signalClarity === "number" ? s.signalClarity : 0,
    sensoryGateOpen: s.sensoryGateOpen === true,
    midbrainReady: s.midbrainReady === true,
    spinalSignalClear: s.spinalSignalClear === true,
    publishBlockedBySensoryGate: s.publishBlockedBySensoryGate === true,
  };
}

export function mergeThalamusSensoryGatingPublish(
  previousRaw: unknown,
  snap: ThalamusSensoryGatingSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.thalamusSensoryGatingPublish = snap;
  return base;
}

export function syncThalamusFromMidbrainAndSpinal(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: ThalamusSensoryGatingSnapshot;
} {
  const spinal = readSpinalCordPublishThrottle(previousRaw);
  const midbrain = readMidbrainArousalPublishPacing(previousRaw);
  const ethics = readPrefrontalEthicsBoard(previousRaw);
  const ethicsVeto = ethics?.publishVetoActive ?? false;

  const noiseFloor = spinal?.publishThrottled ? 0.4 : midbrain?.ponsDegradeActive ? 0.28 : 0.12;
  const signalClarity = Math.max(0, 1 - noiseFloor - (ethicsVeto ? 0.5 : 0));
  const spinalSignalClear = !spinal?.publishThrottled || (midbrain?.ponsDegradeActive ?? false);
  const midbrainReady = midbrain?.pacingNominal ?? !isMidbrainArousalPublishPacingEnabled();

  const sensoryGateOpen =
    !ethicsVeto &&
    noiseFloor <= thalamusNoiseFloorMax() &&
    signalClarity >= thalamusSignalClarityMin() &&
    spinalSignalClear;

  const activeChannels: ThalamusSensoryChannel[] = ["visual", "auditory"];
  if (spinalSignalClear) {
    activeChannels.push("proprioceptive");
  }

  const snap: ThalamusSensoryGatingSnapshot = {
    at: new Date().toISOString(),
    activeChannels,
    noiseFloor,
    signalClarity,
    sensoryGateOpen,
    midbrainReady,
    spinalSignalClear,
    publishBlockedBySensoryGate: !sensoryGateOpen,
  };

  return { json: mergeThalamusSensoryGatingPublish(previousRaw, snap), snap };
}

export function applyThalamusSensoryToWetwareJson(previousRaw: unknown): Record<string, unknown> {
  const thal = readThalamusSensoryGatingPublish(previousRaw);
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  if (thal && !thal.sensoryGateOpen) {
    base.thalamusSensoryGated = true;
  }
  return base;
}

export function evaluateThalamusSensoryGatingPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isThalamusSensoryGatingPublishEnabled()) {
    return { passed: true, headline: "Thalamus sensory gating off", detail: "" };
  }
  if (!isMidbrainArousalPublishPacingEnabled()) {
    return {
      passed: false,
      headline: "Midbrain arousal publish pacing required",
      detail: "Enable THEME_EXPERIMENT_MIDBRAIN_AROUSAL_PUBLISH_PACING=1 (AJ4).",
    };
  }
  if (!isSpinalCordPublishThrottleEnabled()) {
    return {
      passed: false,
      headline: "Spinal cord publish throttle required",
      detail: "Enable THEME_EXPERIMENT_SPINAL_CORD_PUBLISH_THROTTLE=1 (AG4).",
    };
  }
  const thal = readThalamusSensoryGatingPublish(raw);
  if (thal?.publishBlockedBySensoryGate) {
    return {
      passed: false,
      headline: "Thalamus sensory gate closed",
      detail: `Noise ${thal.noiseFloor.toFixed(2)} · clarity ${thal.signalClarity.toFixed(2)} — filter before midbrain.`,
    };
  }
  if (!thal?.sensoryGateOpen || !thal.midbrainReady) {
    return {
      passed: false,
      headline: "Sensory gate not ready for midbrain",
      detail: "Run thalamus/midbrain/spinal sync before publish.",
    };
  }
  return {
    passed: true,
    headline: "Thalamus sensory gating open",
    detail: `${thal.activeChannels.length} channels · clarity ${thal.signalClarity.toFixed(2)}`,
  };
}

/** Gate midbrain path only when thalamus sensory gate is open. */
export function evaluateMidbrainWithThalamusPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (isThalamusSensoryGatingPublishEnabled()) {
    const thal = evaluateThalamusSensoryGatingPublishGate(raw);
    if (!thal.passed) {
      return thal;
    }
  }
  return evaluateMidbrainOrSpinalPublishGate(raw);
}
