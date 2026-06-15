/**
 * AJ1 — Jupiter trojan DTN Lagrange points over AI1 Martian orbital + AE heliopause.
 */

import { createHash } from "node:crypto";
import {
  isHeliopauseDtnEnabled,
  readHeliopauseDtn,
} from "@/lib/storefront/theme-experiment-heliopause-dtn";
import {
  isMartianOrbitalDtnRelayEnabled,
  readMartianOrbitalDtnRelay,
} from "@/lib/storefront/theme-experiment-martian-orbital-dtn-relay";

export type JupiterTrojanLagrangeId = "l4_trojan" | "l5_trojan" | "hektor_relay";

export type JupiterTrojanDtnBundle = {
  at: string;
  bundleId: string;
  lagrangeId: JupiterTrojanLagrangeId;
  latencyMs: number;
  lagrangeStability: number;
  martianToken: string | null;
  armId: string;
  delivered: boolean;
};

export type JupiterTrojanDtnLagrangeSnapshot = {
  at: string;
  bundles: JupiterTrojanDtnBundle[];
  lagrangeQuorum: number;
  quorumReached: boolean;
  martianOrbitalSynced: boolean;
  heliopauseReachable: boolean;
  maxTrojanLatencyMs: number;
  trojanSloMet: boolean;
};

export const JUPITER_TROJAN_LAGRANGES: JupiterTrojanLagrangeId[] = [
  "l4_trojan",
  "l5_trojan",
  "hektor_relay",
];

export function isJupiterTrojanDtnLagrangeEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_JUPITER_TROJAN_DTN_LAGRANGE === "1";
}

export function jupiterTrojanLatencySloMs(): number {
  return Number(process.env.THEME_EXPERIMENT_JUPITER_TROJAN_SLO_MS ?? "4800");
}

export function jupiterTrojanQuorumFraction(): number {
  return Number(process.env.THEME_EXPERIMENT_JUPITER_TROJAN_QUORUM ?? "0.67");
}

export function readJupiterTrojanDtnLagrange(raw: unknown): JupiterTrojanDtnLagrangeSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).jupiterTrojanDtnLagrange;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    bundles: Array.isArray(s.bundles) ? (s.bundles as JupiterTrojanDtnBundle[]) : [],
    lagrangeQuorum: typeof s.lagrangeQuorum === "number" ? s.lagrangeQuorum : 0,
    quorumReached: s.quorumReached === true,
    martianOrbitalSynced: s.martianOrbitalSynced === true,
    heliopauseReachable: s.heliopauseReachable === true,
    maxTrojanLatencyMs: typeof s.maxTrojanLatencyMs === "number" ? s.maxTrojanLatencyMs : 0,
    trojanSloMet: s.trojanSloMet === true,
  };
}

function mergeJupiterTrojanIntoJson(
  previousRaw: unknown,
  snap: JupiterTrojanDtnLagrangeSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.jupiterTrojanDtnLagrange = snap;
  return base;
}

export function ingestJupiterTrojanBundles(
  previousRaw: unknown,
  cells: Omit<JupiterTrojanDtnBundle, "at" | "bundleId" | "martianToken">[],
): { json: Record<string, unknown>; snap: JupiterTrojanDtnLagrangeSnapshot } {
  const mars = readMartianOrbitalDtnRelay(previousRaw);
  const token = mars
    ? createHash("sha256")
        .update(`${mars.nodeQuorum}:${mars.maxOrbitalLatencyMs}`)
        .digest("hex")
        .slice(0, 16)
    : null;

  const bundles: JupiterTrojanDtnBundle[] = cells.map((c, i) => ({
    ...c,
    at: new Date().toISOString(),
    bundleId: `jupiter-${c.lagrangeId}-${Date.now()}-${i}`,
    martianToken: token,
  }));

  const prev = readJupiterTrojanDtnLagrange(previousRaw);
  const all = [...(prev?.bundles ?? []), ...bundles].slice(-48);
  const lagrangeSet = new Set(all.map((b) => b.lagrangeId));
  const quorumRequired = Math.max(
    2,
    Math.ceil(JUPITER_TROJAN_LAGRANGES.length * jupiterTrojanQuorumFraction()),
  );
  const quorumReached = lagrangeSet.size >= quorumRequired;

  const slo = jupiterTrojanLatencySloMs();
  const maxTrojanLatencyMs = all.length > 0 ? Math.max(...all.map((b) => b.latencyMs)) : 0;
  const helio = readHeliopauseDtn(previousRaw);

  const snap: JupiterTrojanDtnLagrangeSnapshot = {
    at: new Date().toISOString(),
    bundles: all,
    lagrangeQuorum: lagrangeSet.size,
    quorumReached,
    martianOrbitalSynced: mars?.quorumReached ?? false,
    heliopauseReachable: helio?.meshQuorumReached ?? false,
    maxTrojanLatencyMs,
    trojanSloMet: maxTrojanLatencyMs <= slo,
  };

  return { json: mergeJupiterTrojanIntoJson(previousRaw, snap), snap };
}

export function syncJupiterTrojanFromLagrangePoints(
  previousRaw: unknown,
): { json: Record<string, unknown>; snap: JupiterTrojanDtnLagrangeSnapshot } {
  const cells = JUPITER_TROJAN_LAGRANGES.map((lagrangeId, i) => ({
    lagrangeId,
    latencyMs: 1800 + i * 350,
    lagrangeStability: 0.92 - i * 0.03,
    armId: "draft",
    delivered: i < 2,
  }));
  return ingestJupiterTrojanBundles(previousRaw, cells);
}

export function evaluateJupiterTrojanDtnLagrangeGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isJupiterTrojanDtnLagrangeEnabled()) {
    return { passed: true, headline: "Jupiter trojan DTN Lagrange off", detail: "" };
  }
  if (!isMartianOrbitalDtnRelayEnabled()) {
    return {
      passed: false,
      headline: "Martian orbital DTN relay required",
      detail: "Enable THEME_EXPERIMENT_MARTIAN_ORBITAL_DTN_RELAY=1 (AI1).",
    };
  }
  if (!isHeliopauseDtnEnabled()) {
    return {
      passed: false,
      headline: "Heliopause DTN required",
      detail: "Enable THEME_EXPERIMENT_HELIOPAUSE_DTN=1 (AE heliopause).",
    };
  }
  const snap = readJupiterTrojanDtnLagrange(raw);
  if (!snap?.quorumReached) {
    return {
      passed: false,
      headline: "Jupiter trojan Lagrange quorum missing",
      detail: `Need ${Math.ceil(JUPITER_TROJAN_LAGRANGES.length * jupiterTrojanQuorumFraction())} Lagrange points.`,
    };
  }
  if (!snap.martianOrbitalSynced) {
    return {
      passed: false,
      headline: "Martian orbital mesh not synced",
      detail: "Run Martian orbital DTN sync before Jupiter trojan Lagrange.",
    };
  }
  if (!snap.trojanSloMet) {
    return {
      passed: false,
      headline: "Jupiter trojan latency SLO breached",
      detail: `Max ${snap.maxTrojanLatencyMs}ms > SLO ${jupiterTrojanLatencySloMs()}ms.`,
    };
  }
  return {
    passed: true,
    headline: "Jupiter trojan DTN Lagrange aligned",
    detail: `${snap.lagrangeQuorum} points · heliopause ${snap.heliopauseReachable ? "reachable" : "pending"}`,
  };
}
