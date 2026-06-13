import {
  buildLaborCostComparison,
  type LaborCostComparison,
} from "@/lib/staff/labor-cost-widget-p2-49-measurement";
import {
  LABOR_COST_WIDGET_P2_49_LABOR_ROUTE,
  LABOR_COST_WIDGET_P2_49_POLICY_ID,
} from "@/lib/staff/labor-cost-widget-p2-49-policy";
import { loadLaborCostWidgetSettings } from "@/lib/staff/labor-cost-widget-p2-49-storage";
import { getLaborRealtimeData } from "@/services/labor/labor-realtime-load";

export type LaborCostWidgetPayload = {
  policyId: typeof LABOR_COST_WIDGET_P2_49_POLICY_ID;
  currency: string;
  comparison: LaborCostComparison;
  laborHref: string;
  staffHref: string;
  updatedAtIso: string;
};

export async function loadLaborCostWidgetModel(
  userId: string,
  now = new Date(),
): Promise<LaborCostWidgetPayload> {
  const [widgetSettings, snapshot] = await Promise.all([
    loadLaborCostWidgetSettings(userId),
    getLaborRealtimeData(userId),
  ]);

  const comparison = buildLaborCostComparison({
    laborCost: snapshot.laborCost,
    totalRevenue: snapshot.totalRevenue,
    totalLaborHours: snapshot.totalLaborHours,
    activeStaff: snapshot.activeStaff,
    configuredTarget: widgetSettings.targetLaborPercent,
  });

  return {
    policyId: LABOR_COST_WIDGET_P2_49_POLICY_ID,
    currency: "USD",
    comparison,
    laborHref: LABOR_COST_WIDGET_P2_49_LABOR_ROUTE,
    staffHref: "/dashboard/staff",
    updatedAtIso: snapshot.updatedAtIso || now.toISOString(),
  };
}
