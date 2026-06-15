import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEra25CharterExitLabel,
  type Era25CharterExitUiSlice,
} from "@/lib/commercial/era25-charter-exit-ui-era24";

export const OWNER_DAILY_BRIEFING_ERA25_CHARTER_EXIT_ERA42_POLICY_ID =
  "era42-owner-daily-briefing-era25-charter-exit-v1" as const;

export const ERA25_CHARTER_EXIT_BRIEFING_ACTION_PRIORITY = 17 as const;

export function buildOwnerDailyBriefingEra25CharterExitAction(
  slice: Era25CharterExitUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.era25CharterExitMilestone !== "era25_charter_exit_healthy";
  const href = slice.platformOpsHref;

  return {
    id: "era25-charter-exit-outside-linear-path",
    title: blocked
      ? `Era25 charter exit blocked: ${slice.era25CharterExitMilestone.replaceAll("_", " ")}`
      : "Era25 charter exit — outside linear path healthy",
    reason: `${formatEra25CharterExitLabel(slice)}. ${blocked ? "Complete Step 17 FORBIDDEN guard and charter checklist with honest artifact evidence." : "Signed charter outside Steps 1–16 — repeat cert chain forever."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Complete era25 charter exit with signed charter doc — never hand-edit PASS in artifacts.",
    priority: ERA25_CHARTER_EXIT_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open era25 charter exit",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25CharterExitTopActions(
  era25CharterExitAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!era25CharterExitAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [era25CharterExitAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
