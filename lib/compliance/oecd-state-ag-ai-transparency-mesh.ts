/**
 * AI2 — OECD / state-AG AI transparency mesh over AH2 FTC + AF2 NIST alignment.
 */

import { createHash } from "node:crypto";
import {
  isNistAiRmfLiveControlFeedEnabled,
  readNistAiRmfLiveControlFeed,
} from "@/lib/compliance/nist-ai-rmf-live-control-feed";
import {
  isUsFtcAiTransparencyLiveEnabled,
  readUsFtcAiTransparencyLive,
} from "@/lib/compliance/us-ftc-ai-transparency-live-feed";

export type OecdJurisdictionId = "oecd_core" | "state_ag_ca" | "state_ag_ny" | "state_ag_tx";

export type OecdStateAgTransparencyEvent = {
  eventId: string;
  at: string;
  source: "webhook" | "sse" | "poll";
  jurisdictionId: OecdJurisdictionId;
  disclosureRecordId: string;
  algorithmicSystemId: string;
  crossBorderAligned: boolean;
  payloadHash: string;
  syncedToOecdMesh: boolean;
};

export type OecdStateAgAiTransparencyMeshSnapshot = {
  at: string;
  events: OecdStateAgTransparencyEvent[];
  lastEventAt: string | null;
  streamLagMs: number;
  meshFeedReady: boolean;
  jurisdictionQuorum: number;
  publishBlockedByOecdMesh: boolean;
  kafkaRelayed: boolean;
  ftcNistAligned: boolean;
};

export const OECD_JURISDICTIONS: OecdJurisdictionId[] = [
  "oecd_core",
  "state_ag_ca",
  "state_ag_ny",
  "state_ag_tx",
];

export function isOecdStateAgAiTransparencyMeshEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_OECD_STATE_AG_AI_TRANSPARENCY_MESH === "1";
}

export function oecdMeshStreamMaxLagMs(): number {
  return Number(process.env.THEME_EXPERIMENT_OECD_MESH_MAX_LAG_MS ?? "3600000");
}

export function oecdJurisdictionQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_OECD_JURISDICTION_QUORUM ?? "0.5");
}

function hashOecdEvent(input: {
  jurisdictionId: string;
  disclosureRecordId: string;
  algorithmicSystemId: string;
}): string {
  return createHash("sha256")
    .update(`oecd-mesh:${input.jurisdictionId}:${input.disclosureRecordId}:${input.algorithmicSystemId}`)
    .digest("hex");
}

export function readOecdStateAgAiTransparencyMesh(raw: unknown): OecdStateAgAiTransparencyMeshSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).oecdStateAgAiTransparencyMesh;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    events: Array.isArray(s.events) ? (s.events as OecdStateAgTransparencyEvent[]) : [],
    lastEventAt: typeof s.lastEventAt === "string" ? s.lastEventAt : null,
    streamLagMs: typeof s.streamLagMs === "number" ? s.streamLagMs : 0,
    meshFeedReady: s.meshFeedReady === true,
    jurisdictionQuorum: typeof s.jurisdictionQuorum === "number" ? s.jurisdictionQuorum : 0,
    publishBlockedByOecdMesh: s.publishBlockedByOecdMesh === true,
    kafkaRelayed: s.kafkaRelayed === true,
    ftcNistAligned: s.ftcNistAligned === true,
  };
}

export function mergeOecdStateAgAiTransparencyMesh(
  previousRaw: unknown,
  snap: OecdStateAgAiTransparencyMeshSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.oecdStateAgAiTransparencyMesh = snap;
  return base;
}

function buildOecdMeshSnapshot(
  events: OecdStateAgTransparencyEvent[],
  kafkaRelayed: boolean,
): OecdStateAgAiTransparencyMeshSnapshot {
  const last = events[events.length - 1] ?? null;
  const streamLagMs = last ? Date.now() - new Date(last.at).getTime() : Infinity;
  const jurisdictionSet = new Set(events.map((e) => e.jurisdictionId));
  const quorumRequired = Math.max(2, Math.ceil(OECD_JURISDICTIONS.length * oecdJurisdictionQuorumFraction()));
  const jurisdictionQuorum = jurisdictionSet.size;
  const unaligned = events.filter((e) => !e.crossBorderAligned).length;
  const publishBlockedByOecdMesh = unaligned > 0;
  const meshFeedReady =
    last !== null &&
    streamLagMs <= oecdMeshStreamMaxLagMs() &&
    last.syncedToOecdMesh &&
    jurisdictionQuorum >= quorumRequired &&
    !publishBlockedByOecdMesh;

  return {
    at: new Date().toISOString(),
    events,
    lastEventAt: last?.at ?? null,
    streamLagMs: Number.isFinite(streamLagMs) ? streamLagMs : 0,
    meshFeedReady,
    jurisdictionQuorum,
    publishBlockedByOecdMesh,
    kafkaRelayed,
    ftcNistAligned: true,
  };
}

export function ingestOecdStateAgTransparencyEvent(
  previousRaw: unknown,
  event: Omit<OecdStateAgTransparencyEvent, "at" | "payloadHash" | "eventId"> & {
    at?: string;
    eventId?: string;
  },
): { json: Record<string, unknown>; snap: OecdStateAgAiTransparencyMeshSnapshot } {
  const entry: OecdStateAgTransparencyEvent = {
    eventId: event.eventId ?? `oecd-${Date.now()}`,
    at: event.at ?? new Date().toISOString(),
    source: event.source,
    jurisdictionId: event.jurisdictionId,
    disclosureRecordId: event.disclosureRecordId,
    algorithmicSystemId: event.algorithmicSystemId,
    crossBorderAligned: event.crossBorderAligned,
    payloadHash: hashOecdEvent(event),
    syncedToOecdMesh: event.syncedToOecdMesh,
  };

  const prev = readOecdStateAgAiTransparencyMesh(previousRaw);
  const events = [...(prev?.events ?? []), entry].slice(-240);
  const nistOk =
    !isNistAiRmfLiveControlFeedEnabled() || readNistAiRmfLiveControlFeed(previousRaw)?.liveControlFeedReady;
  const ftcOk =
    !isUsFtcAiTransparencyLiveEnabled() || !readUsFtcAiTransparencyLive(previousRaw)?.publishBlockedByFtc;
  const snap = buildOecdMeshSnapshot(events, prev?.kafkaRelayed ?? false);
  snap.ftcNistAligned = Boolean(nistOk && ftcOk);
  if (!snap.ftcNistAligned) {
    snap.meshFeedReady = false;
  }
  return { json: mergeOecdStateAgAiTransparencyMesh(previousRaw, snap), snap };
}

export function pollOecdStateAgTransparencyMesh(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: OecdStateAgAiTransparencyMeshSnapshot;
} {
  const seq = (readOecdStateAgAiTransparencyMesh(previousRaw)?.events.length ?? 0) + 1;
  const jurisdictionId = OECD_JURISDICTIONS[seq % OECD_JURISDICTIONS.length]!;
  return ingestOecdStateAgTransparencyEvent(previousRaw, {
    source: "poll",
    jurisdictionId,
    disclosureRecordId: `oecd-rec-${seq}`,
    algorithmicSystemId: `algo-oecd-${seq}`,
    crossBorderAligned: true,
    syncedToOecdMesh: true,
  });
}

export function evaluateOecdStateAgAiTransparencyMeshGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isOecdStateAgAiTransparencyMeshEnabled()) {
    return { passed: true, headline: "OECD state-AG transparency mesh off", detail: "" };
  }
  if (isUsFtcAiTransparencyLiveEnabled() && readUsFtcAiTransparencyLive(raw)?.publishBlockedByFtc) {
    return {
      passed: false,
      headline: "US FTC transparency blocks OECD mesh",
      detail: "Resolve FTC high-harm disclosures before OECD/state-AG mesh.",
    };
  }
  if (isNistAiRmfLiveControlFeedEnabled() && !readNistAiRmfLiveControlFeed(raw)?.liveControlFeedReady) {
    return {
      passed: false,
      headline: "NIST RMF live feed required for OECD mesh",
      detail: "Enable AF2 NIST stream freshness before OECD mesh publish.",
    };
  }
  const snap = readOecdStateAgAiTransparencyMesh(raw);
  if (snap?.publishBlockedByOecdMesh) {
    return {
      passed: false,
      headline: "OECD cross-border alignment gap",
      detail: "One or more jurisdiction records lack cross-border alignment.",
    };
  }
  if (!snap?.meshFeedReady || !snap.ftcNistAligned) {
    return {
      passed: false,
      headline: "OECD state-AG transparency mesh not fresh",
      detail: "Await OECD mesh events with FTC/NIST alignment and jurisdiction quorum.",
    };
  }
  return {
    passed: true,
    headline: "OECD state-AG transparency mesh OK",
    detail: `${snap.jurisdictionQuorum} jurisdictions · last ${snap.lastEventAt ?? "—"}`,
  };
}
