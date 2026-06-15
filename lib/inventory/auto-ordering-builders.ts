import { addDays, format, isWithinInterval } from "date-fns";

import type { PurchaseRecommendation } from "@/lib/ai/ai-purchasing-types";
import type {
  AutoOrderingDashboard,
  AutoOrderingProposal,
  AutoOrderingSettings,
  AutoOrderingSignal,
} from "@/lib/inventory/auto-ordering-types";

const HORIZON_DAYS = 14;

type HolidayRule = {
  /** MM-dd (approximate — Thanksgiving varies; use anchor for planning boost) */
  mmdd: string;
  label: string;
  boost: number;
  windowDays: number;
};

const HOLIDAY_RULES: HolidayRule[] = [
  { mmdd: "01-01", label: "New Year", boost: 1.12, windowDays: 2 },
  { mmdd: "02-14", label: "Valentine's Day", boost: 1.15, windowDays: 3 },
  { mmdd: "07-04", label: "Independence Day", boost: 1.14, windowDays: 3 },
  { mmdd: "11-28", label: "Thanksgiving week", boost: 1.22, windowDays: 5 },
  { mmdd: "12-25", label: "Christmas", boost: 1.2, windowDays: 5 },
  { mmdd: "12-31", label: "New Year's Eve", boost: 1.16, windowDays: 2 },
];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export function computeWeatherSignal(now = new Date()): AutoOrderingSignal {
  const month = now.getMonth();
  const dow = now.getDay();
  let factor = 1;
  const parts: string[] = [];

  if (dow === 5 || dow === 6) {
    factor *= 1.08;
    parts.push("Weekend traffic");
  }
  if (month >= 5 && month <= 7) {
    factor *= 1.05;
    parts.push("Summer patio season");
  }
  if (month === 11 || month === 0) {
    factor *= 1.06;
    parts.push("Cold-weather menu lift");
  }

  return {
    type: "weather",
    label: parts.length > 0 ? parts.join(" · ") : "Baseline conditions",
    multiplier: round3(factor),
  };
}

export function findUpcomingHolidaySignal(now = new Date(), horizonDays = HORIZON_DAYS): AutoOrderingSignal | null {
  const end = addDays(now, horizonDays);
  let best: { boost: number; label: string } | null = null;

  for (const rule of HOLIDAY_RULES) {
    const [mm, dd] = rule.mmdd.split("-").map(Number);
    const year = now.getFullYear();
    const holiday = new Date(year, mm - 1, dd);
    const windowStart = addDays(holiday, -rule.windowDays);
    const windowEnd = addDays(holiday, rule.windowDays);

    if (isWithinInterval(now, { start: windowStart, end: windowEnd }) || isWithinInterval(end, { start: windowStart, end: windowEnd })) {
      if (!best || rule.boost > best.boost) {
        best = { boost: rule.boost, label: rule.label };
      }
    }
  }

  if (!best) return null;
  return {
    type: "holiday",
    label: `${best.label} demand window`,
    multiplier: round3(best.boost),
  };
}

export function computeTrendSignal(rec: PurchaseRecommendation): AutoOrderingSignal {
  const daily = Math.max(0.01, rec.dailyUsage);
  const forecastDaily = rec.predictedDemand14d / HORIZON_DAYS;
  const ratio = forecastDaily / daily;

  if (ratio >= 1.12) {
    return { type: "trend", label: "Demand trending up (14d forecast)", multiplier: 1.1 };
  }
  if (ratio <= 0.88) {
    return { type: "trend", label: "Demand softening", multiplier: 0.95 };
  }
  return { type: "trend", label: "Stable demand", multiplier: 1 };
}

export function combineSignals(signals: AutoOrderingSignal[]): number {
  if (signals.length === 0) return 1;
  const product = signals.reduce((acc, s) => acc * s.multiplier, 1);
  return round3(Math.min(1.35, Math.max(0.85, product)));
}

export function buildAutoOrderingProposal(
  rec: PurchaseRecommendation,
  settings: AutoOrderingSettings,
  now = new Date(),
): AutoOrderingProposal | null {
  if (rec.confidence < settings.minConfidence) return null;
  if (rec.urgency === "low" && rec.daysRemaining != null && rec.daysRemaining > 7) return null;

  const signals: AutoOrderingSignal[] = [];
  if (settings.useWeatherSignals) signals.push(computeWeatherSignal(now));
  const holiday = settings.useHolidaySignals ? findUpcomingHolidaySignal(now) : null;
  if (holiday) signals.push(holiday);
  if (settings.useTrendSignals) signals.push(computeTrendSignal(rec));

  const combinedMultiplier = combineSignals(signals);
  const baseQuantity = rec.bestSupplier.orderQuantity;
  const adjustedQuantity = Math.max(1, Math.ceil(baseQuantity * combinedMultiplier));
  const estimatedTotal = round2(adjustedQuantity * rec.bestSupplier.unitCost);

  return {
    ingredientId: rec.ingredientId,
    ingredientName: rec.ingredientName,
    unit: rec.unit,
    baseQuantity,
    adjustedQuantity,
    estimatedTotal,
    urgency: rec.urgency,
    confidence: rec.confidence,
    supplierName: rec.bestSupplier.supplierName,
    supplierId: rec.bestSupplier.supplierId,
    signals,
    combinedMultiplier,
    suggestedAction: rec.suggestedAction,
  };
}

export function buildNetworkSignals(now = new Date(), settings: AutoOrderingSettings): AutoOrderingSignal[] {
  const signals: AutoOrderingSignal[] = [];
  if (settings.useWeatherSignals) signals.push(computeWeatherSignal(now));
  const holiday = settings.useHolidaySignals ? findUpcomingHolidaySignal(now) : null;
  if (holiday) signals.push(holiday);
  if (settings.useTrendSignals) {
    signals.push({
      type: "trend",
      label: `14-day forecast horizon (${format(now, "MMM d")} → ${format(addDays(now, HORIZON_DAYS), "MMM d")})`,
      multiplier: 1,
    });
  }
  return signals;
}

export function buildAutoOrderingDashboard(input: {
  workspaceId: string;
  settings: AutoOrderingSettings;
  recommendations: PurchaseRecommendation[];
  analyzedAt?: string;
  now?: Date;
}): AutoOrderingDashboard {
  const now = input.now ?? new Date();
  const proposals = input.recommendations
    .map((rec) => buildAutoOrderingProposal(rec, input.settings, now))
    .filter((p): p is AutoOrderingProposal => Boolean(p))
    .sort((a, b) => {
      const urgencyOrder = { critical: 0, high: 1, normal: 2, low: 3 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency] || b.estimatedTotal - a.estimatedTotal;
    });

  const multipliers = proposals.map((p) => p.combinedMultiplier);
  const averageMultiplier =
    multipliers.length > 0 ? round3(multipliers.reduce((s, m) => s + m, 0) / multipliers.length) : 1;

  return {
    workspaceId: input.workspaceId,
    analyzedAt: input.analyzedAt ?? now.toISOString(),
    settings: input.settings,
    horizonDays: HORIZON_DAYS,
    networkSignals: buildNetworkSignals(now, input.settings),
    proposals,
    summary: {
      proposalCount: proposals.length,
      criticalCount: proposals.filter((p) => p.urgency === "critical").length,
      estimatedSpend: round2(proposals.reduce((s, p) => s + p.estimatedTotal, 0)),
      averageMultiplier,
    },
    aiAssisted: true,
  };
}
