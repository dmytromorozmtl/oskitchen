/**
 * W5 — DTN interplanetary mesh: delay-tolerant bundles over V5 global experiment mesh (LEO / lunar / extreme edge).
 */

import { createHash } from "node:crypto";
import {
  ingestGlobalMeshOutcomes,
  readGlobalExperimentMesh,
  type GlobalMeshCloud,
} from "@/lib/storefront/theme-experiment-global-mesh";

export type DtnNodeId = "earth" | "leo" | "lunar_relay" | "mars_edge_sim";

export type DtnBundle = {
  at: string;
  bundleId: string;
  sourceNode: DtnNodeId;
  targetNode: DtnNodeId;
  latencyMs: number;
  payloadHash: string;
  delivered: boolean;
  cloud: GlobalMeshCloud;
  region: string;
  armId: string;
  conversions: number;
  checkouts: number;
  liftPp: number;
};

export type DtnMeshSnapshot = {
  at: string;
  bundles: DtnBundle[];
  maxLatencyMs: number;
  deliveryRate: number;
  meshQuorumReached: boolean;
  pendingBundles: number;
};

export const DTN_NODES: DtnNodeId[] = ["earth", "leo", "lunar_relay", "mars_edge_sim"];

export function isDtnMeshEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_DTN_MESH === "1";
}

export function dtnMaxLatencyMs(): number {
  return Number(process.env.THEME_EXPERIMENT_DTN_MAX_LATENCY_MS ?? "120000");
}

export function readDtnMesh(raw: unknown): DtnMeshSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).dtnExperimentMesh;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    bundles: Array.isArray(s.bundles) ? (s.bundles as DtnBundle[]) : [],
    maxLatencyMs: typeof s.maxLatencyMs === "number" ? s.maxLatencyMs : 0,
    deliveryRate: typeof s.deliveryRate === "number" ? s.deliveryRate : 0,
    meshQuorumReached: s.meshQuorumReached === true,
    pendingBundles: typeof s.pendingBundles === "number" ? s.pendingBundles : 0,
  };
}

export function mergeDtnMeshIntoJson(
  previousRaw: unknown,
  snap: DtnMeshSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.dtnExperimentMesh = snap;
  return base;
}

export function ingestDtnBundle(
  previousRaw: unknown,
  bundle: Omit<DtnBundle, "at" | "bundleId" | "payloadHash" | "delivered"> & {
    bundleId?: string;
    delivered?: boolean;
  },
): { json: Record<string, unknown>; snap: DtnMeshSnapshot } {
  const prev = readDtnMesh(previousRaw);
  const payloadHash = createHash("sha256")
    .update(
      `${bundle.sourceNode}:${bundle.targetNode}:${bundle.cloud}:${bundle.region}:${bundle.armId}:${bundle.liftPp}`,
    )
    .digest("hex");

  const latencyMs = bundle.latencyMs;
  const delivered = bundle.delivered ?? latencyMs <= dtnMaxLatencyMs();

  const entry: DtnBundle = {
    at: new Date().toISOString(),
    bundleId: bundle.bundleId ?? `dtn-${Date.now()}`,
    sourceNode: bundle.sourceNode,
    targetNode: bundle.targetNode,
    latencyMs,
    payloadHash,
    delivered,
    cloud: bundle.cloud,
    region: bundle.region,
    armId: bundle.armId,
    conversions: bundle.conversions,
    checkouts: bundle.checkouts,
    liftPp: bundle.liftPp,
  };

  const bundles = [...(prev?.bundles ?? []), entry].slice(-80);
  const deliveredBundles = bundles.filter((b) => b.delivered);
  const deliveryRate = bundles.length > 0 ? deliveredBundles.length / bundles.length : 0;
  const maxLatencyMs = bundles.reduce((m, b) => Math.max(m, b.latencyMs), 0);
  const pendingBundles = bundles.filter((b) => !b.delivered).length;

  let json =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};

  if (delivered) {
    const meshCells = deliveredBundles.map((b) => ({
      cloud: b.cloud,
      region: b.region,
      armId: b.armId,
      conversions: b.conversions,
      checkouts: b.checkouts,
      liftPp: b.liftPp,
    }));
    const merged = ingestGlobalMeshOutcomes(json, meshCells);
    json = merged.json;
  }

  const mesh = readGlobalExperimentMesh(json);
  const snap: DtnMeshSnapshot = {
    at: new Date().toISOString(),
    bundles,
    maxLatencyMs,
    deliveryRate,
    meshQuorumReached: mesh?.quorumReached ?? false,
    pendingBundles,
  };

  json = mergeDtnMeshIntoJson(json, snap);
  return { json, snap };
}

export function evaluateDtnMeshPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isDtnMeshEnabled()) {
    return { passed: true, headline: "DTN mesh off", detail: "" };
  }
  const dtn = readDtnMesh(raw);
  const mesh = readGlobalExperimentMesh(raw);

  if (!dtn || dtn.bundles.length === 0) {
    return {
      passed: true,
      headline: "Awaiting DTN bundles",
      detail: "LEO/lunar relay bundles not received yet.",
    };
  }
  if (dtn.pendingBundles > 0) {
    return {
      passed: false,
      headline: `${dtn.pendingBundles} DTN bundles pending`,
      detail: `Max latency ${dtn.maxLatencyMs}ms · threshold ${dtnMaxLatencyMs()}ms`,
    };
  }
  if (mesh && !mesh.quorumReached) {
    return {
      passed: false,
      headline: "DTN delivered but global mesh quorum missing",
      detail: "Wait for federated cross-cloud quorum after DTN merge.",
    };
  }
  if (dtn.deliveryRate < 0.9) {
    return {
      passed: false,
      headline: `DTN delivery rate ${Math.round(dtn.deliveryRate * 100)}%`,
      detail: "Interplanetary path unstable — hold publish.",
    };
  }
  return {
    passed: true,
    headline: `DTN mesh OK (${dtn.bundles.length} bundles)`,
    detail: `Delivery ${Math.round(dtn.deliveryRate * 100)}% · max ${dtn.maxLatencyMs}ms`,
  };
}
