import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEngineeringPathTerminusProgressLabel,
  type EngineeringPathTerminusUiSlice,
} from "@/lib/commercial/engineering-path-terminus-ui-era24";

export const OWNER_DAILY_BRIEFING_ENGINEERING_PATH_TERMINUS_ERA37_POLICY_ID =
  "era37-owner-daily-briefing-engineering-path-terminus-v1" as const;

export const ENGINEERING_PATH_TERMINUS_BRIEFING_ACTION_PRIORITY = 12 as const;

export function buildOwnerDailyBriefingEngineeringPathTerminusAction(
  slice: EngineeringPathTerminusUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.firstBlockedGateStep ?? slice.firstBlockedStep;
  const href = blocked?.platformAnchor
    ? `/platform/commercial-pilot-ops${blocked.platformAnchor}`
    : blocked?.step && blocked.step <= 3
      ? "/dashboard/launch-wizard"
      : slice.platformOpsHref;

  return {
    id: "engineering-path-terminus",
    title: blocked
      ? `Engineering path — Step ${blocked.step} blocked: ${blocked.label}`
      : "Engineering path terminus — master orchestration",
    reason: `${formatEngineeringPathTerminusProgressLabel(slice)}. ${blocked ? blocked.detail : "All gate steps honest — repeat informational stack forever."}`,
    severity: slice.firstBlockedGateStep ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Complete gate chain with honest artifact evidence — never hand-edit PASS in artifacts.",
    priority: ENGINEERING_PATH_TERMINUS_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open engineering path",
    tone: slice.firstBlockedGateStep ? "urgent" : "normal",
  };
}

export function mergeBriefingEngineeringPathTerminusTopActions(
  engineeringPathTerminusAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!engineeringPathTerminusAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [engineeringPathTerminusAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
