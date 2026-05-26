import type { Ga4ArmCheckoutRates } from "@/lib/storefront/ga4-data-api";
import { toJsonValue } from "@/lib/prisma/json";
import type { Ga4ParityScore } from "@/lib/storefront/ga4-parity-score";

export const GA4_PARITY_HISTORY_MAX = 60;
export const GA4_PARITY_DRIFT_THRESHOLD_PP = 3;
export const GA4_PARITY_DRIFT_STREAK_ALERT = 2;

export type Ga4ParityHistoryPoint = {
  at: string;
  status: Ga4ParityScore["status"];
  parityScorePp: number | null;
  firstPartyLiftPp: number;
  ga4LiftPp: number | null;
};

export type Ga4ParityDriftStreak = {
  count: number;
  lastAt: string;
  lastParityPp: number | null;
};

export type Ga4ParityBqSnapshot = {
  at: string;
  parityScorePp: number;
  ga4LiftPp: number;
  firstPartyLiftPp: number;
};

export function readGa4ParityBqSnapshot(raw: unknown): Ga4ParityBqSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const snap = (raw as Record<string, unknown>).ga4ParityBqSnapshot;
  if (!snap || typeof snap !== "object" || Array.isArray(snap)) return null;
  const o = snap as Record<string, unknown>;
  if (typeof o.at !== "string") return null;
  if (typeof o.parityScorePp !== "number" || typeof o.ga4LiftPp !== "number") return null;
  return {
    at: o.at,
    parityScorePp: o.parityScorePp,
    ga4LiftPp: o.ga4LiftPp,
    firstPartyLiftPp: typeof o.firstPartyLiftPp === "number" ? o.firstPartyLiftPp : 0,
  };
}

export function readGa4ParityCache(raw: unknown): {
  at: string;
  ga4: Ga4ArmCheckoutRates;
} | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const cache = (raw as Record<string, unknown>).ga4ParityCache;
  if (!cache || typeof cache !== "object" || Array.isArray(cache)) return null;
  const c = cache as Record<string, unknown>;
  const at = typeof c.at === "string" ? c.at : null;
  const ga4 = c.ga4 as Ga4ArmCheckoutRates | undefined;
  if (!at || !ga4) return null;
  return { at, ga4 };
}

export function readGa4ParityHistory(raw: unknown): Ga4ParityHistoryPoint[] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
  const hist = (raw as Record<string, unknown>).ga4ParityHistory;
  if (!Array.isArray(hist)) return [];
  return hist
    .filter((p): p is Ga4ParityHistoryPoint => {
      if (!p || typeof p !== "object" || Array.isArray(p)) return false;
      const o = p as Record<string, unknown>;
      return typeof o.at === "string" && typeof o.status === "string";
    })
    .slice(-GA4_PARITY_HISTORY_MAX);
}

export function readGa4ParityDriftStreak(raw: unknown): Ga4ParityDriftStreak | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const s = (raw as Record<string, unknown>).ga4ParityDriftStreak;
  if (!s || typeof s !== "object" || Array.isArray(s)) return null;
  const o = s as Record<string, unknown>;
  if (typeof o.count !== "number" || typeof o.lastAt !== "string") return null;
  return {
    count: Math.max(0, Math.floor(o.count)),
    lastAt: o.lastAt,
    lastParityPp: typeof o.lastParityPp === "number" ? o.lastParityPp : null,
  };
}

export function appendGa4ParityHistory(
  raw: unknown,
  point: Ga4ParityHistoryPoint,
): Ga4ParityHistoryPoint[] {
  const prev = readGa4ParityHistory(raw);
  const next = [...prev, point].slice(-GA4_PARITY_HISTORY_MAX);
  return next;
}

export function nextGa4ParityDriftStreak(
  prev: Ga4ParityDriftStreak | null,
  score: Ga4ParityScore,
): Ga4ParityDriftStreak {
  const now = new Date().toISOString();
  const isDrift = score.status === "drift";
  if (!isDrift) {
    return { count: 0, lastAt: now, lastParityPp: score.parityScorePp };
  }
  return {
    count: (prev?.count ?? 0) + 1,
    lastAt: now,
    lastParityPp: score.parityScorePp,
  };
}

export function mergeGa4ParityIntoJson(
  previousRaw: unknown,
  patch: {
    ga4?: Ga4ArmCheckoutRates | null;
    historyPoint?: Ga4ParityHistoryPoint;
    driftStreak?: Ga4ParityDriftStreak;
    bqSnapshot?: Ga4ParityBqSnapshot;
    clearAutoConcludeSchedule?: boolean;
    autoConcludeScheduledAt?: string | null;
    autoConcludeApprovalTokenHash?: string | null;
  },
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};

  if (patch.ga4) {
    base.ga4ParityCache = { at: new Date().toISOString(), ga4: patch.ga4 };
  }

  if (patch.historyPoint) {
    base.ga4ParityHistory = appendGa4ParityHistory(previousRaw, patch.historyPoint);
  }

  if (patch.driftStreak) {
    base.ga4ParityDriftStreak = patch.driftStreak;
  }

  if (patch.bqSnapshot) {
    base.ga4ParityBqSnapshot = patch.bqSnapshot;
  }

  if (patch.clearAutoConcludeSchedule) {
    delete base.autoConcludeScheduledAt;
  }

  if (patch.autoConcludeScheduledAt !== undefined) {
    if (patch.autoConcludeScheduledAt === null) {
      delete base.autoConcludeScheduledAt;
    } else {
      base.autoConcludeScheduledAt = patch.autoConcludeScheduledAt;
    }
  }

  if (patch.autoConcludeApprovalTokenHash !== undefined) {
    if (patch.autoConcludeApprovalTokenHash === null) {
      delete base.autoConcludeApprovalTokenHash;
    } else {
      base.autoConcludeApprovalTokenHash = patch.autoConcludeApprovalTokenHash;
    }
  }

  return base;
}
