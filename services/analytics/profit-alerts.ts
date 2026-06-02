export type ProfitAlertSeverity = "info" | "warning" | "critical";

export type ProfitAlert = {
  id: string;
  severity: ProfitAlertSeverity;
  title: string;
  message: string;
};

export type ProfitAlertContext = {
  marginPercent: number;
  previousMarginPercent?: number | null;
  laborPercent: number;
  targetLaborPercent: number;
  deliveryCost: number;
  revenue: number;
  foodCostPercent: number;
  targetFoodCostPercent: number;
  peakHourLabel?: string | null;
  supplierSavingsUsd?: number;
};

export function marginZone(marginPercent: number): "green" | "yellow" | "red" {
  if (marginPercent >= 55) return "green";
  if (marginPercent >= 40) return "yellow";
  return "red";
}

export function generateProfitAlerts(ctx: ProfitAlertContext): ProfitAlert[] {
  const alerts: ProfitAlert[] = [];

  if (
    ctx.previousMarginPercent != null &&
    ctx.marginPercent < ctx.previousMarginPercent - 5
  ) {
    alerts.push({
      id: "margin_drop",
      severity: "critical",
      title: "Margin dropped",
      message: `Margin fell to ${ctx.marginPercent.toFixed(1)}% (was ${ctx.previousMarginPercent.toFixed(1)}%). Review food cost and pricing.`,
    });
  }

  if (ctx.laborPercent > ctx.targetLaborPercent + 5) {
    alerts.push({
      id: "labor_spike",
      severity: "warning",
      title: "Labor cost spike",
      message: `Labor is ${ctx.laborPercent.toFixed(1)}% of sales (target ${ctx.targetLaborPercent}%).`,
    });
  }

  if (ctx.revenue > 0 && ctx.deliveryCost / ctx.revenue > 0.08) {
    alerts.push({
      id: "delivery_cost",
      severity: "warning",
      title: "Delivery cost elevated",
      message: `Delivery fees are ${((ctx.deliveryCost / ctx.revenue) * 100).toFixed(1)}% of revenue today.`,
    });
  }

  if (ctx.foodCostPercent > ctx.targetFoodCostPercent + 6) {
    alerts.push({
      id: "food_cost",
      severity: "warning",
      title: "Food cost high",
      message: `Estimated food cost is ${ctx.foodCostPercent.toFixed(1)}% (target ${ctx.targetFoodCostPercent}%).`,
    });
  }

  if ((ctx.supplierSavingsUsd ?? 0) >= 50) {
    alerts.push({
      id: "supplier_savings",
      severity: "info",
      title: "Supplier savings opportunity",
      message: `Par-level review suggests ~$${Math.round(ctx.supplierSavingsUsd!)} recoverable on fast-moving SKUs.`,
    });
  }

  if (ctx.peakHourLabel) {
    alerts.push({
      id: "peak_hours",
      severity: "info",
      title: "Peak hour traffic",
      message: `Highest sales hour today: ${ctx.peakHourLabel}. Staff prep and KDS capacity accordingly.`,
    });
  }

  if (ctx.marginPercent >= 60 && alerts.every((a) => a.id !== "margin_drop")) {
    alerts.push({
      id: "margin_healthy",
      severity: "info",
      title: "Healthy margin",
      message: `Margin at ${ctx.marginPercent.toFixed(1)}% — on track for the shift.`,
    });
  }

  return alerts;
}
