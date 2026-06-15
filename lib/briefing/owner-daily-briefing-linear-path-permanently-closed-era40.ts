import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatLinearPathPermanentlyClosedLabel,
  type LinearPathPermanentlyClosedUiSlice,
} from "@/lib/commercial/linear-path-permanently-closed-ui-era24";

export const OWNER_DAILY_BRIEFING_LINEAR_PATH_PERMANENTLY_CLOSED_ERA40_POLICY_ID =
  "era40-owner-daily-briefing-linear-path-permanently-closed-v1" as const;

export const LINEAR_PATH_PERMANENTLY_CLOSED_BRIEFING_ACTION_PRIORITY = 15 as const;

export function buildOwnerDailyBriefingLinearPathPermanentlyClosedAction(
  slice: LinearPathPermanentlyClosedUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.linearPathPermanentlyClosedMilestone !== "linear_path_permanently_closed_healthy";
  const href = slice.platformOpsHref;

  return {
    id: "linear-path-permanently-closed",
    title: blocked
      ? `Linear path blocked: ${slice.linearPathPermanentlyClosedMilestone.replaceAll("_", " ")}`
      : "Linear path permanently closed — doc chain terminus",
    reason: `${formatLinearPathPermanentlyClosedLabel(slice)}. ${blocked ? "Complete upstream absolute end and doc chain with honest artifact evidence." : "Step 17+ forbidden — repeat cert chain forever."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Complete Step 16 terminal closure with honest artifact evidence — never hand-edit PASS in artifacts.",
    priority: LINEAR_PATH_PERMANENTLY_CLOSED_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open linear path closure",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingLinearPathPermanentlyClosedTopActions(
  linearPathPermanentlyClosedAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!linearPathPermanentlyClosedAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [linearPathPermanentlyClosedAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
