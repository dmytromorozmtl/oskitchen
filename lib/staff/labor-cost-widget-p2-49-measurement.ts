import { LABOR_COST_WIDGET_P2_49_DEFAULT_TARGET_PCT } from "@/lib/staff/labor-cost-widget-p2-49-policy";

export type LaborCostComparison = {
  laborCost: number;
  totalRevenue: number;
  laborPercent: number;
  targetLaborPercent: number;
  activeStaff: number;
  totalLaborHours: number;
  status: "OVER" | "ON_TRACK" | "UNDER";
  targetSource: "configured" | "default";
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeLaborPercent(laborCost: number, totalRevenue: number): number {
  if (totalRevenue <= 0) return 0;
  return round1((laborCost / totalRevenue) * 100);
}

export function resolveTargetLaborPercent(configuredTarget: number | null): {
  target: number;
  source: "configured" | "default";
} {
  if (configuredTarget != null && configuredTarget > 0 && configuredTarget <= 100) {
    return { target: round1(configuredTarget), source: "configured" };
  }
  return { target: LABOR_COST_WIDGET_P2_49_DEFAULT_TARGET_PCT, source: "default" };
}

export function resolveLaborCostStatus(
  laborPercent: number,
  targetLaborPercent: number,
): LaborCostComparison["status"] {
  if (laborPercent > targetLaborPercent + 5) return "OVER";
  if (laborPercent >= targetLaborPercent - 5) return "ON_TRACK";
  return "UNDER";
}

export function buildLaborCostComparison(input: {
  laborCost: number;
  totalRevenue: number;
  totalLaborHours: number;
  activeStaff: number;
  configuredTarget: number | null;
}): LaborCostComparison {
  const laborCost = round2(input.laborCost);
  const totalRevenue = round2(input.totalRevenue);
  const laborPercent = computeLaborPercent(laborCost, totalRevenue);
  const { target, source } = resolveTargetLaborPercent(input.configuredTarget);

  return {
    laborCost,
    totalRevenue,
    laborPercent,
    targetLaborPercent: target,
    activeStaff: input.activeStaff,
    totalLaborHours: round1(input.totalLaborHours),
    status: resolveLaborCostStatus(laborPercent, target),
    targetSource: source,
  };
}

export function formatLaborCostDeltaPct(laborPercent: number, targetLaborPercent: number): string {
  const delta = round1(laborPercent - targetLaborPercent);
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta} pts vs target`;
}
