import { logger } from "@/lib/logger";
import { toJsonValue } from "@/lib/prisma/json";
import { recordExperimentSpan } from "@/lib/storefront/experiment-trace";
import {
  mergeCrdtLww,
  readCrdtLwwState,
  type CrdtLwwState,
  writeCrdtLwwToJson,
} from "@/lib/storefront/theme-experiment-crdt-lww";
import { readVersionVector } from "@/lib/storefront/theme-experiment-crdt";

export type CrdtGossipEntry = {
  region: string;
  vector: number;
  at: string;
};

export type CrdtGossipBus = {
  at: string;
  entries: CrdtGossipEntry[];
  conflictCount: number;
};

export function isCrdtGossipBusEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_CRDT_GOSSIP === "1";
}

export function localEdgeRegionId(): string | null {
  return process.env.EDGE_CONFIG_ID_LOCAL?.trim() ?? process.env.EDGE_CONFIG_ID?.trim() ?? null;
}

export function readCrdtGossipBus(raw: unknown): CrdtGossipBus | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).crdtGossipBus;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const b = o as Record<string, unknown>;
  if (!Array.isArray(b.entries)) return null;
  return {
    at: typeof b.at === "string" ? b.at : new Date().toISOString(),
    entries: b.entries as CrdtGossipEntry[],
    conflictCount: typeof b.conflictCount === "number" ? b.conflictCount : 0,
  };
}

export function mergeGossipIntoJson(
  raw: unknown,
  entry: CrdtGossipEntry,
): { json: Record<string, unknown>; conflictCount: number } {
  const base =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? { ...(raw as Record<string, unknown>) }
      : {};
  const bus = readCrdtGossipBus(raw) ?? { at: new Date().toISOString(), entries: [], conflictCount: 0 };
  const entries = [...bus.entries.filter((e) => e.region !== entry.region), entry].slice(-12);
  const versions = entries.map((e) => e.vector);
  const unique = new Set(versions);
  const conflictCount = Math.max(0, unique.size - 1);

  const lww = readCrdtLwwState(raw) ?? {
    vector: readVersionVector(raw),
    tombstones: [],
  };
  const maxV = Math.max(...versions, lww.vector.logical);
  const mergedLww: CrdtLwwState = {
    vector: { ...lww.vector, logical: maxV, edge: maxV, updatedAt: new Date().toISOString() },
    tombstones: lww.tombstones,
  };

  const json = writeCrdtLwwToJson(base, mergedLww);
  json.crdtGossipBus = {
    at: new Date().toISOString(),
    entries,
    conflictCount,
  };

  recordExperimentSpan({
    traceId: `gossip-${entry.region}`,
    spanId: `merge-${Date.now()}`,
    name: "crdt.gossip_merge",
    durationMs: 0,
    fields: { region: entry.region, vector: entry.vector, conflict_count: conflictCount },
  });

  if (conflictCount > 0) {
    logger.info("experiment_crdt_gossip_conflict", {
      region: entry.region,
      conflict_count: conflictCount,
    });
  }

  return { json, conflictCount };
}

/** GC tombstones older than retention logical versions. */
export function gcCrdtTombstones(raw: unknown, retainVersions = 5): Record<string, unknown> {
  const lww = readCrdtLwwState(raw);
  if (!lww) return raw && typeof raw === "object" && !Array.isArray(raw) ? { ...(raw as object) } : {};
  const cutoff = lww.vector.logical - retainVersions;
  const tombstones = lww.tombstones.filter((t) => t.vector >= cutoff);
  const merged = mergeCrdtLww(lww, { ...lww, tombstones });
  return writeCrdtLwwToJson(raw, merged.merged);
}
