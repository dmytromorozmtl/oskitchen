import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatPilotWeek1ExecutionPhaseBlockerDetail,
  resolveNextIncompletePilotWeek1ExecutionPhase,
} from "@/lib/commercial/pilot-week1-execution-phases-era21";
import {
  formatPilotWeek1ExecutionProgressLabel,
  type PilotWeek1ExecutionUiSlice,
} from "@/lib/commercial/pilot-week1-execution-ui-era21";

export const OWNER_DAILY_BRIEFING_PILOT_WEEK1_ERA21_POLICY_ID =
  "era21-owner-daily-briefing-pilot-week1-v1" as const;

export const PILOT_WEEK1_BRIEFING_ACTION_PRIORITY = 3 as const;

export function buildOwnerDailyBriefingPilotWeek1Action(
  slice: PilotWeek1ExecutionUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.blocked) return null;

  const nextPhase = resolveNextIncompletePilotWeek1ExecutionPhase(slice.phases);
  const phaseDetail = nextPhase
    ? formatPilotWeek1ExecutionPhaseBlockerDetail(nextPhase)
    : formatPilotWeek1ExecutionProgressLabel(slice);

  const href =
    nextPhase?.id === "day2_integration_health"
      ? slice.integrationHealthHref
      : nextPhase?.id === "day4_reports_review"
        ? slice.reportsHref
        : nextPhase?.id === "day3_pos_money_path"
          ? slice.posShiftsHref
          : nextPhase?.id === "day1_ttv_onboarding"
            ? slice.launchWizardHref
            : slice.todayHref;

  return {
    id: "pilot-week1-execution",
    title: nextPhase
      ? `Pilot Week 1 — ${nextPhase.label.replace(/^Day \d+ — /, "")}`
      : "Pilot Week 1 — complete TTV through metrics baseline",
    reason: `${formatPilotWeek1ExecutionProgressLabel(slice)}. ${phaseDetail}`,
    severity: "high",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Execute Days 1–5 on real pilot workspace: record PILOT_WEEK1_* env vars after each milestone, then Day 5 smokes for metrics + case study + GO re-run.",
    priority: PILOT_WEEK1_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open Week 1 checklist",
    tone: "urgent",
  };
}

export function mergeBriefingPilotWeek1TopActions(
  week1Action: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!week1Action) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [week1Action, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
