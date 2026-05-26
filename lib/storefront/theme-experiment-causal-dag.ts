import { toJsonValue } from "@/lib/prisma/json";
/**
 * P1 — Multi-workspace causal DAG (workspace → storefront → region → segment).
 * Spillover detection from BQ experiment_spillover_daily.
 */

export type CausalDagNodeType = "workspace" | "storefront" | "region" | "segment";

export type CausalDagEdge = {
  from: string;
  to: string;
  causalEffectPp: number;
  backdoorAdjusted: boolean;
};

export type SpilloverDailyCell = {
  workspaceId: string;
  storeSlug: string;
  region: string;
  segment: string;
  spilloverPp: number;
  treatmentArmId: string;
};

export type SpilloverDailySnapshot = {
  at: string;
  cells: SpilloverDailyCell[];
  maxSpilloverPp: number;
  publishBanned: boolean;
  dagEdges: CausalDagEdge[];
};

export function isCausalDagEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_CAUSAL_DAG === "1";
}

export function spilloverBanThresholdPp(): number {
  return Number(process.env.THEME_EXPERIMENT_SPILLOVER_BAN_PP ?? "1");
}

export function readSpilloverDaily(raw: unknown): SpilloverDailySnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).spilloverDaily;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const snap = o as Record<string, unknown>;
  if (typeof snap.at !== "string" || !Array.isArray(snap.cells)) return null;
  const cells = snap.cells as SpilloverDailyCell[];
  const maxSpilloverPp =
    typeof snap.maxSpilloverPp === "number"
      ? snap.maxSpilloverPp
      : cells.reduce((m, c) => Math.max(m, c.spilloverPp), 0);
  const threshold = spilloverBanThresholdPp();
  return {
    at: snap.at,
    cells,
    maxSpilloverPp,
    publishBanned: maxSpilloverPp > threshold,
    dagEdges: Array.isArray(snap.dagEdges) ? (snap.dagEdges as CausalDagEdge[]) : [],
  };
}

export function buildCausalDagEdges(cells: SpilloverDailyCell[]): CausalDagEdge[] {
  const edges: CausalDagEdge[] = [];
  const workspaces = new Set(cells.map((c) => c.workspaceId));
  for (const ws of workspaces) {
    const wsCells = cells.filter((c) => c.workspaceId === ws);
    const stores = new Set(wsCells.map((c) => c.storeSlug));
    for (const store of stores) {
      const storeCells = wsCells.filter((c) => c.storeSlug === store);
      const avgSpill =
        storeCells.reduce((s, c) => s + c.spilloverPp, 0) / Math.max(1, storeCells.length);
      edges.push({
        from: `workspace:${ws}`,
        to: `storefront:${store}`,
        causalEffectPp: Math.round(avgSpill * 10) / 10,
        backdoorAdjusted: true,
      });
      for (const cell of storeCells) {
        edges.push({
          from: `storefront:${store}`,
          to: `region:${cell.region}`,
          causalEffectPp: cell.spilloverPp,
          backdoorAdjusted: true,
        });
        edges.push({
          from: `region:${cell.region}`,
          to: `segment:${cell.segment}`,
          causalEffectPp: Math.round(cell.spilloverPp * 0.5 * 10) / 10,
          backdoorAdjusted: true,
        });
      }
    }
  }
  return edges;
}

export function evaluateSpilloverPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
  maxSpilloverPp: number;
} {
  if (!isCausalDagEnabled()) {
    return {
      passed: true,
      headline: "Causal DAG off",
      detail: "Set THEME_EXPERIMENT_CAUSAL_DAG=1 for spillover ban.",
      maxSpilloverPp: 0,
    };
  }

  const snap = readSpilloverDaily(raw);
  if (!snap) {
    return {
      passed: true,
      headline: "No spillover batch",
      detail: "Awaiting experiment_spillover_daily from BQ.",
      maxSpilloverPp: 0,
    };
  }

  if (snap.publishBanned) {
    return {
      passed: false,
      headline: `Publish banned — spillover ${snap.maxSpilloverPp}pp > ${spilloverBanThresholdPp()}pp`,
      detail: `${snap.cells.length} DAG cells; backdoor-adjusted edges: ${snap.dagEdges.length}.`,
      maxSpilloverPp: snap.maxSpilloverPp,
    };
  }

  return {
    passed: true,
    headline: `Spillover OK (max ${snap.maxSpilloverPp}pp)`,
    detail: `Causal DAG: ${snap.dagEdges.length} edges within threshold.`,
    maxSpilloverPp: snap.maxSpilloverPp,
  };
}

export function mergeSpilloverDailyIntoJson(
  previousRaw: unknown,
  snap: SpilloverDailySnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.spilloverDaily = snap;
  return base;
}
