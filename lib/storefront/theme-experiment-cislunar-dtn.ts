/**
 * X5 — Cislunar DTN production: GEO relay + Mars edge, BPv7 bundles over W5 DTN mesh.
 */

import { createHash } from "node:crypto";
import {
  ingestDtnBundle,
  isDtnMeshEnabled,
  readDtnMesh,
  type DtnNodeId,
} from "@/lib/storefront/theme-experiment-dtn-mesh";
import { isGlobalExperimentMeshEnabled, readGlobalExperimentMesh } from "@/lib/storefront/theme-experiment-global-mesh";

export type CislunarNodeId = DtnNodeId | "geo_relay" | "mars_edge_prod";

export const CISLUNAR_DTN_NODES: CislunarNodeId[] = [
  "earth",
  "leo",
  "geo_relay",
  "lunar_relay",
  "mars_edge_sim",
  "mars_edge_prod",
];

export type Bpv7Bundle = {
  at: string;
  bundleId: string;
  protocolVersion: 7;
  sourceNode: CislunarNodeId;
  targetNode: CislunarNodeId;
  latencyMs: number;
  custodianEid: string;
  payloadHash: string;
  delivered: boolean;
  productionSloMet: boolean;
};

export type CislunarDtnSnapshot = {
  at: string;
  bundles: Bpv7Bundle[];
  productionLatencyP99Ms: number;
  deliveryRate: number;
  bpv7Count: number;
  meshQuorumReached: boolean;
  pendingBundles: number;
};

export function isCislunarDtnEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_CISLUNAR_DTN === "1";
}

export function cislunarProductionLatencySloMs(): number {
  return Number(process.env.THEME_EXPERIMENT_CISLUNAR_LATENCY_SLO_MS ?? "180000");
}

export function readCislunarDtn(raw: unknown): CislunarDtnSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).cislunarDtnMesh;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    bundles: Array.isArray(s.bundles) ? (s.bundles as Bpv7Bundle[]) : [],
    productionLatencyP99Ms:
      typeof s.productionLatencyP99Ms === "number" ? s.productionLatencyP99Ms : 0,
    deliveryRate: typeof s.deliveryRate === "number" ? s.deliveryRate : 0,
    bpv7Count: typeof s.bpv7Count === "number" ? s.bpv7Count : 0,
    meshQuorumReached: s.meshQuorumReached === true,
    pendingBundles: typeof s.pendingBundles === "number" ? s.pendingBundles : 0,
  };
}

function mergeCislunarIntoJson(
  previousRaw: unknown,
  snap: CislunarDtnSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.cislunarDtnMesh = snap;
  return base;
}

function p99Latency(latencies: number[]): number {
  if (latencies.length === 0) return 0;
  const sorted = [...latencies].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.99) - 1);
  return sorted[idx] ?? 0;
}

export function ingestCislunarBpv7Bundle(
  previousRaw: unknown,
  bundle: {
    sourceNode: CislunarNodeId;
    targetNode: CislunarNodeId;
    latencyMs: number;
    cloud: "aws" | "gcp" | "azure";
    region: string;
    armId: string;
    conversions: number;
    checkouts: number;
    liftPp: number;
    bundleId?: string;
    delivered?: boolean;
  },
): { json: Record<string, unknown>; snap: CislunarDtnSnapshot } {
  const prev = readCislunarDtn(previousRaw);
  const slo = cislunarProductionLatencySloMs();
  const delivered = bundle.delivered ?? bundle.latencyMs <= slo;
  const productionSloMet = bundle.latencyMs <= slo;

  const payloadHash = createHash("sha256")
    .update(`bpv7:${bundle.sourceNode}:${bundle.targetNode}:${bundle.armId}:${bundle.liftPp}`)
    .digest("hex");

  const entry: Bpv7Bundle = {
    at: new Date().toISOString(),
    bundleId: bundle.bundleId ?? `bpv7-${Date.now()}`,
    protocolVersion: 7,
    sourceNode: bundle.sourceNode,
    targetNode: bundle.targetNode,
    latencyMs: bundle.latencyMs,
    custodianEid: createHash("sha256").update(`${bundle.sourceNode}:${bundle.region}`).digest("hex").slice(0, 16),
    payloadHash,
    delivered,
    productionSloMet,
  };

  const bundles = [...(prev?.bundles ?? []), entry].slice(-120);
  const deliveredBundles = bundles.filter((b) => b.delivered);
  const deliveryRate = bundles.length > 0 ? deliveredBundles.length / bundles.length : 0;
  const pendingBundles = bundles.filter((b) => !b.delivered).length;
  const productionLatencyP99Ms = p99Latency(
    bundles.filter((b) => b.productionSloMet).map((b) => b.latencyMs),
  );

  let json =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};

  const legacyNode = bundle.sourceNode as DtnNodeId;
  if (
    delivered &&
    (legacyNode === "leo" ||
      legacyNode === "lunar_relay" ||
      legacyNode === "mars_edge_sim" ||
      legacyNode === "earth")
  ) {
    const merged = ingestDtnBundle(json, {
      sourceNode: legacyNode === "earth" ? "leo" : legacyNode,
      targetNode: "earth",
      latencyMs: bundle.latencyMs,
      cloud: bundle.cloud,
      region: bundle.region,
      armId: bundle.armId,
      conversions: bundle.conversions,
      checkouts: bundle.checkouts,
      liftPp: bundle.liftPp,
      delivered: true,
    });
    json = merged.json;
  } else if (delivered && (bundle.sourceNode === "geo_relay" || bundle.sourceNode === "mars_edge_prod")) {
    const merged = ingestDtnBundle(json, {
      sourceNode: "lunar_relay",
      targetNode: "earth",
      latencyMs: bundle.latencyMs,
      cloud: bundle.cloud,
      region: bundle.region,
      armId: bundle.armId,
      conversions: bundle.conversions,
      checkouts: bundle.checkouts,
      liftPp: bundle.liftPp,
      delivered: true,
    });
    json = merged.json;
  }

  const mesh = readGlobalExperimentMesh(json);
  const snap: CislunarDtnSnapshot = {
    at: new Date().toISOString(),
    bundles,
    productionLatencyP99Ms,
    deliveryRate,
    bpv7Count: bundles.length,
    meshQuorumReached: mesh?.quorumReached ?? false,
    pendingBundles,
  };

  json = mergeCislunarIntoJson(json, snap);
  return { json, snap };
}

export function evaluateCislunarDtnPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isCislunarDtnEnabled()) {
    return { passed: true, headline: "Cislunar DTN off", detail: "" };
  }
  if (!isDtnMeshEnabled()) {
    return {
      passed: false,
      headline: "DTN mesh required for cislunar production",
      detail: "Enable THEME_EXPERIMENT_DTN_MESH=1 (W5).",
    };
  }
  if (!isGlobalExperimentMeshEnabled()) {
    return {
      passed: false,
      headline: "Global mesh required for cislunar DTN",
      detail: "Enable THEME_EXPERIMENT_GLOBAL_MESH=1 (V5).",
    };
  }
  const cis = readCislunarDtn(raw);
  const dtn = readDtnMesh(raw);
  const mesh = readGlobalExperimentMesh(raw);

  if (!cis || cis.bundles.length === 0) {
    return {
      passed: true,
      headline: "Awaiting cislunar BPv7 bundles",
      detail: "GEO relay / Mars edge production paths not synced.",
    };
  }
  if (cis.pendingBundles > 0) {
    return {
      passed: false,
      headline: `${cis.pendingBundles} cislunar bundles pending`,
      detail: `Production SLO ${cislunarProductionLatencySloMs()}ms · p99 ${cis.productionLatencyP99Ms}ms`,
    };
  }
  if (cis.deliveryRate < 0.92) {
    return {
      passed: false,
      headline: `Cislunar delivery ${Math.round(cis.deliveryRate * 100)}%`,
      detail: "BPv7 path below 92% production threshold.",
    };
  }
  if (mesh && !mesh.quorumReached) {
    return {
      passed: false,
      headline: "Cislunar delivered but mesh quorum missing",
      detail: "Wait for federated quorum after cislunar merge.",
    };
  }
  if (dtn && dtn.pendingBundles > 0) {
    return {
      passed: false,
      headline: "Legacy DTN pending bundles",
      detail: "Clear W5 DTN backlog before cislunar publish.",
    };
  }
  return {
    passed: true,
    headline: `Cislunar DTN OK (${cis.bpv7Count} BPv7)`,
    detail: `p99 ${cis.productionLatencyP99Ms}ms · delivery ${Math.round(cis.deliveryRate * 100)}%`,
  };
}
