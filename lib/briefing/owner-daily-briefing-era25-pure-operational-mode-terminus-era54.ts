import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatPureOperationalModeTerminusEra25Label,
  type PureOperationalModeTerminusEra25UiSlice,
} from "@/lib/commercial/pure-operational-mode-terminus-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_PURE_OPERATIONAL_MODE_TERMINUS_ERA54_POLICY_ID =
  "era54-owner-daily-briefing-era25-pure-operational-mode-terminus-v1" as const;

export const PURE_OPERATIONAL_MODE_TERMINUS_BRIEFING_META_ACTION_PRIORITY = 29 as const;

export function buildOwnerDailyBriefingEra25PureOperationalModeTerminusAction(
  slice: PureOperationalModeTerminusEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked =
    slice.terminusBlocked ||
    slice.pureOperationalModeTerminusEra25Milestone !== "pure_operational_mode_era25_active";
  const href = slice.platformOpsHref;

  return {
    id: "era25-pure-operational-mode-terminus",
    title: blocked
      ? `Pure ops terminus blocked: ${slice.pureOperationalModeTerminusEra25Milestone.replaceAll("_", " ")}`
      : `Era25 pure ops — ${slice.healthyCount}/${slice.tracks.length} improvement-loop tracks fresh`,
    reason: `${formatPureOperationalModeTerminusEra25Label(slice)}. ${blocked ? "Complete sustained operational excellence convergence, then run post-sustained-ops orchestrator with honest PURE_OPERATIONAL_MODE_TERMINUS_ERA25_* env before era25 gate suppression is permanent." : "Pure operational mode active — maintain improvement-loop artifact freshness; era25 convergence surfaces suppressed."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Complete pure ops terminus with honest sustained ops integrity — never hand-edit PASS in artifacts.",
    priority: PURE_OPERATIONAL_MODE_TERMINUS_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: "Open pure ops terminus",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25PureOperationalModeTerminusTopActions(
  pureOperationalModeTerminusAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!pureOperationalModeTerminusAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [pureOperationalModeTerminusAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
