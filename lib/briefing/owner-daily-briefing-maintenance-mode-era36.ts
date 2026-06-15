import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatMaintenanceModeRhythmDetail,
  resolveNextMaintenanceModeAttentionRhythm,
} from "@/lib/commercial/maintenance-mode-phases-era24";
import {
  formatMaintenanceModeProgressLabel,
  type MaintenanceModeUiSlice,
} from "@/lib/commercial/maintenance-mode-ui-era24";

export const OWNER_DAILY_BRIEFING_MAINTENANCE_MODE_ERA36_POLICY_ID =
  "era36-owner-daily-briefing-maintenance-mode-v1" as const;

export const MAINTENANCE_MODE_BRIEFING_ACTION_PRIORITY = 11 as const;

export function buildOwnerDailyBriefingMaintenanceModeAction(
  slice: MaintenanceModeUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const nextRhythm = resolveNextMaintenanceModeAttentionRhythm(slice.rhythms);
  const rhythmDetail = nextRhythm
    ? formatMaintenanceModeRhythmDetail(nextRhythm)
    : formatMaintenanceModeProgressLabel(slice);

  const href =
    nextRhythm?.id === "weekly_wed_integration_health"
      ? slice.integrationHealthHref
      : nextRhythm?.id === "weekly_mon_shift_handoffs"
        ? slice.orderHubHref
        : nextRhythm?.id === "monthly_w1_metrics_baseline" || nextRhythm?.id === "monthly_w2_feedback_triage"
          ? "/dashboard/reports"
          : nextRhythm?.id === "monthly_w3_improvement_loop_review"
            ? slice.improvementLoopHref
            : nextRhythm?.id === "monthly_w4_product_evolution_review"
              ? slice.productEvolutionHref
              : slice.todayHref;

  return {
    id: "maintenance-mode",
    title: nextRhythm
      ? `Maintenance mode — ${nextRhythm.label.replace(/^(Weekly|Monthly|Quarterly|Per release|Per new pilot) /, "")}`
      : "Maintenance mode — commercial pilot path complete",
    reason: `${formatMaintenanceModeProgressLabel(slice)}. ${rhythmDetail}`,
    severity: slice.overdueCount > 0 ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Maintain operator rhythms with honest artifact freshness — never hand-edit PASS in artifacts.",
    priority: MAINTENANCE_MODE_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open maintenance mode",
    tone: slice.overdueCount > 0 ? "urgent" : "normal",
  };
}

export function mergeBriefingMaintenanceModeTopActions(
  maintenanceModeAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!maintenanceModeAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [maintenanceModeAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
