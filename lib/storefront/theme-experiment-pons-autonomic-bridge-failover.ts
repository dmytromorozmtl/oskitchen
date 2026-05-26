/**
 * AI4 — Pons autonomic bridge failover: graceful publish degrade over AH4 medulla + AG4 spinal.
 */

import { toJsonValue } from "@/lib/prisma/json";
import {
  isMedullaOblongataEmergencyHaltEnabled,
  readMedullaOblongataEmergencyHalt,
} from "@/lib/storefront/theme-experiment-medulla-oblongata-emergency-halt";
import {
  isSpinalCordPublishThrottleEnabled,
  readSpinalCordPublishThrottle,
} from "@/lib/storefront/theme-experiment-spinal-cord-publish-throttle";
import {
  isPrefrontalEthicsBoardEnabled,
  readPrefrontalEthicsBoard,
} from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";

export type PonsBridgeMode = "nominal" | "graceful_degrade" | "bridge_open";

export type PonsAutonomicBridgeFailoverSnapshot = {
  at: string;
  bridgeMode: PonsBridgeMode;
  bridgeActive: boolean;
  gracefulDegradeActive: boolean;
  medullaBridged: boolean;
  spinalThrottleMs: number;
  publishDegradedAllowed: boolean;
  ethicsVetoBlocksBridge: boolean;
};

export function isPonsAutonomicBridgeFailoverEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_PONS_AUTONOMIC_BRIDGE_FAILOVER === "1";
}

export function ponsGracefulDegradeThrottleMs(): number {
  return Number(process.env.THEME_EXPERIMENT_PONS_GRACEFUL_DEGRADE_MS ?? "5000");
}

export function readPonsAutonomicBridgeFailover(raw: unknown): PonsAutonomicBridgeFailoverSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).ponsAutonomicBridgeFailover;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    bridgeMode: (s.bridgeMode as PonsBridgeMode) ?? "nominal",
    bridgeActive: s.bridgeActive === true,
    gracefulDegradeActive: s.gracefulDegradeActive === true,
    medullaBridged: s.medullaBridged === true,
    spinalThrottleMs: typeof s.spinalThrottleMs === "number" ? s.spinalThrottleMs : 0,
    publishDegradedAllowed: s.publishDegradedAllowed === true,
    ethicsVetoBlocksBridge: s.ethicsVetoBlocksBridge === true,
  };
}

export function mergePonsAutonomicBridgeFailover(
  previousRaw: unknown,
  snap: PonsAutonomicBridgeFailoverSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.ponsAutonomicBridgeFailover = snap;
  return base;
}

export function syncPonsFromMedullaAndSpinal(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: PonsAutonomicBridgeFailoverSnapshot;
} {
  const medulla = readMedullaOblongataEmergencyHalt(previousRaw);
  const spinal = readSpinalCordPublishThrottle(previousRaw);
  const ethics = readPrefrontalEthicsBoard(previousRaw);
  const ethicsVeto = ethics?.publishVetoActive ?? false;

  let bridgeMode: PonsBridgeMode = "nominal";
  let gracefulDegradeActive = false;
  let medullaBridged = false;
  let publishDegradedAllowed = false;

  if (ethicsVeto) {
    bridgeMode = "bridge_open";
  } else if (medulla?.publishEmergencyBlocked || spinal?.publishThrottled) {
    bridgeMode = "graceful_degrade";
    gracefulDegradeActive = true;
    medullaBridged = Boolean(medulla?.publishEmergencyBlocked);
    publishDegradedAllowed = true;
  }

  const snap: PonsAutonomicBridgeFailoverSnapshot = {
    at: new Date().toISOString(),
    bridgeMode,
    bridgeActive: bridgeMode !== "nominal",
    gracefulDegradeActive,
    medullaBridged,
    spinalThrottleMs: gracefulDegradeActive
      ? ponsGracefulDegradeThrottleMs()
      : (spinal?.throttleMs ?? 0),
    publishDegradedAllowed,
    ethicsVetoBlocksBridge: ethicsVeto,
  };

  return { json: mergePonsAutonomicBridgeFailover(previousRaw, snap), snap };
}

export function applyPonsFailoverToWetwareJson(previousRaw: unknown): Record<string, unknown> {
  const pons = readPonsAutonomicBridgeFailover(previousRaw);
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  if (pons?.gracefulDegradeActive) {
    base.ponsGracefulDegrade = true;
    base.ponsThrottleMs = pons.spinalThrottleMs;
  }
  return base;
}

export function evaluatePonsAutonomicBridgeFailoverGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isPonsAutonomicBridgeFailoverEnabled()) {
    return { passed: true, headline: "Pons autonomic bridge failover off", detail: "" };
  }
  if (!isMedullaOblongataEmergencyHaltEnabled()) {
    return {
      passed: false,
      headline: "Medulla emergency halt required",
      detail: "Enable THEME_EXPERIMENT_MEDULLA_OBLONGATA_EMERGENCY_HALT=1 (AH4).",
    };
  }
  if (!isSpinalCordPublishThrottleEnabled()) {
    return {
      passed: false,
      headline: "Spinal cord publish throttle required",
      detail: "Enable THEME_EXPERIMENT_SPINAL_CORD_PUBLISH_THROTTLE=1 (AG4).",
    };
  }
  const pons = readPonsAutonomicBridgeFailover(raw);
  if (pons?.ethicsVetoBlocksBridge) {
    return {
      passed: false,
      headline: "Pons bridge blocked — ethics veto",
      detail: "Ethics veto cannot be bridged; clear veto before publish.",
    };
  }
  const medulla = readMedullaOblongataEmergencyHalt(raw);
  if (medulla?.publishEmergencyBlocked && !pons?.publishDegradedAllowed) {
    return {
      passed: false,
      headline: "Medulla halt — pons bridge not engaged",
      detail: "Run medulla/pons sync or wait for graceful degrade path.",
    };
  }
  if (pons?.gracefulDegradeActive) {
    return {
      passed: true,
      headline: "Pons bridge — graceful degrade active",
      detail: `Degraded publish allowed · throttle ${pons.spinalThrottleMs}ms`,
    };
  }
  return {
    passed: true,
    headline: "Pons autonomic bridge nominal",
    detail: "No failover bridge required on publish path",
  };
}

/** Publish gate: medulla hard halt unless pons graceful degrade allows degraded path. */
export function evaluateMedullaWithPonsPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isMedullaOblongataEmergencyHaltEnabled()) {
    return { passed: true, headline: "Medulla off", detail: "" };
  }
  const medulla = readMedullaOblongataEmergencyHalt(raw);
  if (!medulla?.publishEmergencyBlocked) {
    return { passed: true, headline: "Medulla cleared", detail: "" };
  }
  if (isPonsAutonomicBridgeFailoverEnabled()) {
    const pons = evaluatePonsAutonomicBridgeFailoverGate(raw);
    if (pons.passed && readPonsAutonomicBridgeFailover(raw)?.publishDegradedAllowed) {
      return {
        passed: true,
        headline: "Medulla bridged by pons graceful degrade",
        detail: pons.detail,
      };
    }
  }
  return {
    passed: false,
    headline: "Medulla oblongata emergency halt active",
    detail: medulla.latestReason
      ? `Reason: ${medulla.latestReason}. Clear halt or engage pons bridge.`
      : "Emergency halt blocks publish.",
  };
}
