import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatEra25SteadyStateOperatorLoopLockEra25Label,
  type Era25SteadyStateOperatorLoopLockEra25UiSlice,
} from "@/lib/commercial/era25-steady-state-operator-loop-lock-ui-era25";

export const OWNER_DAILY_BRIEFING_ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ERA58_POLICY_ID =
  "era58-owner-daily-briefing-era25-steady-state-operator-loop-lock-v1" as const;

export const ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_BRIEFING_META_ACTION_PRIORITY = 33 as const;

export function buildOwnerDailyBriefingEra25SteadyStateOperatorLoopLockAction(
  slice: Era25SteadyStateOperatorLoopLockEra25UiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.visible) return null;

  const blocked = slice.steadyStateLockBlocked;
  const href = slice.platformOpsHref;

  return {
    id: "era25-steady-state-operator-loop-lock",
    title: blocked
      ? slice.frozenEnvMutationDetected
        ? "Steady-state lock blocked: era25 env keys still mutable"
        : slice.improvementLoopRhythmMutationDetected
          ? "Steady-state lock blocked: improvement loop cadence not honest"
          : "Steady-state operator loop lock: attest after charter lock"
      : "Era25 steady-state loop locked · improvement cadence only",
    reason: `${formatEra25SteadyStateOperatorLoopLockEra25Label(slice)}. ${blocked ? "Complete charter lock (era57), validate improvement loop + steady-state operator loop, then dual-cert governance-bundles + commercial-pilot-runbook." : "Steady-state lock honest — era25 convergence env frozen; sustain improvement loop rhythms and ops:validate-steady-state-operator-loop."}`,
    severity: blocked ? "high" : "normal",
    ownerRole: "owner",
    href,
    status: "open",
    unblockCondition:
      "Lock steady-state operator loop after honest charter lock with zero mutable era25 convergence env and honest improvement-loop cadence.",
    priority: ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_BRIEFING_META_ACTION_PRIORITY,
    ctaLabel: "Open steady-state lock",
    tone: blocked ? "urgent" : "normal",
  };
}

export function mergeBriefingEra25SteadyStateOperatorLoopLockTopActions(
  steadyStateLockAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!steadyStateLockAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [steadyStateLockAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
