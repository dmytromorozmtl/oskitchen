/**
 * AO2 — CEN / CENELEC digital product governance registry over AN2 ISO/IEC standards + EU notified body.
 */

import { createHash } from "node:crypto";
import {
  isEuAiOfficeNotifiedBodyEnabled,
  readEuAiOfficeNotifiedBodyPack,
} from "@/lib/compliance/eu-ai-office-notified-body";
import {
  isIsoIecAiStandardsHarmonizationRegistryEnabled,
  readIsoIecAiStandardsHarmonizationRegistry,
} from "@/lib/compliance/iso-iec-ai-standards-harmonization-registry";

export type GovernanceBodyId = "cen_tc21" | "cenelec_tc65x" | "cen_cenelec_jtc21" | "cenelec_clc_srg";

export type CenCenelecGovernanceEvent = {
  eventId: string;
  at: string;
  source: "webhook" | "sse" | "poll";
  bodyId: GovernanceBodyId;
  governanceRecordId: string;
  productGovernanceClauseId: string;
  standardsRegistryAligned: boolean;
  notifiedBodyAligned: boolean;
  payloadHash: string;
  syncedToGovernanceRegistry: boolean;
};

export type CenCenelecDigitalProductGovernanceRegistrySnapshot = {
  at: string;
  events: CenCenelecGovernanceEvent[];
  lastEventAt: string | null;
  streamLagMs: number;
  governanceRegistryReady: boolean;
  bodyQuorum: number;
  publishBlockedByGovernance: boolean;
  kafkaRelayed: boolean;
  standardsNotifiedAligned: boolean;
};

export const GOVERNANCE_BODIES: GovernanceBodyId[] = [
  "cen_tc21",
  "cenelec_tc65x",
  "cen_cenelec_jtc21",
  "cenelec_clc_srg",
];

export function isCenCenelecDigitalProductGovernanceRegistryEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_CEN_CENELEC_DIGITAL_PRODUCT_GOVERNANCE_REGISTRY === "1";
}

export function governanceRegistryStreamMaxLagMs(): number {
  return Number(process.env.THEME_EXPERIMENT_GOVERNANCE_REGISTRY_MAX_LAG_MS ?? "3600000");
}

export function governanceBodyQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_GOVERNANCE_BODY_QUORUM ?? "0.5");
}

function hashGovernanceEvent(input: {
  bodyId: string;
  governanceRecordId: string;
  productGovernanceClauseId: string;
}): string {
  return createHash("sha256")
    .update(`cen-cenelec:${input.bodyId}:${input.governanceRecordId}:${input.productGovernanceClauseId}`)
    .digest("hex");
}

export function readCenCenelecDigitalProductGovernanceRegistry(
  raw: unknown,
): CenCenelecDigitalProductGovernanceRegistrySnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).cenCenelecDigitalProductGovernanceRegistry;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    events: Array.isArray(s.events) ? (s.events as CenCenelecGovernanceEvent[]) : [],
    lastEventAt: typeof s.lastEventAt === "string" ? s.lastEventAt : null,
    streamLagMs: typeof s.streamLagMs === "number" ? s.streamLagMs : 0,
    governanceRegistryReady: s.governanceRegistryReady === true,
    bodyQuorum: typeof s.bodyQuorum === "number" ? s.bodyQuorum : 0,
    publishBlockedByGovernance: s.publishBlockedByGovernance === true,
    kafkaRelayed: s.kafkaRelayed === true,
    standardsNotifiedAligned: s.standardsNotifiedAligned === true,
  };
}

export function mergeCenCenelecDigitalProductGovernanceRegistry(
  previousRaw: unknown,
  snap: CenCenelecDigitalProductGovernanceRegistrySnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.cenCenelecDigitalProductGovernanceRegistry = snap;
  return base;
}

function buildGovernanceSnapshot(
  events: CenCenelecGovernanceEvent[],
  kafkaRelayed: boolean,
): CenCenelecDigitalProductGovernanceRegistrySnapshot {
  const last = events[events.length - 1] ?? null;
  const streamLagMs = last ? Date.now() - new Date(last.at).getTime() : Infinity;
  const bodySet = new Set(events.map((e) => e.bodyId));
  const quorumRequired = Math.max(2, Math.ceil(GOVERNANCE_BODIES.length * governanceBodyQuorumFraction()));
  const misaligned = events.filter((e) => !e.standardsRegistryAligned || !e.notifiedBodyAligned).length;
  const publishBlockedByGovernance = misaligned > 0;
  const governanceRegistryReady =
    last !== null &&
    streamLagMs <= governanceRegistryStreamMaxLagMs() &&
    last.syncedToGovernanceRegistry &&
    bodySet.size >= quorumRequired &&
    !publishBlockedByGovernance;

  return {
    at: new Date().toISOString(),
    events,
    lastEventAt: last?.at ?? null,
    streamLagMs: Number.isFinite(streamLagMs) ? streamLagMs : 0,
    governanceRegistryReady,
    bodyQuorum: bodySet.size,
    publishBlockedByGovernance,
    kafkaRelayed,
    standardsNotifiedAligned: true,
  };
}

export function ingestCenCenelecGovernanceEvent(
  previousRaw: unknown,
  event: Omit<
    CenCenelecGovernanceEvent,
    "at" | "payloadHash" | "eventId" | "standardsRegistryAligned" | "notifiedBodyAligned"
  > & {
    at?: string;
    eventId?: string;
    standardsRegistryAligned?: boolean;
    notifiedBodyAligned?: boolean;
  },
): { json: Record<string, unknown>; snap: CenCenelecDigitalProductGovernanceRegistrySnapshot } {
  const standardsOk =
    !isIsoIecAiStandardsHarmonizationRegistryEnabled() ||
    (readIsoIecAiStandardsHarmonizationRegistry(previousRaw)?.standardsRegistryReady ?? false);
  const notifiedOk =
    !isEuAiOfficeNotifiedBodyEnabled() ||
    (readEuAiOfficeNotifiedBodyPack(previousRaw)?.notifiedBodyReady ?? false);

  const entry: CenCenelecGovernanceEvent = {
    eventId: event.eventId ?? `governance-${Date.now()}`,
    at: event.at ?? new Date().toISOString(),
    source: event.source,
    bodyId: event.bodyId,
    governanceRecordId: event.governanceRecordId,
    productGovernanceClauseId: event.productGovernanceClauseId,
    standardsRegistryAligned: event.standardsRegistryAligned ?? standardsOk,
    notifiedBodyAligned: event.notifiedBodyAligned ?? notifiedOk,
    payloadHash: hashGovernanceEvent(event),
    syncedToGovernanceRegistry: event.syncedToGovernanceRegistry,
  };

  const prev = readCenCenelecDigitalProductGovernanceRegistry(previousRaw);
  const events = [...(prev?.events ?? []), entry].slice(-240);
  const snap = buildGovernanceSnapshot(events, prev?.kafkaRelayed ?? false);
  snap.standardsNotifiedAligned = Boolean(standardsOk && notifiedOk);
  if (!snap.standardsNotifiedAligned) {
    snap.governanceRegistryReady = false;
  }
  return { json: mergeCenCenelecDigitalProductGovernanceRegistry(previousRaw, snap), snap };
}

export function pollCenCenelecDigitalProductGovernanceRegistry(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: CenCenelecDigitalProductGovernanceRegistrySnapshot;
} {
  const seq = (readCenCenelecDigitalProductGovernanceRegistry(previousRaw)?.events.length ?? 0) + 1;
  const bodyId = GOVERNANCE_BODIES[seq % GOVERNANCE_BODIES.length]!;
  return ingestCenCenelecGovernanceEvent(previousRaw, {
    source: "poll",
    bodyId,
    governanceRecordId: `gov-rec-${seq}`,
    productGovernanceClauseId: `clause-${seq}`,
    syncedToGovernanceRegistry: true,
  });
}

export function evaluateCenCenelecDigitalProductGovernanceRegistryGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isCenCenelecDigitalProductGovernanceRegistryEnabled()) {
    return { passed: true, headline: "CEN/CENELEC governance registry off", detail: "" };
  }
  if (
    isIsoIecAiStandardsHarmonizationRegistryEnabled() &&
    !readIsoIecAiStandardsHarmonizationRegistry(raw)?.standardsRegistryReady
  ) {
    return {
      passed: false,
      headline: "ISO/IEC standards registry must be fresh",
      detail: "Complete AN2 standards harmonization before CEN/CENELEC governance.",
    };
  }
  if (isEuAiOfficeNotifiedBodyEnabled() && !readEuAiOfficeNotifiedBodyPack(raw)?.notifiedBodyReady) {
    return {
      passed: false,
      headline: "EU notified body pack must be fresh",
      detail: "Complete EU AI Office notified body before governance layer.",
    };
  }
  const snap = readCenCenelecDigitalProductGovernanceRegistry(raw);
  if (snap?.publishBlockedByGovernance) {
    return {
      passed: false,
      headline: "Governance standards/notified-body alignment gap",
      detail: "One or more governance records lack standards/notified-body cross-alignment.",
    };
  }
  if (!snap?.governanceRegistryReady || !snap.standardsNotifiedAligned) {
    return {
      passed: false,
      headline: "CEN/CENELEC governance registry not fresh",
      detail: "Await governance events with standards/notified-body alignment and body quorum.",
    };
  }
  return {
    passed: true,
    headline: "CEN/CENELEC digital product governance OK",
    detail: `${snap.bodyQuorum} bodies · last ${snap.lastEventAt ?? "—"}`,
  };
}
