import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEra25FirstCharterSliceReadinessLabel,
  type Era25FirstCharterSliceReadinessUiSlice,
} from "@/lib/commercial/era25-first-charter-slice-readiness-ui-era24";

export const OWNER_DAILY_BRIEFING_ERA25_FIRST_CHARTER_SLICE_ERA43_POLICY_ID =
  "era43-owner-daily-briefing-era25-first-charter-slice-v1" as const;

export const ERA25_FIRST_CHARTER_SLICE_BRIEFING_ACTION_PRIORITY = 18 as const;

export function buildOwnerDailyBriefingEra25FirstCharterSliceAction(
  slice: Era25FirstCharterSliceReadinessUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.era25FirstCharterSliceReadinessMilestone !== "era25_first_charter_slice_ready";
  const href = slice.platformOpsHref;

  return {
    id: "era25-first-charter-slice-readiness",
    title: blocked
      ? `First charter slice blocked: ${slice.era25FirstCharterSliceReadinessMilestone.replaceAll("_", " ")}`
      : "Era25 first charter slice — section readiness healthy",
    reason: `${formatEra25FirstCharterSliceReadinessLabel(slice)}. ${blocked ? "Complete era25 charter exit and validate all charter doc sections with honest artifact evidence." : "Charter sections valid — proceed to engineering gates with signed charter."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Complete first charter slice readiness with signed charter doc — never hand-edit PASS in artifacts.",
    priority: ERA25_FIRST_CHARTER_SLICE_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open first charter slice",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25FirstCharterSliceTopActions(
  era25FirstCharterSliceAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!era25FirstCharterSliceAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [era25FirstCharterSliceAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
