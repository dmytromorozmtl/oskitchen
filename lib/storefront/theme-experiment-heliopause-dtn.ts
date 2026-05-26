/**
 * Y5 — Heliopause DTN: deep-space relay, years-long bundle TTL, store-and-forward over X5/W5 mesh.
 */

import { createHash } from "node:crypto";
import {
  ingestCislunarBpv7Bundle,
  isCislunarDtnEnabled,
  readCislunarDtn,
} from "@/lib/storefront/theme-experiment-cislunar-dtn";
import { isDtnMeshEnabled, readDtnMesh } from "@/lib/storefront/theme-experiment-dtn-mesh";
import { readGlobalExperimentMesh } from "@/lib/storefront/theme-experiment-global-mesh";

export type HeliopauseNodeId = "earth" | "heliopause_relay" | "oort_edge_sim" | "interstellar_buffer";

export type HeliopauseBundle = {
  at: string;
  bundleId: string;
  protocolVersion: 7;
  sourceNode: HeliopauseNodeId;
  targetNode: HeliopauseNodeId;
  latencyMs: number;
  ttlMs: number;
  expiresAt: string;
  storeAndForwardHops: number;
  payloadHash: string;
  delivered: boolean;
  custodyTransferred: boolean;
};

export type HeliopauseDtnSnapshot = {
  at: string;
  bundles: HeliopauseBundle[];
  maxTtlMs: number;
  deliveryRate: number;
  pendingBundles: number;
  meshQuorumReached: boolean;
  storeAndForwardComplete: boolean;
};

export const HELIOPAUSE_NODES: HeliopauseNodeId[] = [
  "earth",
  "heliopause_relay",
  "oort_edge_sim",
  "interstellar_buffer",
];

export function isHeliopauseDtnEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HELIOPAUSE_DTN === "1";
}

/** Default TTL: 2 years in ms. */
export function heliopauseBundleTtlMs(): number {
  return Number(
    process.env.THEME_EXPERIMENT_HELIOPAUSE_TTL_MS ??
      String(2 * 365.25 * 24 * 3600 * 1000),
  );
}

export function heliopauseMaxLatencyMs(): number {
  return Number(process.env.THEME_EXPERIMENT_HELIOPAUSE_MAX_LATENCY_MS ?? "63072000000");
}

export function readHeliopauseDtn(raw: unknown): HeliopauseDtnSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).heliopauseDtnMesh;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    bundles: Array.isArray(s.bundles) ? (s.bundles as HeliopauseBundle[]) : [],
    maxTtlMs: typeof s.maxTtlMs === "number" ? s.maxTtlMs : 0,
    deliveryRate: typeof s.deliveryRate === "number" ? s.deliveryRate : 0,
    pendingBundles: typeof s.pendingBundles === "number" ? s.pendingBundles : 0,
    meshQuorumReached: s.meshQuorumReached === true,
    storeAndForwardComplete: s.storeAndForwardComplete === true,
  };
}

function mergeHeliopauseIntoJson(
  previousRaw: unknown,
  snap: HeliopauseDtnSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.heliopauseDtnMesh = snap;
  return base;
}

export function ingestHeliopauseBundle(
  previousRaw: unknown,
  bundle: {
    sourceNode: HeliopauseNodeId;
    targetNode: HeliopauseNodeId;
    latencyMs: number;
    storeAndForwardHops?: number;
    bundleId?: string;
    delivered?: boolean;
    cloud: "aws" | "gcp" | "azure";
    region: string;
    armId: string;
    conversions: number;
    checkouts: number;
    liftPp: number;
  },
): { json: Record<string, unknown>; snap: HeliopauseDtnSnapshot } {
  const prev = readHeliopauseDtn(previousRaw);
  const ttlMs = heliopauseBundleTtlMs();
  const now = Date.now();
  const expiresAt = new Date(now + ttlMs).toISOString();
  const delivered =
    bundle.delivered ??
    (bundle.latencyMs <= heliopauseMaxLatencyMs() && bundle.latencyMs <= ttlMs);

  const payloadHash = createHash("sha256")
    .update(`heliopause:${bundle.sourceNode}:${bundle.targetNode}:${bundle.armId}`)
    .digest("hex");

  const entry: HeliopauseBundle = {
    at: new Date().toISOString(),
    bundleId: bundle.bundleId ?? `helio-${Date.now()}`,
    protocolVersion: 7,
    sourceNode: bundle.sourceNode,
    targetNode: bundle.targetNode,
    latencyMs: bundle.latencyMs,
    ttlMs,
    expiresAt,
    storeAndForwardHops: bundle.storeAndForwardHops ?? 3,
    payloadHash,
    delivered,
    custodyTransferred: delivered,
  };

  const bundles = [...(prev?.bundles ?? []), entry].slice(-60);
  const active = bundles.filter((b) => new Date(b.expiresAt).getTime() > now);
  const deliveredBundles = active.filter((b) => b.delivered);
  const deliveryRate = active.length > 0 ? deliveredBundles.length / active.length : 0;
  const pendingBundles = active.filter((b) => !b.delivered).length;
  const maxTtlMs = active.reduce((m, b) => Math.max(m, b.ttlMs), 0);
  const storeAndForwardComplete = active.every(
    (b) => b.delivered || b.storeAndForwardHops >= 1,
  );

  let json =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};

  if (delivered && bundle.sourceNode !== "earth") {
    const merged = ingestCislunarBpv7Bundle(json, {
      sourceNode: "geo_relay",
      targetNode: "earth",
      latencyMs: Math.min(bundle.latencyMs, 120_000),
      cloud: bundle.cloud,
      region: bundle.region,
      armId: bundle.armId,
      conversions: bundle.conversions,
      checkouts: bundle.checkouts,
      liftPp: bundle.liftPp,
    });
    json = merged.json;
  }

  const mesh = readGlobalExperimentMesh(json);
  const snap: HeliopauseDtnSnapshot = {
    at: new Date().toISOString(),
    bundles: active,
    maxTtlMs,
    deliveryRate,
    pendingBundles,
    meshQuorumReached: mesh?.quorumReached ?? false,
    storeAndForwardComplete,
  };

  json = mergeHeliopauseIntoJson(json, snap);
  return { json, snap };
}

export function evaluateHeliopauseDtnPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isHeliopauseDtnEnabled()) {
    return { passed: true, headline: "Heliopause DTN off", detail: "" };
  }
  if (!isCislunarDtnEnabled()) {
    return {
      passed: false,
      headline: "Cislunar DTN required",
      detail: "Enable THEME_EXPERIMENT_CISLUNAR_DTN=1 (X5).",
    };
  }
  if (!isDtnMeshEnabled()) {
    return {
      passed: false,
      headline: "DTN mesh required",
      detail: "Enable THEME_EXPERIMENT_DTN_MESH=1 (W5).",
    };
  }
  const helio = readHeliopauseDtn(raw);
  const cis = readCislunarDtn(raw);
  const dtn = readDtnMesh(raw);
  const mesh = readGlobalExperimentMesh(raw);

  if (!helio || helio.bundles.length === 0) {
    return {
      passed: true,
      headline: "Awaiting heliopause bundles",
      detail: "Deep-space relay bundles not received yet.",
    };
  }
  if (helio.pendingBundles > 0) {
    return {
      passed: false,
      headline: `${helio.pendingBundles} heliopause bundles in store-and-forward`,
      detail: `TTL up to ${Math.round(helio.maxTtlMs / 86400000)} days`,
    };
  }
  if (!helio.storeAndForwardComplete) {
    return {
      passed: false,
      headline: "Store-and-forward incomplete",
      detail: "Custody transfer pending on deep-space path.",
    };
  }
  if (mesh && !mesh.quorumReached) {
    return {
      passed: false,
      headline: "Heliopause delivered but mesh quorum missing",
      detail: "Wait for federated quorum after deep-space merge.",
    };
  }
  if (cis && cis.pendingBundles > 0) {
    return {
      passed: false,
      headline: "Cislunar backlog blocks heliopause publish",
      detail: "Clear X5 cislunar pending bundles first.",
    };
  }
  if (dtn && dtn.pendingBundles > 0) {
    return {
      passed: false,
      headline: "W5 DTN backlog blocks heliopause publish",
      detail: "Clear legacy DTN pending bundles.",
    };
  }
  if (helio.deliveryRate < 0.85) {
    return {
      passed: false,
      headline: `Heliopause delivery ${Math.round(helio.deliveryRate * 100)}%`,
      detail: "Deep-space path unstable — hold publish.",
    };
  }
  return {
    passed: true,
    headline: `Heliopause DTN OK (${helio.bundles.length} bundles)`,
    detail: `Delivery ${Math.round(helio.deliveryRate * 100)}% · TTL ${Math.round(helio.maxTtlMs / 86400000)}d`,
  };
}
