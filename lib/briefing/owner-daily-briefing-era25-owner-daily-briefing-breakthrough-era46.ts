import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatOwnerDailyBriefingBreakthroughEra25Label,
  type OwnerDailyBriefingBreakthroughEra25UiSlice,
} from "@/lib/commercial/owner-daily-briefing-breakthrough-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA46_POLICY_ID =
  "era46-owner-daily-briefing-era25-owner-daily-briefing-breakthrough-v1" as const;

export const OWNER_DAILY_BRIEFING_BREAKTHROUGH_BRIEFING_ACTION_PRIORITY = 21 as const;

export function buildOwnerDailyBriefingEra25OwnerDailyBriefingBreakthroughAction(
  slice: OwnerDailyBriefingBreakthroughEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked =
    slice.sliceBlocked ||
    slice.ownerDailyBriefingBreakthroughEra25Milestone !==
      "owner_daily_briefing_breakthrough_era25_ready";
  const href = slice.todayHref;

  return {
    id: "era25-owner-daily-briefing-breakthrough",
    title: blocked
      ? `Breakthrough blocked: ${slice.ownerDailyBriefingBreakthroughEra25Milestone.replaceAll("_", " ")}`
      : "Era25 owner daily briefing breakthrough — B0–B4 ready",
    reason: `${formatOwnerDailyBriefingBreakthroughEra25Label(slice)}. ${blocked ? "Complete blueprint readiness and wire all B0–B4 briefing tiles with honest P0 staging proof before era25 convergence slices." : "Breakthrough ready — proceed to paid pilot GO convergence on dedicated #era25-* anchors."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Complete breakthrough readiness with honest blueprint integrity — never hand-edit PASS in artifacts.",
    priority: OWNER_DAILY_BRIEFING_BREAKTHROUGH_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open breakthrough panel",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25OwnerDailyBriefingBreakthroughTopActions(
  ownerDailyBriefingBreakthroughAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!ownerDailyBriefingBreakthroughAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [ownerDailyBriefingBreakthroughAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
