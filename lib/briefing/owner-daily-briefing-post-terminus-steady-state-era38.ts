import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatPostTerminusSteadyStateProgressLabel,
  type PostTerminusSteadyStateUiSlice,
} from "@/lib/commercial/post-terminus-steady-state-ui-era24";

export const OWNER_DAILY_BRIEFING_POST_TERMINUS_STEADY_STATE_ERA38_POLICY_ID =
  "era38-owner-daily-briefing-post-terminus-steady-state-v1" as const;

export const POST_TERMINUS_STEADY_STATE_BRIEFING_ACTION_PRIORITY = 13 as const;

export function buildOwnerDailyBriefingPostTerminusSteadyStateAction(
  slice: PostTerminusSteadyStateUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.nextAttentionTrack;
  const href = blocked?.routes[0] ?? slice.platformOpsHref;

  return {
    id: "post-terminus-steady-state",
    title: blocked
      ? `Steady state — ${blocked.label} overdue`
      : "Post-terminus steady state — repeat forever",
    reason: `${formatPostTerminusSteadyStateProgressLabel(slice)}. ${blocked ? blocked.detail : "All operator loop tracks healthy — repeat Step 12 rhythms forever."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Complete overdue steady-state tracks with honest artifact evidence — never hand-edit PASS in artifacts.",
    priority: POST_TERMINUS_STEADY_STATE_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open steady state",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingPostTerminusSteadyStateTopActions(
  postTerminusSteadyStateAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!postTerminusSteadyStateAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [postTerminusSteadyStateAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
