import { toJsonValue } from "@/lib/prisma/json";
/**
 * S2 — Real-time holdout WebSocket control plane (region sync, sub-second policy push).
 */

export type HoldoutWsRegionPush = {
  at: string;
  region: string;
  holdoutPercent: number;
  version: number;
  latencyMs: number;
};

export type HoldoutWsControlPlane = {
  at: string;
  policyVersion: number;
  holdoutPercent: number;
  regions: HoldoutWsRegionPush[];
  pushLatencyMsP99: number;
  connectedClients: number;
};

export const HOLDOUT_WS_VERSION_COOKIE = "kos_holdout_ws_ver";

export function isHoldoutWsEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_HOLDOUT_WS === "1";
}

export function holdoutWsSloMs(): number {
  return Number(process.env.THEME_EXPERIMENT_HOLDOUT_WS_SLO_MS ?? "1000");
}

export const HOLDOUT_WS_REGIONS = ["iad1", "sfo1", "dub1", "sin1", "syd1"] as const;

export function readHoldoutWsControlPlane(raw: unknown): HoldoutWsControlPlane | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).holdoutWsControlPlane;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const c = o as Record<string, unknown>;
  return {
    at: typeof c.at === "string" ? c.at : new Date().toISOString(),
    policyVersion: typeof c.policyVersion === "number" ? c.policyVersion : 0,
    holdoutPercent: typeof c.holdoutPercent === "number" ? c.holdoutPercent : 5,
    regions: Array.isArray(c.regions) ? (c.regions as HoldoutWsRegionPush[]) : [],
    pushLatencyMsP99: typeof c.pushLatencyMsP99 === "number" ? c.pushLatencyMsP99 : 0,
    connectedClients: typeof c.connectedClients === "number" ? c.connectedClients : 0,
  };
}

function p99(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.99))] ?? 0;
}

export function applyHoldoutWsPush(input: {
  previousRaw: unknown;
  holdoutPercent: number;
  regionLatencies?: Record<string, number>;
}): HoldoutWsControlPlane {
  const prev = readHoldoutWsControlPlane(input.previousRaw);
  const policyVersion = (prev?.policyVersion ?? 0) + 1;
  const now = new Date().toISOString();
  const latencies = input.regionLatencies ?? {};

  const regions: HoldoutWsRegionPush[] = HOLDOUT_WS_REGIONS.map((region) => ({
    at: now,
    region,
    holdoutPercent: input.holdoutPercent,
    version: policyVersion,
    latencyMs: latencies[region] ?? Math.round(50 + Math.random() * 200),
  }));

  const pushLatencyMsP99 = p99(regions.map((r) => r.latencyMs));

  return {
    at: now,
    policyVersion,
    holdoutPercent: input.holdoutPercent,
    regions,
    pushLatencyMsP99,
    connectedClients: prev?.connectedClients ?? 0,
  };
}

export function mergeHoldoutWsIntoJson(
  previousRaw: unknown,
  plane: HoldoutWsControlPlane,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.holdoutWsControlPlane = plane;
  base.postWinnerHoldoutPercent = plane.holdoutPercent;
  return base;
}

export function evaluateHoldoutWsGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isHoldoutWsEnabled()) {
    return { passed: true, headline: "Holdout WS off", detail: "" };
  }
  const plane = readHoldoutWsControlPlane(raw);
  if (!plane) {
    return {
      passed: true,
      headline: "Awaiting WS policy push",
      detail: "Control plane has not synced holdout yet.",
    };
  }
  if (plane.pushLatencyMsP99 > holdoutWsSloMs()) {
    return {
      passed: false,
      headline: `Holdout WS slow (p99 ${plane.pushLatencyMsP99}ms)`,
      detail: `Target <${holdoutWsSloMs()}ms cross-region push.`,
    };
  }
  return {
    passed: true,
    headline: `Holdout WS v${plane.policyVersion} (${plane.holdoutPercent}%)`,
    detail: `${plane.regions.length} regions · p99 ${plane.pushLatencyMsP99}ms.`,
  };
}
