import type { ExperimentArmDefinition } from "@/lib/storefront/theme-experiment-multi-arm";
export type MabArmState = {
  armId: string;
  alpha: number;
  beta: number;
  successes: number;
  trials: number;
};

export type MabBanditSnapshot = {
  arms: MabArmState[];
  explorationPercent: number;
  regretPp: number;
  updatedAt: string;
};

function seededUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

/** Sample from Beta(alpha, beta) via inverse CDF approximation (deterministic seed). */
function sampleBeta(alpha: number, beta: number, seed: string): number {
  const u = seededUnit(seed);
  const mean = alpha / (alpha + beta);
  const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1));
  const std = Math.sqrt(Math.max(variance, 1e-8));
  const z = mean + std * (u * 2 - 1) * 1.5;
  return Math.min(0.999, Math.max(0.001, z));
}

/** Thompson sampling — pick arm with highest sampled conversion rate. */
export function thompsonSelectArm(input: {
  arms: MabArmState[];
  visitorId: string;
}): string {
  if (input.arms.length === 0) return "published";
  let best = input.arms[0]!;
  let bestSample = -1;
  for (const arm of input.arms) {
    const sample = sampleBeta(
      Math.max(1, arm.alpha),
      Math.max(1, arm.beta),
      `${input.visitorId}:${arm.armId}`,
    );
    if (sample > bestSample) {
      bestSample = sample;
      best = arm;
    }
  }
  return best.armId;
}

/** Update Beta priors from arm metrics (successes = conversions, trials = checkouts). */
export function buildMabStateFromMetrics(
  arms: ExperimentArmDefinition[],
  metrics: { arm: string; conversions: number; checkouts: number }[],
): MabBanditSnapshot {
  const control = metrics.find((m) => m.arm === "published") ?? metrics[0];
  const controlRate =
    control && control.checkouts > 0 ? control.conversions / control.checkouts : 0;

  let bestRate = 0;
  let explorationTrials = 0;
  let totalTrials = 0;

  const mabArms: MabArmState[] = arms.map((def) => {
    const m = metrics.find((x) => x.arm === def.id) ?? { conversions: 0, checkouts: 0, arm: def.id };
    const successes = m.conversions;
    const trials = m.checkouts;
    totalTrials += trials;
    if (def.id !== "published") explorationTrials += trials;
    const rate = trials > 0 ? successes / trials : 0;
    if (rate > bestRate) bestRate = rate;
    return {
      armId: def.id,
      alpha: 1 + successes,
      beta: 1 + Math.max(0, trials - successes),
      successes,
      trials,
    };
  });

  const regretPp = Math.round((bestRate - controlRate) * 1000) / 10;
  const explorationPercent =
    totalTrials > 0 ? Math.round((explorationTrials / totalTrials) * 1000) / 10 : 0;

  return {
    arms: mabArms,
    explorationPercent,
    regretPp: Math.max(0, regretPp),
    updatedAt: new Date().toISOString(),
  };
}

export function readMabSnapshot(raw: unknown): MabBanditSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const snap = (raw as Record<string, unknown>).mabSnapshot;
  if (!snap || typeof snap !== "object" || Array.isArray(snap)) return null;
  const o = snap as Record<string, unknown>;
  if (!Array.isArray(o.arms)) return null;
  return {
    arms: o.arms as MabArmState[],
    explorationPercent: typeof o.explorationPercent === "number" ? o.explorationPercent : 0,
    regretPp: typeof o.regretPp === "number" ? o.regretPp : 0,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : new Date(0).toISOString(),
  };
}

export function isMabEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_MAB === "1";
}
