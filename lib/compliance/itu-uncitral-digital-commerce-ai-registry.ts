/**
 * AM2 — ITU-T / UNCITRAL digital commerce AI registry over AL2 WTO/UPU + AJ2 UN Office.
 */

import { createHash } from "node:crypto";
import {
  isWtoUpuCrossBorderAiTradeRegistryEnabled,
  readWtoUpuCrossBorderAiTradeRegistry,
} from "@/lib/compliance/wto-upu-cross-border-ai-trade-registry";
import {
  isUnAiOfficeGlobalRegistryMeshEnabled,
  readUnAiOfficeGlobalRegistryMesh,
} from "@/lib/compliance/un-ai-office-global-registry-mesh";

export type DigitalCommerceBodyId = "itu_t_geneva" | "uncitral_vienna" | "wipo_digital" | "itu_f_plenipot";

export type ItuUncitralDigitalCommerceEvent = {
  eventId: string;
  at: string;
  source: "webhook" | "sse" | "poll";
  bodyId: DigitalCommerceBodyId;
  commerceRecordId: string;
  digitalTradeAgreementId: string;
  tradeRegistryAligned: boolean;
  unRegistryAligned: boolean;
  payloadHash: string;
  syncedToCommerceRegistry: boolean;
};

export type ItuUncitralDigitalCommerceAiRegistrySnapshot = {
  at: string;
  events: ItuUncitralDigitalCommerceEvent[];
  lastEventAt: string | null;
  streamLagMs: number;
  commerceRegistryReady: boolean;
  bodyQuorum: number;
  publishBlockedByCommerce: boolean;
  kafkaRelayed: boolean;
  tradeUnAligned: boolean;
};

export const DIGITAL_COMMERCE_BODIES: DigitalCommerceBodyId[] = [
  "itu_t_geneva",
  "uncitral_vienna",
  "wipo_digital",
  "itu_f_plenipot",
];

export function isItuUncitralDigitalCommerceAiRegistryEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_ITU_UNCITRAL_DIGITAL_COMMERCE_AI_REGISTRY === "1";
}

export function commerceRegistryStreamMaxLagMs(): number {
  return Number(process.env.THEME_EXPERIMENT_COMMERCE_REGISTRY_MAX_LAG_MS ?? "3600000");
}

export function commerceRegistryBodyQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_COMMERCE_REGISTRY_BODY_QUORUM ?? "0.5");
}

function hashCommerceEvent(input: {
  bodyId: string;
  commerceRecordId: string;
  digitalTradeAgreementId: string;
}): string {
  return createHash("sha256")
    .update(`itu-uncitral:${input.bodyId}:${input.commerceRecordId}:${input.digitalTradeAgreementId}`)
    .digest("hex");
}

export function readItuUncitralDigitalCommerceAiRegistry(
  raw: unknown,
): ItuUncitralDigitalCommerceAiRegistrySnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).ituUncitralDigitalCommerceAiRegistry;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    events: Array.isArray(s.events) ? (s.events as ItuUncitralDigitalCommerceEvent[]) : [],
    lastEventAt: typeof s.lastEventAt === "string" ? s.lastEventAt : null,
    streamLagMs: typeof s.streamLagMs === "number" ? s.streamLagMs : 0,
    commerceRegistryReady: s.commerceRegistryReady === true,
    bodyQuorum: typeof s.bodyQuorum === "number" ? s.bodyQuorum : 0,
    publishBlockedByCommerce: s.publishBlockedByCommerce === true,
    kafkaRelayed: s.kafkaRelayed === true,
    tradeUnAligned: s.tradeUnAligned === true,
  };
}

export function mergeItuUncitralDigitalCommerceAiRegistry(
  previousRaw: unknown,
  snap: ItuUncitralDigitalCommerceAiRegistrySnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.ituUncitralDigitalCommerceAiRegistry = snap;
  return base;
}

function buildCommerceSnapshot(
  events: ItuUncitralDigitalCommerceEvent[],
  kafkaRelayed: boolean,
): ItuUncitralDigitalCommerceAiRegistrySnapshot {
  const last = events[events.length - 1] ?? null;
  const streamLagMs = last ? Date.now() - new Date(last.at).getTime() : Infinity;
  const bodySet = new Set(events.map((e) => e.bodyId));
  const quorumRequired = Math.max(
    2,
    Math.ceil(DIGITAL_COMMERCE_BODIES.length * commerceRegistryBodyQuorumFraction()),
  );
  const misaligned = events.filter((e) => !e.tradeRegistryAligned || !e.unRegistryAligned).length;
  const publishBlockedByCommerce = misaligned > 0;
  const commerceRegistryReady =
    last !== null &&
    streamLagMs <= commerceRegistryStreamMaxLagMs() &&
    last.syncedToCommerceRegistry &&
    bodySet.size >= quorumRequired &&
    !publishBlockedByCommerce;

  return {
    at: new Date().toISOString(),
    events,
    lastEventAt: last?.at ?? null,
    streamLagMs: Number.isFinite(streamLagMs) ? streamLagMs : 0,
    commerceRegistryReady,
    bodyQuorum: bodySet.size,
    publishBlockedByCommerce,
    kafkaRelayed,
    tradeUnAligned: true,
  };
}

export function ingestItuUncitralDigitalCommerceEvent(
  previousRaw: unknown,
  event: Omit<
    ItuUncitralDigitalCommerceEvent,
    "at" | "payloadHash" | "eventId" | "tradeRegistryAligned" | "unRegistryAligned"
  > & {
    at?: string;
    eventId?: string;
    tradeRegistryAligned?: boolean;
    unRegistryAligned?: boolean;
  },
): { json: Record<string, unknown>; snap: ItuUncitralDigitalCommerceAiRegistrySnapshot } {
  const tradeOk =
    !isWtoUpuCrossBorderAiTradeRegistryEnabled() ||
    (readWtoUpuCrossBorderAiTradeRegistry(previousRaw)?.tradeRegistryReady ?? false);
  const unOk =
    !isUnAiOfficeGlobalRegistryMeshEnabled() ||
    (readUnAiOfficeGlobalRegistryMesh(previousRaw)?.globalRegistryReady ?? false);

  const entry: ItuUncitralDigitalCommerceEvent = {
    eventId: event.eventId ?? `commerce-${Date.now()}`,
    at: event.at ?? new Date().toISOString(),
    source: event.source,
    bodyId: event.bodyId,
    commerceRecordId: event.commerceRecordId,
    digitalTradeAgreementId: event.digitalTradeAgreementId,
    tradeRegistryAligned: event.tradeRegistryAligned ?? tradeOk,
    unRegistryAligned: event.unRegistryAligned ?? unOk,
    payloadHash: hashCommerceEvent(event),
    syncedToCommerceRegistry: event.syncedToCommerceRegistry,
  };

  const prev = readItuUncitralDigitalCommerceAiRegistry(previousRaw);
  const events = [...(prev?.events ?? []), entry].slice(-240);
  const snap = buildCommerceSnapshot(events, prev?.kafkaRelayed ?? false);
  snap.tradeUnAligned = Boolean(tradeOk && unOk);
  if (!snap.tradeUnAligned) {
    snap.commerceRegistryReady = false;
  }
  return { json: mergeItuUncitralDigitalCommerceAiRegistry(previousRaw, snap), snap };
}

export function pollItuUncitralDigitalCommerceRegistry(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: ItuUncitralDigitalCommerceAiRegistrySnapshot;
} {
  const seq = (readItuUncitralDigitalCommerceAiRegistry(previousRaw)?.events.length ?? 0) + 1;
  const bodyId = DIGITAL_COMMERCE_BODIES[seq % DIGITAL_COMMERCE_BODIES.length]!;
  return ingestItuUncitralDigitalCommerceEvent(previousRaw, {
    source: "poll",
    bodyId,
    commerceRecordId: `commerce-rec-${seq}`,
    digitalTradeAgreementId: `dta-${seq}`,
    syncedToCommerceRegistry: true,
  });
}

export function evaluateItuUncitralDigitalCommerceAiRegistryGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isItuUncitralDigitalCommerceAiRegistryEnabled()) {
    return { passed: true, headline: "ITU-T/UNCITRAL digital commerce registry off", detail: "" };
  }
  if (isWtoUpuCrossBorderAiTradeRegistryEnabled() && !readWtoUpuCrossBorderAiTradeRegistry(raw)?.tradeRegistryReady) {
    return {
      passed: false,
      headline: "WTO/UPU trade registry must be fresh",
      detail: "Complete AL2 trade layer before digital commerce registry.",
    };
  }
  if (isUnAiOfficeGlobalRegistryMeshEnabled() && !readUnAiOfficeGlobalRegistryMesh(raw)?.globalRegistryReady) {
    return {
      passed: false,
      headline: "UN global registry must be fresh",
      detail: "Complete AJ2 UN AI Office registry before commerce layer.",
    };
  }
  const snap = readItuUncitralDigitalCommerceAiRegistry(raw);
  if (snap?.publishBlockedByCommerce) {
    return {
      passed: false,
      headline: "Commerce trade/UN alignment gap",
      detail: "One or more commerce records lack trade/UN cross-alignment.",
    };
  }
  if (!snap?.commerceRegistryReady || !snap.tradeUnAligned) {
    return {
      passed: false,
      headline: "ITU-T/UNCITRAL commerce registry not fresh",
      detail: "Await commerce registry events with trade/UN alignment and body quorum.",
    };
  }
  return {
    passed: true,
    headline: "ITU-T/UNCITRAL digital commerce registry OK",
    detail: `${snap.bodyQuorum} bodies · last ${snap.lastEventAt ?? "—"}`,
  };
}
