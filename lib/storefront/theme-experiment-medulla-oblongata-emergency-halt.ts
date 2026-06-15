/**
 * AH4 — Medulla oblongata emergency halt over AG4 spinal throttle + ethics veto.
 */

import { appendDnaAuditBlock, isDnaAuditTrailEnabled } from "@/lib/compliance/dna-encoded-audit-trail";
import { toJsonValue } from "@/lib/prisma/json";
import {
  isSpinalCordPublishThrottleEnabled,
  readSpinalCordPublishThrottle,
} from "@/lib/storefront/theme-experiment-spinal-cord-publish-throttle";
import {
  isPrefrontalEthicsBoardEnabled,
  readPrefrontalEthicsBoard,
} from "@/lib/storefront/theme-experiment-prefrontal-ethics-board";

export type MedullaHaltReason =
  | "ethics_veto"
  | "spinal_throttle_breach"
  | "manual_emergency"
  | "autonomic_cascade";

export type MedullaEmergencyHaltEvent = {
  haltId: string;
  at: string;
  reason: MedullaHaltReason;
  ethicsReviewId: string | null;
  spinalAttemptsInWindow: number;
  rationale: string;
  cleared: boolean;
};

export type MedullaOblongataEmergencyHaltSnapshot = {
  at: string;
  halts: MedullaEmergencyHaltEvent[];
  emergencyHaltActive: boolean;
  latestReason: MedullaHaltReason | null;
  spinalThrottleSynced: boolean;
  ethicsVetoActive: boolean;
  publishEmergencyBlocked: boolean;
};

export function isMedullaOblongataEmergencyHaltEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_MEDULLA_OBLONGATA_EMERGENCY_HALT === "1";
}

export function readMedullaOblongataEmergencyHalt(raw: unknown): MedullaOblongataEmergencyHaltSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).medullaOblongataEmergencyHalt;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    halts: Array.isArray(s.halts) ? (s.halts as MedullaEmergencyHaltEvent[]) : [],
    emergencyHaltActive: s.emergencyHaltActive === true,
    latestReason: (s.latestReason as MedullaHaltReason) ?? null,
    spinalThrottleSynced: s.spinalThrottleSynced === true,
    ethicsVetoActive: s.ethicsVetoActive === true,
    publishEmergencyBlocked: s.publishEmergencyBlocked === true,
  };
}

export function mergeMedullaOblongataEmergencyHalt(
  previousRaw: unknown,
  snap: MedullaOblongataEmergencyHaltSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.medullaOblongataEmergencyHalt = snap;
  return base;
}

export function recordMedullaEmergencyHalt(
  previousRaw: unknown,
  halt: Omit<MedullaEmergencyHaltEvent, "haltId" | "at" | "cleared"> & {
    haltId?: string;
    at?: string;
    cleared?: boolean;
  },
): { json: Record<string, unknown>; snap: MedullaOblongataEmergencyHaltSnapshot } {
  const entry: MedullaEmergencyHaltEvent = {
    haltId: halt.haltId ?? `medulla-${Date.now()}`,
    at: halt.at ?? new Date().toISOString(),
    reason: halt.reason,
    ethicsReviewId: halt.ethicsReviewId,
    spinalAttemptsInWindow: halt.spinalAttemptsInWindow,
    rationale: halt.rationale,
    cleared: halt.cleared ?? false,
  };

  let json =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};

  if (isDnaAuditTrailEnabled()) {
    const dna = appendDnaAuditBlock(json, {
      eventType: "medulla_emergency_halt",
      payload: { haltId: entry.haltId, reason: entry.reason },
    });
    json = dna.json;
  }

  const prev = readMedullaOblongataEmergencyHalt(json);
  const halts = [...(prev?.halts ?? []), entry].slice(-30);
  const active = halts.filter((h) => !h.cleared);
  const latest = active[active.length - 1] ?? halts[halts.length - 1] ?? null;

  const spinal = readSpinalCordPublishThrottle(json);
  const ethics = readPrefrontalEthicsBoard(json);
  const ethicsVetoActive = ethics?.publishVetoActive ?? false;
  const emergencyHaltActive = active.length > 0 || ethicsVetoActive || (spinal?.publishThrottled ?? false);

  const snap: MedullaOblongataEmergencyHaltSnapshot = {
    at: new Date().toISOString(),
    halts,
    emergencyHaltActive,
    latestReason: latest?.reason ?? null,
    spinalThrottleSynced: spinal?.brainstemCleared ?? false,
    ethicsVetoActive,
    publishEmergencyBlocked: emergencyHaltActive,
  };

  return { json: mergeMedullaOblongataEmergencyHalt(json, snap), snap };
}

export function syncMedullaFromSpinalAndEthics(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: MedullaOblongataEmergencyHaltSnapshot;
} {
  const spinal = readSpinalCordPublishThrottle(previousRaw);
  const ethics = readPrefrontalEthicsBoard(previousRaw);
  const pendingVeto = ethics?.queue.find((q) => q.status === "vetoed");

  let reason: MedullaHaltReason = "autonomic_cascade";
  let rationale = "Medulla monitoring — no emergency";
  let cleared = true;

  if (ethics?.publishVetoActive || pendingVeto) {
    reason = "ethics_veto";
    rationale = pendingVeto?.rationale ?? "Ethics board publish veto active";
    cleared = false;
  } else if (spinal?.publishThrottled) {
    reason = "spinal_throttle_breach";
    rationale = `Spinal throttle ${spinal.attemptsInWindow}/${spinal.maxAttemptsPerWindow} in ethics window`;
    cleared = false;
  }

  return recordMedullaEmergencyHalt(previousRaw, {
    reason,
    ethicsReviewId: pendingVeto?.reviewId ?? null,
    spinalAttemptsInWindow: spinal?.attemptsInWindow ?? 0,
    rationale,
    cleared,
  });
}

export function applyMedullaEmergencyToWetwareJson(previousRaw: unknown): Record<string, unknown> {
  const med = readMedullaOblongataEmergencyHalt(previousRaw);
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  if (med?.publishEmergencyBlocked) {
    base.medullaEmergencyHalt = true;
  }
  return base;
}

export function evaluateMedullaOblongataEmergencyHaltGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isMedullaOblongataEmergencyHaltEnabled()) {
    return { passed: true, headline: "Medulla emergency halt off", detail: "" };
  }
  if (!isSpinalCordPublishThrottleEnabled()) {
    return {
      passed: false,
      headline: "Spinal cord publish throttle required",
      detail: "Enable THEME_EXPERIMENT_SPINAL_CORD_PUBLISH_THROTTLE=1 (AG4).",
    };
  }
  if (isPrefrontalEthicsBoardEnabled() && readPrefrontalEthicsBoard(raw)?.publishVetoActive) {
    return {
      passed: false,
      headline: "Medulla emergency halt — ethics veto",
      detail: "Clear ethics veto before medulla allows publish.",
    };
  }
  const med = readMedullaOblongataEmergencyHalt(raw);
  if (med?.publishEmergencyBlocked) {
    return {
      passed: false,
      headline: "Medulla oblongata emergency halt active",
      detail: med.latestReason
        ? `Reason: ${med.latestReason}. Clear halt before publish.`
        : "Emergency halt blocks all publish paths.",
    };
  }
  return {
    passed: true,
    headline: "Medulla emergency halt cleared",
    detail: "No active emergency halt on autonomic publish path",
  };
}
