import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEra25EngineeringGatesLabel,
  type Era25EngineeringGatesUiSlice,
} from "@/lib/commercial/era25-engineering-gates-ui-era24";

export const OWNER_DAILY_BRIEFING_ERA25_ENGINEERING_GATES_ERA44_POLICY_ID =
  "era44-owner-daily-briefing-era25-engineering-gates-v1" as const;

export const ERA25_ENGINEERING_GATES_BRIEFING_ACTION_PRIORITY = 19 as const;

export function buildOwnerDailyBriefingEra25EngineeringGatesAction(
  slice: Era25EngineeringGatesUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked =
    slice.gatesBlocked || slice.era25EngineeringGatesMilestone !== "era25_engineering_gates_open";
  const href = slice.platformOpsHref;

  return {
    id: "era25-engineering-gates-require-signed-charter",
    title: blocked
      ? `Engineering gates blocked: ${slice.era25EngineeringGatesMilestone.replaceAll("_", " ")}`
      : "Era25 engineering gates — signed charter enforced",
    reason: `${formatEra25EngineeringGatesLabel(slice)}. ${blocked ? "Complete first charter slice readiness with honest integrity before opening era25 product engineering gates." : "Gates open — proceed to first era25 product slice blueprint on dedicated anchor only."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Open engineering gates only after era25_first_charter_slice_ready — never hand-edit PASS in artifacts.",
    priority: ERA25_ENGINEERING_GATES_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open engineering gates",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25EngineeringGatesTopActions(
  era25EngineeringGatesAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!era25EngineeringGatesAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [era25EngineeringGatesAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
