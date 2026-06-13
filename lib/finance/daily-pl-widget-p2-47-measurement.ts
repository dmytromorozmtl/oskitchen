export type DailyPlComparison = {
  revenueToday: number;
  revenueYesterday: number;
  revenueTarget: number;
  vsYesterdayPct: number | null;
  vsTargetPct: number | null;
  targetSource: "configured" | "weekly_average";
  paceLabel: "ahead" | "behind" | "on_track" | "no_target";
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeDayOverDayPctChange(today: number, yesterday: number): number | null {
  if (yesterday <= 0) return today > 0 ? 100 : null;
  return round2(((today - yesterday) / yesterday) * 100);
}

export function computeVsTargetPct(today: number, target: number): number | null {
  if (target <= 0) return null;
  return round2((today / target) * 100);
}

export function resolveDailyRevenueTarget(input: {
  configuredTarget: number | null;
  revenueWeek: number;
}): { target: number; source: "configured" | "weekly_average" } {
  if (input.configuredTarget != null && input.configuredTarget > 0) {
    return { target: round2(input.configuredTarget), source: "configured" };
  }
  const weeklyAvg = input.revenueWeek > 0 ? round2(input.revenueWeek / 7) : 0;
  return { target: weeklyAvg, source: "weekly_average" };
}

export function buildDailyPlComparison(input: {
  revenueToday: number;
  revenueYesterday: number;
  revenueTarget: number;
  targetSource: "configured" | "weekly_average";
}): DailyPlComparison {
  const vsYesterdayPct = computeDayOverDayPctChange(input.revenueToday, input.revenueYesterday);
  const vsTargetPct = computeVsTargetPct(input.revenueToday, input.revenueTarget);

  let paceLabel: DailyPlComparison["paceLabel"] = "no_target";
  if (input.revenueTarget > 0 && vsTargetPct != null) {
    if (vsTargetPct >= 100) paceLabel = "ahead";
    else if (vsTargetPct >= 85) paceLabel = "on_track";
    else paceLabel = "behind";
  }

  return {
    revenueToday: round2(input.revenueToday),
    revenueYesterday: round2(input.revenueYesterday),
    revenueTarget: round2(input.revenueTarget),
    vsYesterdayPct,
    vsTargetPct,
    targetSource: input.targetSource,
    paceLabel,
  };
}

export function formatDailyPlDeltaPct(pct: number | null): string {
  if (pct == null) return "—";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
}
