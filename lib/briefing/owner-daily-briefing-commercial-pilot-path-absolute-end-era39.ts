import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatCommercialPilotPathAbsoluteEndLabel,
  type CommercialPilotPathAbsoluteEndUiSlice,
} from "@/lib/commercial/commercial-pilot-path-absolute-end-ui-era24";

export const OWNER_DAILY_BRIEFING_COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ERA39_POLICY_ID =
  "era39-owner-daily-briefing-commercial-pilot-path-absolute-end-v1" as const;

export const COMMERCIAL_PILOT_PATH_ABSOLUTE_END_BRIEFING_ACTION_PRIORITY = 14 as const;

export function buildOwnerDailyBriefingCommercialPilotPathAbsoluteEndAction(
  slice: CommercialPilotPathAbsoluteEndUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.absoluteEndMilestone !== "absolute_end_healthy";
  const href = slice.platformOpsHref;

  return {
    id: "commercial-pilot-path-absolute-end",
    title: blocked
      ? `Absolute end blocked: ${slice.absoluteEndMilestone.replaceAll("_", " ")}`
      : "Commercial pilot path absolute end — linear engineering closed",
    reason: `${formatCommercialPilotPathAbsoluteEndLabel(slice)}. ${blocked ? "Complete upstream steady state and path closure with honest artifact evidence." : "Linear engineering closed — repeat Step 14 rhythms forever."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Complete Step 15 closure with honest artifact evidence — never hand-edit PASS in artifacts.",
    priority: COMMERCIAL_PILOT_PATH_ABSOLUTE_END_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open absolute end",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingCommercialPilotPathAbsoluteEndTopActions(
  commercialPilotPathAbsoluteEndAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!commercialPilotPathAbsoluteEndAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [commercialPilotPathAbsoluteEndAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
