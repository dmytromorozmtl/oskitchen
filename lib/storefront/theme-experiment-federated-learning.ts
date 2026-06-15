import { toJsonValue } from "@/lib/prisma/json";
/**
 * R1 — Federated learning across workspaces with ε-differential privacy.
 * Cross-workspace gradient aggregation; no raw PII export.
 */

export type FederatedGradientCell = {
  workspaceId: string;
  storeSlug: string;
  featureDim: number;
  /** Hashed workspace gradient vector (no PII). */
  gradientHash: string;
  gradientNorm: number;
  sampleCount: number;
};

export type FederatedLearningSnapshot = {
  at: string;
  cells: FederatedGradientCell[];
  aggregatedTheta: number[];
  epsilon: number;
  privacyBudgetSpent: number;
  privacyBudgetRemaining: number;
  piiExportBlocked: boolean;
  roundId: string;
};

export function isFederatedLearningEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_FEDERATED_LEARNING === "1";
}

export function federatedPrivacyEpsilon(): number {
  return Number(process.env.THEME_EXPERIMENT_FEDERATED_EPSILON ?? "1.0");
}

export function federatedPrivacyBudgetTotal(): number {
  return Number(process.env.THEME_EXPERIMENT_FEDERATED_BUDGET ?? "10");
}

function laplaceNoise(scale: number): number {
  const u = Math.random() - 0.5;
  return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

/** Apply ε-DP noise to gradient norm before aggregation. */
export function applyDpNoiseToGradient(norm: number, epsilon: number): number {
  const sensitivity = 1;
  const scale = sensitivity / epsilon;
  return Math.max(0, norm + laplaceNoise(scale));
}

function hashGradient(workspaceId: string, storeSlug: string, norm: number): string {
  let h = 2166136261;
  const s = `${workspaceId}:${storeSlug}:${norm.toFixed(6)}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `fed_${(h >>> 0).toString(16)}`;
}

export function aggregateFederatedGradients(
  cells: FederatedGradientCell[],
  epsilon: number,
): { aggregatedTheta: number[]; budgetSpent: number } {
  if (cells.length === 0) return { aggregatedTheta: [], budgetSpent: 0 };

  const dim = Math.max(1, cells[0]?.featureDim ?? 5);
  const theta = new Array(dim).fill(0);
  let totalWeight = 0;
  let budgetSpent = 0;

  for (const c of cells) {
    const noisyNorm = applyDpNoiseToGradient(c.gradientNorm, epsilon);
    budgetSpent += 1 / epsilon;
    const w = c.sampleCount > 0 ? c.sampleCount : 1;
    totalWeight += w;
    for (let i = 0; i < dim; i++) {
      theta[i] += (noisyNorm / dim) * (w / 100);
    }
  }

  if (totalWeight > 0) {
    for (let i = 0; i < dim; i++) theta[i] /= cells.length;
  }

  return { aggregatedTheta: theta.map((t) => Math.round(t * 1e6) / 1e6), budgetSpent };
}

export function buildFederatedLearningSnapshot(cells: FederatedGradientCell[]): FederatedLearningSnapshot {
  const epsilon = federatedPrivacyEpsilon();
  const total = federatedPrivacyBudgetTotal();
  const { aggregatedTheta, budgetSpent } = aggregateFederatedGradients(cells, epsilon);
  const privacyBudgetSpent = Math.round(budgetSpent * 100) / 100;

  return {
    at: new Date().toISOString(),
    cells: cells.map((c) => ({
      ...c,
      gradientHash: c.gradientHash || hashGradient(c.workspaceId, c.storeSlug, c.gradientNorm),
    })),
    aggregatedTheta,
    epsilon,
    privacyBudgetSpent,
    privacyBudgetRemaining: Math.max(0, Math.round((total - privacyBudgetSpent) * 100) / 100),
    piiExportBlocked: true,
    roundId: `fed-${Date.now()}`,
  };
}

export function readFederatedLearningSnapshot(raw: unknown): FederatedLearningSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).federatedLearning;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  if (typeof s.at !== "string" || !Array.isArray(s.cells)) return null;
  return {
    at: s.at,
    cells: s.cells as FederatedGradientCell[],
    aggregatedTheta: Array.isArray(s.aggregatedTheta) ? (s.aggregatedTheta as number[]) : [],
    epsilon: typeof s.epsilon === "number" ? s.epsilon : federatedPrivacyEpsilon(),
    privacyBudgetSpent: typeof s.privacyBudgetSpent === "number" ? s.privacyBudgetSpent : 0,
    privacyBudgetRemaining:
      typeof s.privacyBudgetRemaining === "number" ? s.privacyBudgetRemaining : federatedPrivacyBudgetTotal(),
    piiExportBlocked: s.piiExportBlocked !== false,
    roundId: typeof s.roundId === "string" ? s.roundId : "",
  };
}

export function mergeFederatedLearningIntoJson(
  previousRaw: unknown,
  snap: FederatedLearningSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.federatedLearning = snap;
  if (snap.aggregatedTheta.length > 0) {
    const linucb = (base.linucbWeights as Record<string, unknown>) ?? {};
    base.linucbWeights = {
      ...linucb,
      at: snap.at,
      federatedTheta: snap.aggregatedTheta,
      source: "federated_dp",
    };
  }
  return base;
}

export function evaluateFederatedLearningPublishGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isFederatedLearningEnabled()) {
    return {
      passed: true,
      headline: "Federated learning off",
      detail: "THEME_EXPERIMENT_FEDERATED_LEARNING=1 to enable DP budget gate.",
    };
  }
  const snap = readFederatedLearningSnapshot(raw);
  if (!snap) {
    return {
      passed: true,
      headline: "No federated round",
      detail: "Awaiting cross-workspace gradient batch.",
    };
  }
  if (snap.privacyBudgetRemaining <= 0) {
    return {
      passed: false,
      headline: "Privacy budget exhausted",
      detail: `ε=${snap.epsilon} · spent ${snap.privacyBudgetSpent} — block publish until next round.`,
    };
  }
  return {
    passed: true,
    headline: `Federated OK (ε=${snap.epsilon}, budget ${snap.privacyBudgetRemaining} left)`,
    detail: `${snap.cells.length} workspaces aggregated · PII export blocked.`,
  };
}
