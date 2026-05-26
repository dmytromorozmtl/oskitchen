/**
 * T5 — Closed-loop causal discovery agent: DAG propose → interference update → holdout WS push.
 * Human approval gate mirrors S5 autonomous scientist for high spillover.
 */

import { toJsonValue } from "@/lib/prisma/json";
import {
  buildCausalDagEdges,
  mergeSpilloverDailyIntoJson,
  readSpilloverDaily,
  spilloverBanThresholdPp,
  type SpilloverDailyCell,
  type SpilloverDailySnapshot,
} from "@/lib/storefront/theme-experiment-causal-dag";
import {
  buildInterferenceMatrixSnapshot,
  cellsFromSpilloverAndMatrix,
  mergeInterferenceIntoJson,
  readInterferenceMatrix,
} from "@/lib/storefront/theme-experiment-interference-matrix";
import {
  applyHoldoutWsPush,
  mergeHoldoutWsIntoJson,
} from "@/lib/storefront/theme-experiment-holdout-ws";
import { readPostWinnerHoldoutPercent } from "@/lib/storefront/theme-experiment-holdout";

export type CausalDiscoveryStep = {
  at: string;
  step: "dag_proposed" | "interference_updated" | "holdout_pushed" | "awaiting_approval";
  detail: string;
};

export type CausalDiscoveryAgentSnapshot = {
  at: string;
  steps: CausalDiscoveryStep[];
  pendingApproval: boolean;
  lastCycleAt: string | null;
  proposedEdges: number;
  holdoutPercentAfter: number;
};

export function isCausalDiscoveryAgentEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_CAUSAL_DISCOVERY_AGENT === "1";
}

export function discoveryApprovalSpilloverPp(): number {
  return Number(process.env.THEME_EXPERIMENT_DISCOVERY_APPROVAL_PP ?? "1.5");
}

export function readCausalDiscoveryAgent(raw: unknown): CausalDiscoveryAgentSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).causalDiscoveryAgent;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    steps: Array.isArray(s.steps) ? (s.steps as CausalDiscoveryStep[]) : [],
    pendingApproval: s.pendingApproval === true,
    lastCycleAt: typeof s.lastCycleAt === "string" ? s.lastCycleAt : null,
    proposedEdges: typeof s.proposedEdges === "number" ? s.proposedEdges : 0,
    holdoutPercentAfter: typeof s.holdoutPercentAfter === "number" ? s.holdoutPercentAfter : 0,
  };
}

export function mergeCausalDiscoveryAgent(
  previousRaw: unknown,
  snap: CausalDiscoveryAgentSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.causalDiscoveryAgent = snap;
  return base;
}

export function appendDiscoveryStep(
  snap: CausalDiscoveryAgentSnapshot,
  step: CausalDiscoveryStep["step"],
  detail: string,
): CausalDiscoveryAgentSnapshot {
  return {
    ...snap,
    at: new Date().toISOString(),
    steps: [...snap.steps, { at: new Date().toISOString(), step, detail }].slice(-30),
  };
}

/** Full closed loop from BQ outcome cells. */
export function runCausalDiscoveryClosedLoop(
  previousRaw: unknown,
  outcomeCells: SpilloverDailyCell[],
): { json: Record<string, unknown>; snap: CausalDiscoveryAgentSnapshot } {
  const prevAgent = readCausalDiscoveryAgent(previousRaw) ?? {
    at: new Date().toISOString(),
    steps: [],
    pendingApproval: false,
    lastCycleAt: null,
    proposedEdges: 0,
    holdoutPercentAfter: readPostWinnerHoldoutPercent(previousRaw) ?? 5,
  };

  let agent = prevAgent;
  const maxSpill = outcomeCells.reduce((m, c) => Math.max(m, c.spilloverPp), 0);
  const needsApproval = maxSpill >= discoveryApprovalSpilloverPp();

  const dagEdges = buildCausalDagEdges(outcomeCells);
  const spillSnap: SpilloverDailySnapshot = {
    at: new Date().toISOString(),
    cells: outcomeCells,
    maxSpilloverPp: maxSpill,
    publishBanned: maxSpill > spilloverBanThresholdPp(),
    dagEdges,
  };

  let json = mergeSpilloverDailyIntoJson(previousRaw, spillSnap);
  agent = appendDiscoveryStep(agent, "dag_proposed", `${dagEdges.length} edges · max spill ${maxSpill}pp`);
  agent = { ...agent, proposedEdges: dagEdges.length };

  const matrixCells = cellsFromSpilloverAndMatrix({
    spilloverCells: outcomeCells,
    matrixCells: readInterferenceMatrix(previousRaw)?.cells ?? [],
  });
  const matrixSnap = buildInterferenceMatrixSnapshot(matrixCells);
  json = mergeInterferenceIntoJson(json, matrixSnap);
  agent = appendDiscoveryStep(
    agent,
    "interference_updated",
    `heatmap ${matrixSnap.heatmapIntensity} · bump +${matrixSnap.recommendedHoldoutBumpPercent}%`,
  );

  let holdout = readPostWinnerHoldoutPercent(json) ?? 5;
  if (!needsApproval) {
    holdout = Math.min(20, holdout + matrixSnap.recommendedHoldoutBumpPercent);
    const plane = applyHoldoutWsPush({ previousRaw: json, holdoutPercent: holdout });
    json = mergeHoldoutWsIntoJson(json, plane);
    agent = appendDiscoveryStep(agent, "holdout_pushed", `holdout ${holdout}% · WS v${plane.policyVersion}`);
    agent = {
      ...agent,
      pendingApproval: false,
      holdoutPercentAfter: holdout,
      lastCycleAt: new Date().toISOString(),
    };
  } else {
    agent = appendDiscoveryStep(agent, "awaiting_approval", `spillover ${maxSpill}pp needs human gate`);
    agent = { ...agent, pendingApproval: true, lastCycleAt: new Date().toISOString() };
  }

  json = mergeCausalDiscoveryAgent(json, agent);
  return { json, snap: agent };
}

export function approveCausalDiscoveryCycle(raw: unknown): Record<string, unknown> {
  const agent = readCausalDiscoveryAgent(raw);
  if (!agent?.pendingApproval) {
    return raw && typeof raw === "object" && !Array.isArray(raw)
      ? { ...(raw as Record<string, unknown>) }
      : {};
  }
  const matrix = readInterferenceMatrix(raw);
  let holdout = readPostWinnerHoldoutPercent(raw) ?? 5;
  holdout = Math.min(20, holdout + (matrix?.recommendedHoldoutBumpPercent ?? 2));
  const plane = applyHoldoutWsPush({ previousRaw: raw, holdoutPercent: holdout });
  let json = mergeHoldoutWsIntoJson(raw, plane);
  const next = appendDiscoveryStep(
    { ...agent, pendingApproval: false, holdoutPercentAfter: holdout },
    "holdout_pushed",
    `approved · holdout ${holdout}%`,
  );
  json = mergeCausalDiscoveryAgent(json, next);
  return json;
}

export function evaluateCausalDiscoveryAgentGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isCausalDiscoveryAgentEnabled()) {
    return { passed: true, headline: "Causal discovery agent off", detail: "" };
  }
  const agent = readCausalDiscoveryAgent(raw);
  if (!agent) {
    return { passed: true, headline: "No discovery cycles yet", detail: "" };
  }
  if (agent.pendingApproval) {
    return {
      passed: false,
      headline: "Causal discovery awaiting human approval",
      detail: `Spillover exceeded ${discoveryApprovalSpilloverPp()}pp — approve holdout push.`,
    };
  }
  return {
    passed: true,
    headline: `Discovery agent OK (${agent.steps.length} steps)`,
    detail: `Last cycle ${agent.lastCycleAt ?? "n/a"} · ${agent.proposedEdges} DAG edges.`,
  };
}
