/**
 * Operational health estimate. We deliberately label this as an
 * estimate — the score is a sum of deterministic, explainable points
 * deducted from 100 when specific operational signals exceed
 * configurable thresholds. There is no ML and no synthetic data.
 */

export type HealthStatus = "Healthy" | "Watch" | "At Risk" | "Critical";

export type HealthInputs = {
  revenueTrend: number | null;
  orderTrend: number | null;
  overdueProductionItems: number;
  packingAccuracy: number | null;
  failedDeliveries: number;
  marginMedian: number | null;
  marginAtRiskItems: number;
  inventoryShortages: number;
  overdueTasks: number;
  failedIntegrations: number;
  repeatRate: number | null;
};

export type HealthContribution = {
  key: string;
  label: string;
  deduction: number;
  reason: string;
};

export type HealthScore = {
  score: number;
  status: HealthStatus;
  explanation: string;
  contributions: HealthContribution[];
};

const MAX_DEDUCTIONS = 100;

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function evaluateBusinessHealth(inputs: HealthInputs): HealthScore {
  const contributions: HealthContribution[] = [];

  function deduct(key: string, label: string, points: number, reason: string) {
    if (points <= 0) return;
    contributions.push({ key, label, deduction: Math.round(points), reason });
  }

  if (inputs.revenueTrend != null && inputs.revenueTrend < 0) {
    const pct = Math.abs(inputs.revenueTrend);
    const points = clamp(pct * 25, 0, 25);
    deduct(
      "revenue_trend",
      "Revenue trend",
      points,
      `Revenue down ${(pct * 100).toFixed(1)}% vs. previous period.`,
    );
  }
  if (inputs.orderTrend != null && inputs.orderTrend < 0) {
    const pct = Math.abs(inputs.orderTrend);
    const points = clamp(pct * 15, 0, 15);
    deduct(
      "order_trend",
      "Order trend",
      points,
      `Orders down ${(pct * 100).toFixed(1)}% vs. previous period.`,
    );
  }
  if (inputs.overdueProductionItems > 0) {
    const points = clamp(inputs.overdueProductionItems * 2, 0, 15);
    deduct(
      "production",
      "Production",
      points,
      `${inputs.overdueProductionItems} production items not yet completed.`,
    );
  }
  if (inputs.packingAccuracy != null && inputs.packingAccuracy < 0.95) {
    const gap = 0.95 - inputs.packingAccuracy;
    const points = clamp(gap * 200, 0, 10);
    deduct(
      "packing",
      "Packing accuracy",
      points,
      `Pack-through rate is ${(inputs.packingAccuracy * 100).toFixed(1)}% (target ≥ 95%).`,
    );
  }
  if (inputs.failedDeliveries > 0) {
    const points = clamp(inputs.failedDeliveries * 3, 0, 10);
    deduct(
      "delivery",
      "Delivery",
      points,
      `${inputs.failedDeliveries} delivery stops marked as failed.`,
    );
  }
  if (inputs.marginMedian != null && inputs.marginMedian < 0.5) {
    const gap = 0.5 - inputs.marginMedian;
    const points = clamp(gap * 40, 0, 10);
    deduct(
      "margin",
      "Margin",
      points,
      `Median gross margin is ${(inputs.marginMedian * 100).toFixed(1)}% — below the 50% guard rail (operational estimate).`,
    );
  }
  if (inputs.marginAtRiskItems > 0) {
    const points = clamp(inputs.marginAtRiskItems, 0, 5);
    deduct(
      "margin_items",
      "Items below margin target",
      points,
      `${inputs.marginAtRiskItems} item${inputs.marginAtRiskItems === 1 ? "" : "s"} flagged in latest costing pass.`,
    );
  }
  if (inputs.inventoryShortages > 0) {
    const points = clamp(inputs.inventoryShortages, 0, 10);
    deduct(
      "inventory",
      "Inventory shortages",
      points,
      `${inputs.inventoryShortages} ingredient line${inputs.inventoryShortages === 1 ? "" : "s"} short of required quantity.`,
    );
  }
  if (inputs.overdueTasks > 0) {
    const points = clamp(inputs.overdueTasks * 1.5, 0, 10);
    deduct(
      "tasks",
      "Overdue tasks",
      points,
      `${inputs.overdueTasks} kitchen / operations task${inputs.overdueTasks === 1 ? "" : "s"} overdue.`,
    );
  }
  if (inputs.failedIntegrations > 0) {
    const points = clamp(inputs.failedIntegrations * 5, 0, 10);
    deduct(
      "integrations",
      "Channel integrations",
      points,
      `${inputs.failedIntegrations} integration connection${inputs.failedIntegrations === 1 ? "" : "s"} failed or needs auth.`,
    );
  }
  if (inputs.repeatRate != null && inputs.repeatRate < 0.2) {
    const gap = 0.2 - inputs.repeatRate;
    const points = clamp(gap * 25, 0, 5);
    deduct(
      "customers",
      "Repeat customers",
      points,
      `Repeat rate is ${(inputs.repeatRate * 100).toFixed(1)}% — owners typically aim for ≥ 20%.`,
    );
  }

  const totalDeduction = contributions.reduce((s, c) => s + c.deduction, 0);
  const score = clamp(MAX_DEDUCTIONS - totalDeduction, 0, MAX_DEDUCTIONS);
  const status: HealthStatus =
    score >= 85 ? "Healthy" : score >= 70 ? "Watch" : score >= 50 ? "At Risk" : "Critical";

  const explanation =
    contributions.length === 0
      ? "All tracked operational signals are inside their guard rails — keep the current cadence."
      : `${contributions.length} signal${contributions.length === 1 ? "" : "s"} pulling the score down. This is an operational health estimate based on the data in your workspace, not an accounting statement.`;

  contributions.sort((a, b) => b.deduction - a.deduction);
  return { score, status, explanation, contributions };
}
