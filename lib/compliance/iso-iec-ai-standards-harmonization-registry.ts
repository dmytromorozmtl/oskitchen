/**
 * AN2 — ISO / IEC AI standards harmonization registry over AM2 ITU/UNCITRAL + AJ2 UN Office.
 */

import { createHash } from "node:crypto";
import {
  isItuUncitralDigitalCommerceAiRegistryEnabled,
  readItuUncitralDigitalCommerceAiRegistry,
} from "@/lib/compliance/itu-uncitral-digital-commerce-ai-registry";
import {
  isUnAiOfficeGlobalRegistryMeshEnabled,
  readUnAiOfficeGlobalRegistryMesh,
} from "@/lib/compliance/un-ai-office-global-registry-mesh";

export type StandardsBodyId = "iso_iec_jtc21" | "iec_sc42" | "iso_iec_42001" | "iec_62443_ai";

export type IsoIecStandardsHarmonizationEvent = {
  eventId: string;
  at: string;
  source: "webhook" | "sse" | "poll";
  bodyId: StandardsBodyId;
  standardsRecordId: string;
  harmonizationClauseId: string;
  commerceRegistryAligned: boolean;
  unRegistryAligned: boolean;
  payloadHash: string;
  syncedToStandardsRegistry: boolean;
};

export type IsoIecAiStandardsHarmonizationRegistrySnapshot = {
  at: string;
  events: IsoIecStandardsHarmonizationEvent[];
  lastEventAt: string | null;
  streamLagMs: number;
  standardsRegistryReady: boolean;
  bodyQuorum: number;
  publishBlockedByStandards: boolean;
  kafkaRelayed: boolean;
  commerceUnAligned: boolean;
};

export const STANDARDS_BODIES: StandardsBodyId[] = [
  "iso_iec_jtc21",
  "iec_sc42",
  "iso_iec_42001",
  "iec_62443_ai",
];

export function isIsoIecAiStandardsHarmonizationRegistryEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_ISO_IEC_AI_STANDARDS_HARMONIZATION_REGISTRY === "1";
}

export function standardsRegistryStreamMaxLagMs(): number {
  return Number(process.env.THEME_EXPERIMENT_STANDARDS_REGISTRY_MAX_LAG_MS ?? "3600000");
}

export function standardsBodyQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_STANDARDS_BODY_QUORUM ?? "0.5");
}

function hashStandardsEvent(input: {
  bodyId: string;
  standardsRecordId: string;
  harmonizationClauseId: string;
}): string {
  return createHash("sha256")
    .update(`iso-iec:${input.bodyId}:${input.standardsRecordId}:${input.harmonizationClauseId}`)
    .digest("hex");
}

export function readIsoIecAiStandardsHarmonizationRegistry(
  raw: unknown,
): IsoIecAiStandardsHarmonizationRegistrySnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).isoIecAiStandardsHarmonizationRegistry;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    events: Array.isArray(s.events) ? (s.events as IsoIecStandardsHarmonizationEvent[]) : [],
    lastEventAt: typeof s.lastEventAt === "string" ? s.lastEventAt : null,
    streamLagMs: typeof s.streamLagMs === "number" ? s.streamLagMs : 0,
    standardsRegistryReady: s.standardsRegistryReady === true,
    bodyQuorum: typeof s.bodyQuorum === "number" ? s.bodyQuorum : 0,
    publishBlockedByStandards: s.publishBlockedByStandards === true,
    kafkaRelayed: s.kafkaRelayed === true,
    commerceUnAligned: s.commerceUnAligned === true,
  };
}

export function mergeIsoIecAiStandardsHarmonizationRegistry(
  previousRaw: unknown,
  snap: IsoIecAiStandardsHarmonizationRegistrySnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.isoIecAiStandardsHarmonizationRegistry = snap;
  return base;
}

function buildStandardsSnapshot(
  events: IsoIecStandardsHarmonizationEvent[],
  kafkaRelayed: boolean,
): IsoIecAiStandardsHarmonizationRegistrySnapshot {
  const last = events[events.length - 1] ?? null;
  const streamLagMs = last ? Date.now() - new Date(last.at).getTime() : Infinity;
  const bodySet = new Set(events.map((e) => e.bodyId));
  const quorumRequired = Math.max(2, Math.ceil(STANDARDS_BODIES.length * standardsBodyQuorumFraction()));
  const misaligned = events.filter((e) => !e.commerceRegistryAligned || !e.unRegistryAligned).length;
  const publishBlockedByStandards = misaligned > 0;
  const standardsRegistryReady =
    last !== null &&
    streamLagMs <= standardsRegistryStreamMaxLagMs() &&
    last.syncedToStandardsRegistry &&
    bodySet.size >= quorumRequired &&
    !publishBlockedByStandards;

  return {
    at: new Date().toISOString(),
    events,
    lastEventAt: last?.at ?? null,
    streamLagMs: Number.isFinite(streamLagMs) ? streamLagMs : 0,
    standardsRegistryReady,
    bodyQuorum: bodySet.size,
    publishBlockedByStandards,
    kafkaRelayed,
    commerceUnAligned: true,
  };
}

export function ingestIsoIecStandardsHarmonizationEvent(
  previousRaw: unknown,
  event: Omit<
    IsoIecStandardsHarmonizationEvent,
    "at" | "payloadHash" | "eventId" | "commerceRegistryAligned" | "unRegistryAligned"
  > & {
    at?: string;
    eventId?: string;
    commerceRegistryAligned?: boolean;
    unRegistryAligned?: boolean;
  },
): { json: Record<string, unknown>; snap: IsoIecAiStandardsHarmonizationRegistrySnapshot } {
  const commerceOk =
    !isItuUncitralDigitalCommerceAiRegistryEnabled() ||
    (readItuUncitralDigitalCommerceAiRegistry(previousRaw)?.commerceRegistryReady ?? false);
  const unOk =
    !isUnAiOfficeGlobalRegistryMeshEnabled() ||
    (readUnAiOfficeGlobalRegistryMesh(previousRaw)?.globalRegistryReady ?? false);

  const entry: IsoIecStandardsHarmonizationEvent = {
    eventId: event.eventId ?? `standards-${Date.now()}`,
    at: event.at ?? new Date().toISOString(),
    source: event.source,
    bodyId: event.bodyId,
    standardsRecordId: event.standardsRecordId,
    harmonizationClauseId: event.harmonizationClauseId,
    commerceRegistryAligned: event.commerceRegistryAligned ?? commerceOk,
    unRegistryAligned: event.unRegistryAligned ?? unOk,
    payloadHash: hashStandardsEvent(event),
    syncedToStandardsRegistry: event.syncedToStandardsRegistry,
  };

  const prev = readIsoIecAiStandardsHarmonizationRegistry(previousRaw);
  const events = [...(prev?.events ?? []), entry].slice(-240);
  const snap = buildStandardsSnapshot(events, prev?.kafkaRelayed ?? false);
  snap.commerceUnAligned = Boolean(commerceOk && unOk);
  if (!snap.commerceUnAligned) {
    snap.standardsRegistryReady = false;
  }
  return { json: mergeIsoIecAiStandardsHarmonizationRegistry(previousRaw, snap), snap };
}

export function pollIsoIecAiStandardsHarmonizationRegistry(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: IsoIecAiStandardsHarmonizationRegistrySnapshot;
} {
  const seq = (readIsoIecAiStandardsHarmonizationRegistry(previousRaw)?.events.length ?? 0) + 1;
  const bodyId = STANDARDS_BODIES[seq % STANDARDS_BODIES.length]!;
  return ingestIsoIecStandardsHarmonizationEvent(previousRaw, {
    source: "poll",
    bodyId,
    standardsRecordId: `std-rec-${seq}`,
    harmonizationClauseId: `clause-${seq}`,
    syncedToStandardsRegistry: true,
  });
}

export function evaluateIsoIecAiStandardsHarmonizationRegistryGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isIsoIecAiStandardsHarmonizationRegistryEnabled()) {
    return { passed: true, headline: "ISO/IEC standards harmonization registry off", detail: "" };
  }
  if (
    isItuUncitralDigitalCommerceAiRegistryEnabled() &&
    !readItuUncitralDigitalCommerceAiRegistry(raw)?.commerceRegistryReady
  ) {
    return {
      passed: false,
      headline: "ITU/UNCITRAL commerce registry must be fresh",
      detail: "Complete AM2 digital commerce layer before ISO/IEC standards.",
    };
  }
  if (isUnAiOfficeGlobalRegistryMeshEnabled() && !readUnAiOfficeGlobalRegistryMesh(raw)?.globalRegistryReady) {
    return {
      passed: false,
      headline: "UN global registry must be fresh",
      detail: "Complete AJ2 UN AI Office registry before standards layer.",
    };
  }
  const snap = readIsoIecAiStandardsHarmonizationRegistry(raw);
  if (snap?.publishBlockedByStandards) {
    return {
      passed: false,
      headline: "Standards commerce/UN alignment gap",
      detail: "One or more standards records lack commerce/UN cross-alignment.",
    };
  }
  if (!snap?.standardsRegistryReady || !snap.commerceUnAligned) {
    return {
      passed: false,
      headline: "ISO/IEC standards registry not fresh",
      detail: "Await standards events with commerce/UN alignment and body quorum.",
    };
  }
  return {
    passed: true,
    headline: "ISO/IEC standards harmonization OK",
    detail: `${snap.bodyQuorum} bodies · last ${snap.lastEventAt ?? "—"}`,
  };
}
