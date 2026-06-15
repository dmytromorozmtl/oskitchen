import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatScaleReadinessPhaseBlockerDetail,
  resolveNextIncompleteScaleReadinessPhase,
} from "@/lib/commercial/scale-readiness-phases-era21";
import {
  formatScaleReadinessProgressLabel,
  type ScaleReadinessUiSlice,
} from "@/lib/commercial/scale-readiness-ui-era21";

export const OWNER_DAILY_BRIEFING_SCALE_READINESS_ERA21_POLICY_ID =
  "era21-owner-daily-briefing-scale-readiness-v1" as const;

export const SCALE_READINESS_BRIEFING_ACTION_PRIORITY = 5 as const;

export function buildOwnerDailyBriefingScaleReadinessAction(
  slice: ScaleReadinessUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.blocked) return null;

  const nextPhase = resolveNextIncompleteScaleReadinessPhase(slice.phases);
  const phaseDetail = nextPhase
    ? formatScaleReadinessPhaseBlockerDetail(nextPhase)
    : formatScaleReadinessProgressLabel(slice);

  const href =
    nextPhase?.id === "gate1_per_customer_pilot_ops" ||
    nextPhase?.id === "gate4_operational_resilience" ||
    nextPhase?.id === "gate5_data_room_artifact_chain"
      ? slice.platformOpsHref
      : nextPhase?.id === "gate2_soc2_readiness_track" ||
          nextPhase?.id === "gate6_second_paid_pilot_optional"
        ? slice.implementationHref
        : nextPhase?.id === "gate3_enterprise_sso_production"
          ? slice.launchWizardHref
          : slice.todayHref;

  return {
    id: "scale-readiness",
    title: nextPhase
      ? `Scale readiness — ${nextPhase.label.replace(/^Gate \d+ — /, "")}`
      : "Scale readiness — enterprise expansion gates",
    reason: `${formatScaleReadinessProgressLabel(slice)}. ${phaseDetail}`,
    severity: "high",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Isolate GO per customer, complete SOC2 track review, SSO cutover or honest deferral, resilience drills, then publish audited data room index — never fake certification.",
    priority: SCALE_READINESS_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open scale readiness checklist",
    tone: "urgent",
  };
}

export function mergeBriefingScaleReadinessTopActions(
  scaleAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!scaleAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [scaleAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
