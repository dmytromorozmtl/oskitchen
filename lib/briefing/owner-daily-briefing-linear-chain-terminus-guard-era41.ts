import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatLinearChainTerminusGuardLabel,
  type LinearChainTerminusGuardUiSlice,
} from "@/lib/commercial/linear-chain-terminus-guard-ui-era24";

export const OWNER_DAILY_BRIEFING_LINEAR_CHAIN_TERMINUS_GUARD_ERA41_POLICY_ID =
  "era41-owner-daily-briefing-linear-chain-terminus-guard-v1" as const;

export const LINEAR_CHAIN_TERMINUS_GUARD_BRIEFING_ACTION_PRIORITY = 16 as const;

export function buildOwnerDailyBriefingLinearChainTerminusGuardAction(
  slice: LinearChainTerminusGuardUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.linearChainTerminusGuardMilestone !== "step17_forbidden_healthy";
  const href = slice.platformOpsHref;

  return {
    id: "linear-chain-terminus-guard",
    title: blocked
      ? `Step 17 guard blocked: ${slice.linearChainTerminusGuardMilestone.replaceAll("_", " ")}`
      : "Step 17 FORBIDDEN — linear chain terminus guard healthy",
    reason: `${formatLinearChainTerminusGuardLabel(slice)}. ${blocked ? "Complete upstream linear path closure and catalog integrity with honest artifact evidence." : "Step 17+ forbidden — repeat cert chain forever."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Complete Step 17 FORBIDDEN guard with honest artifact evidence — never hand-edit PASS in artifacts.",
    priority: LINEAR_CHAIN_TERMINUS_GUARD_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open Step 17 guard",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingLinearChainTerminusGuardTopActions(
  linearChainTerminusGuardAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!linearChainTerminusGuardAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [linearChainTerminusGuardAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
