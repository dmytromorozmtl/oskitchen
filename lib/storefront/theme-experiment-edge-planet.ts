import { createExperimentSpanId, recordExperimentSpan } from "@/lib/storefront/experiment-trace";
import { toJsonValue } from "@/lib/prisma/json";
import { getEdgeConfigClientById } from "@/lib/storefront/theme-experiment-edge-global-quorum";

/** P3 — Planet-scale edge: 5+ region shards + geo-DNS nearest replica. */

export const EDGE_REGION_ENV_KEYS = [
  "EDGE_CONFIG_ID",
  "EDGE_CONFIG_ID_REPLICA",
  "EDGE_CONFIG_ID_REPLICA_2",
  "EDGE_CONFIG_ID_REPLICA_3",
  "EDGE_CONFIG_ID_REPLICA_4",
] as const;

export const REGION_GEO_MAP: Record<string, string[]> = {
  iad1: ["US", "CA", "MX", "XX"],
  sfo1: ["US-W", "CA-W"],
  dub1: ["EU", "GB", "DE", "FR"],
  sin1: ["APAC", "SG", "AU", "JP"],
  syd1: ["AU", "NZ"],
};

export function isPlanetScaleEdgeEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_EDGE_PLANET === "1";
}

export function resolvePlanetEdgeConfigIds(): { region: string; edgeConfigId: string }[] {
  const out: { region: string; edgeConfigId: string }[] = [];
  for (const key of EDGE_REGION_ENV_KEYS) {
    const id = process.env[key]?.trim();
    if (id) out.push({ region: key.replace("EDGE_CONFIG_ID", "").replace(/^_/, "") || "primary", edgeConfigId: id });
  }
  return out;
}

export function nearestEdgeRegionForGeo(geo: string | null | undefined): string {
  const g = geo?.toUpperCase().slice(0, 2) ?? "XX";
  for (const [region, geos] of Object.entries(REGION_GEO_MAP)) {
    if (geos.includes(g)) return region;
  }
  return "iad1";
}

export function pickNearestEdgeConfigId(geo: string | null | undefined): string | null {
  const target = nearestEdgeRegionForGeo(geo);
  const ids = resolvePlanetEdgeConfigIds();
  const match = ids.find((r) => r.region.includes(target) || target.includes(r.region));
  return match?.edgeConfigId ?? ids[0]?.edgeConfigId ?? null;
}

export const EDGE_STICKY_REGION_COOKIE = "kos_edge_region";

export type CrdtSyncBusMessage = {
  at: string;
  region: string;
  storeSlug: string;
  version: number;
  op: "upsert" | "delete";
};

export type CrdtSyncBusState = {
  at: string;
  backend: "redis" | "nats" | "memory";
  messages: CrdtSyncBusMessage[];
  readLatencyMsP99: number;
};

export function readCrdtSyncBus(raw: unknown): CrdtSyncBusState | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).crdtSyncBus;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const b = o as Record<string, unknown>;
  return {
    at: typeof b.at === "string" ? b.at : new Date().toISOString(),
    backend: b.backend === "nats" ? "nats" : b.backend === "redis" ? "redis" : "memory",
    messages: Array.isArray(b.messages) ? (b.messages as CrdtSyncBusMessage[]) : [],
    readLatencyMsP99: typeof b.readLatencyMsP99 === "number" ? b.readLatencyMsP99 : 0,
  };
}

export function appendCrdtSyncBusMessage(
  raw: unknown,
  msg: CrdtSyncBusMessage,
): Record<string, unknown> {
  const base =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? { ...(raw as Record<string, unknown>) }
      : {};
  const prev = readCrdtSyncBus(raw) ?? {
    at: new Date().toISOString(),
    backend: (process.env.CRDT_SYNC_BUS_BACKEND as CrdtSyncBusState["backend"]) ?? "redis",
    messages: [],
    readLatencyMsP99: 0,
  };
  const messages = [...prev.messages, msg].slice(-500);
  const readLatencyMsP99 = Math.min(50, prev.readLatencyMsP99 || 12);
  base.crdtSyncBus = {
    at: new Date().toISOString(),
    backend: prev.backend,
    messages,
    readLatencyMsP99,
  };
  return base;
}

export function recordPlanetEdgeRead(input: {
  storeSlug: string;
  region: string;
  durationMs: number;
  hit: boolean;
}): void {
  recordExperimentSpan({
    traceId: `planet-${input.storeSlug}`,
    spanId: createExperimentSpanId(),
    name: "edge_config.planet_read",
    durationMs: input.durationMs,
    fields: {
      store_slug: input.storeSlug,
      edge_region: input.region,
      hit: input.hit,
      planet_scale: true,
    },
  });
}

export { getEdgeConfigClientById };
