import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEra25PostReentrantCharterLockEra25Label,
  type Era25PostReentrantCharterLockEra25UiSlice,
} from "@/lib/commercial/era25-post-re-entrant-charter-lock-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_POST_REENTRANT_CHARTER_LOCK_ERA57_POLICY_ID =
  "era57-owner-daily-briefing-era25-post-re-entrant-charter-lock-v1" as const;

export const ERA25_POST_REENTRANT_CHARTER_LOCK_BRIEFING_META_ACTION_PRIORITY = 32 as const;

export function buildOwnerDailyBriefingEra25PostReentrantCharterLockAction(
  slice: Era25PostReentrantCharterLockEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.charterLockBlocked;
  const href = slice.platformOpsHref;

  return {
    id: "era25-post-re-entrant-charter-lock",
    title: blocked
      ? slice.frozenEnvMutationDetected
        ? "Charter lock blocked: era25 env keys still mutable"
        : "Post-re-entrant charter lock: attest after honest re-entrant"
      : "Era25 charter locked · improvement loop only",
    reason: `${formatEra25PostReentrantCharterLockEra25Label(slice)}. ${blocked ? "Complete re-entrant integrity (era56), clear frozen era25 env keys, then validate charter lock + governance-bundles cert." : "Charter lock honest — era25 linear convergence env frozen; sustain improvement loop rhythms only."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Lock era25 charter after honest re-entrant evolution with zero mutable era25 linear convergence env keys.",
    priority: ERA25_POST_REENTRANT_CHARTER_LOCK_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: "Open charter lock",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25PostReentrantCharterLockTopActions(
  charterLockAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!charterLockAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [charterLockAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
