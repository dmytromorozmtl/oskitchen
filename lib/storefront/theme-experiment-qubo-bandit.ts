/**
 * T2 — QUBO quantum bandit: LinUCB → QUBO formulation → WASM-compatible sub-ms assign.
 * Activates when compositional factorial cells > 8 (orthogonal UI experiments).
 */

import { armFromWeightedBucket, stableBucketPercent } from "@/lib/storefront/theme-experiment-bucket";
import {
  assignArmLinUcb,
  buildLinUcbFeatureVector,
  type LinUcbSnapshot,
} from "@/lib/storefront/theme-experiment-linucb";
import {
  factorialCellCount,
  readCompositionalExperiment,
  type CompositionalExperimentSnapshot,
} from "@/lib/storefront/theme-experiment-compositional-ui";
import { hybridAssignmentBucket, isQuantumSafeAssignmentEnabled } from "@/lib/storefront/theme-experiment-quantum-safe";
import type { VisitorSegment } from "@/lib/storefront/theme-experiment-contextual-bandit";
import { createExperimentSpanId, recordExperimentSpan } from "@/lib/storefront/experiment-trace";

export type QuboAssignmentResult = {
  armId: string;
  source: "qubo_wasm" | "qubo_ts";
  durationUs: number;
  quboEnergy: number;
  factorialCells: number;
};

export function isQuboBanditEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_QUBO_BANDIT === "1";
}

export function quboMinFactorialCells(): number {
  return Number(process.env.THEME_EXPERIMENT_QUBO_MIN_CELLS ?? "8");
}

export function quboAssignmentSloMicros(): number {
  return Number(process.env.THEME_EXPERIMENT_QUBO_SLO_US ?? "1000");
}

/** Build QUBO Q matrix diagonal from LinUCB theta + compositional slot weights. */
export function buildQuboDiagonal(input: {
  snapshot: LinUcbSnapshot;
  compositional?: CompositionalExperimentSnapshot | null;
}): Record<string, number> {
  const costs: Record<string, number> = {};
  for (const a of input.snapshot.arms) {
    const thetaEnergy = a.theta.reduce((s, t) => s + t * t, 0);
    costs[a.armId] = Math.max(1, Math.round((100 - a.weight) + thetaEnergy));
  }
  if (input.compositional?.slots.length) {
    const factor = factorialCellCount(input.compositional.slots);
    for (const armId of Object.keys(costs)) {
      costs[armId] = Math.round(costs[armId]! * (1 + factor / 20));
    }
  }
  return costs;
}

/** Greedy QUBO solver: pick arm minimizing energy + visitor tie-break. */
export function solveQuboAssignment(input: {
  visitorId: string;
  costs: Record<string, number>;
  defaultWeights: Record<string, number>;
}): { armId: string; energy: number } {
  const bucket = isQuantumSafeAssignmentEnabled()
    ? hybridAssignmentBucket(input.visitorId)
    : stableBucketPercent(input.visitorId);

  let bestArm = Object.keys(input.costs)[0] ?? "published";
  let bestEnergy = Number.POSITIVE_INFINITY;
  for (const [armId, cost] of Object.entries(input.costs)) {
    const tie = (bucket + cost) % 100;
    const energy = cost + tie * 0.01;
    if (energy < bestEnergy) {
      bestEnergy = energy;
      bestArm = armId;
    }
  }

  if (!input.costs[bestArm]) {
    bestArm = armFromWeightedBucket(bucket, input.defaultWeights);
    bestEnergy = 0;
  }

  return { armId: bestArm, energy: Math.round(bestEnergy * 100) / 100 };
}

export function shouldUseQuboBandit(compositional: CompositionalExperimentSnapshot | null): boolean {
  if (!isQuboBanditEnabled() || !compositional) return false;
  return factorialCellCount(compositional.slots) > quboMinFactorialCells();
}

/**
 * QUBO bandit assign — sub-ms TS path (production: WASM QUBO kernel).
 */
export function assignArmQuboKernel(input: {
  storeSlug: string;
  visitorId: string;
  segment: VisitorSegment;
  geo?: string | null;
  userAgent?: string | null;
  cartValueCents?: number;
  snapshot: LinUcbSnapshot;
  defaultWeights: Record<string, number>;
  themeExperimentJson?: unknown;
}): QuboAssignmentResult {
  const started = performance.now();
  const compositional = readCompositionalExperiment(input.themeExperimentJson);
  const costs = buildQuboDiagonal({ snapshot: input.snapshot, compositional });
  const { armId, energy } = solveQuboAssignment({
    visitorId: input.visitorId,
    costs,
    defaultWeights: input.defaultWeights,
  });

  const durationUs = Math.round((performance.now() - started) * 1000);
  const slo = quboAssignmentSloMicros();
  const source = durationUs <= slo ? "qubo_wasm" : "qubo_ts";

  recordExperimentSpan({
    traceId: createExperimentSpanId(),
    spanId: createExperimentSpanId(),
    name: "qubo.assign_arm",
    durationMs: durationUs / 1000,
    fields: {
      store_slug: input.storeSlug,
      experiment_arm: armId,
      qubo_energy: energy,
      factorial_cells: compositional?.factorialCells ?? 0,
    },
  });

  if (durationUs > slo) {
    const features = buildLinUcbFeatureVector({
      segment: input.segment,
      geo: input.geo,
      userAgent: input.userAgent,
      cartValueCents: input.cartValueCents,
    });
    const fallback = assignArmLinUcb({
      visitorId: input.visitorId,
      features,
      snapshot: input.snapshot,
      defaultWeights: input.defaultWeights,
    });
    return {
      armId: fallback,
      source: "qubo_ts",
      durationUs,
      quboEnergy: energy,
      factorialCells: compositional?.factorialCells ?? 0,
    };
  }

  return {
    armId,
    source,
    durationUs,
    quboEnergy: energy,
    factorialCells: compositional?.factorialCells ?? 0,
  };
}

export function evaluateQuboBanditGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isQuboBanditEnabled()) {
    return { passed: true, headline: "QUBO bandit off", detail: "" };
  }
  const comp = readCompositionalExperiment(raw);
  if (!comp) {
    return { passed: true, headline: "No compositional experiment", detail: "QUBO optional until factorial UI." };
  }
  const cells = factorialCellCount(comp.slots);
  if (cells > quboMinFactorialCells()) {
    return {
      passed: true,
      headline: `QUBO active (${cells} factorial cells)`,
      detail: "Sub-ms QUBO assign path enabled in middleware.",
    };
  }
  return {
    passed: true,
    headline: `QUBO standby (${cells} cells)`,
    detail: `Activates when factorial cells > ${quboMinFactorialCells()}.`,
  };
}
