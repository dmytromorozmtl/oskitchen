import { toJsonValue } from "@/lib/prisma/json";
/**
 * O5 — Post-publish regression guard (24h window, 2σ drop → rollback pending).
 */

export type PostPublishBaseline = {
  at: string;
  conversionRate: number;
  revenueProxyPp: number;
  checkouts: number;
};

export type PostPublishGuardState = {
  baseline: PostPublishBaseline;
  windowHours: number;
  sigmaThreshold: number;
  frozenUntil: string | null;
  rollbackPending: boolean;
  rollbackTokenHash: string | null;
  lastCheckAt: string | null;
  currentConversionRate: number | null;
  zScore: number | null;
};

export function isPostPublishGuardEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_POST_PUBLISH_GUARD === "1";
}

export function postPublishWindowHours(): number {
  return Number(process.env.THEME_EXPERIMENT_POST_PUBLISH_WINDOW_HOURS ?? "24");
}

export function readPostPublishGuard(raw: unknown): PostPublishGuardState | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).postPublishGuard;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const g = o as Record<string, unknown>;
  const baseline = g.baseline as PostPublishBaseline | undefined;
  if (!baseline || typeof baseline.at !== "string") return null;
  return {
    baseline,
    windowHours: typeof g.windowHours === "number" ? g.windowHours : postPublishWindowHours(),
    sigmaThreshold: typeof g.sigmaThreshold === "number" ? g.sigmaThreshold : 2,
    frozenUntil: typeof g.frozenUntil === "string" ? g.frozenUntil : null,
    rollbackPending: g.rollbackPending === true,
    rollbackTokenHash: typeof g.rollbackTokenHash === "string" ? g.rollbackTokenHash : null,
    lastCheckAt: typeof g.lastCheckAt === "string" ? g.lastCheckAt : null,
    currentConversionRate: typeof g.currentConversionRate === "number" ? g.currentConversionRate : null,
    zScore: typeof g.zScore === "number" ? g.zScore : null,
  };
}

export function isAutoConcludeFrozen(raw: unknown): boolean {
  const g = readPostPublishGuard(raw);
  if (!g?.frozenUntil) return false;
  return Date.now() < new Date(g.frozenUntil).getTime();
}

export function seedPostPublishGuard(input: {
  previousRaw: unknown;
  conversionRate: number;
  revenueProxyPp: number;
  checkouts: number;
  rollbackTokenHash?: string;
}): Record<string, unknown> {
  const base =
    input.previousRaw && typeof input.previousRaw === "object" && !Array.isArray(input.previousRaw)
      ? { ...(input.previousRaw as Record<string, unknown>) }
      : {};
  base.postPublishGuard = {
    baseline: {
      at: new Date().toISOString(),
      conversionRate: input.conversionRate,
      revenueProxyPp: input.revenueProxyPp,
      checkouts: input.checkouts,
    },
    windowHours: postPublishWindowHours(),
    sigmaThreshold: 2,
    frozenUntil: null,
    rollbackPending: false,
    rollbackTokenHash: input.rollbackTokenHash ?? null,
    lastCheckAt: null,
    currentConversionRate: null,
    zScore: null,
  } satisfies PostPublishGuardState;
  return base;
}

export function evaluatePostPublishRegression(input: {
  guard: PostPublishGuardState;
  currentConversionRate: number;
  currentCheckouts: number;
}): PostPublishGuardState {
  const { baseline } = input.guard;
  const rate = input.currentConversionRate;
  const se =
    baseline.checkouts > 0
      ? Math.sqrt((baseline.conversionRate * (1 - baseline.conversionRate)) / baseline.checkouts)
      : 0.05;
  const z = se > 0 ? (rate - baseline.conversionRate) / se : 0;
  const rollbackPending = z <= -input.guard.sigmaThreshold;

  const frozenUntil = rollbackPending
    ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    : input.guard.frozenUntil;

  return {
    ...input.guard,
    lastCheckAt: new Date().toISOString(),
    currentConversionRate: rate,
    zScore: Math.round(z * 100) / 100,
    rollbackPending,
    frozenUntil: rollbackPending ? frozenUntil : input.guard.frozenUntil,
  };
}
