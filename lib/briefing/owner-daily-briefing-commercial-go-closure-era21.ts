import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import {
  formatCommercialGoClosurePhaseBlockerDetail,
  resolveNextIncompleteCommercialGoClosurePhase,
} from "@/lib/commercial/commercial-go-closure-phases-era21";
import {
  formatCommercialGoClosureProgressLabel,
  type CommercialGoClosureUiSlice,
} from "@/lib/commercial/commercial-go-closure-ui-era21";

export const OWNER_DAILY_BRIEFING_COMMERCIAL_GO_CLOSURE_ERA21_POLICY_ID =
  "era21-owner-daily-briefing-commercial-go-closure-v1" as const;

export const COMMERCIAL_GO_CLOSURE_BRIEFING_ACTION_PRIORITY = 2 as const;

export function buildOwnerDailyBriefingCommercialGoClosureAction(
  slice: CommercialGoClosureUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.blocked) return null;

  const nextPhase = resolveNextIncompleteCommercialGoClosurePhase(slice.phases);
  const phaseDetail = nextPhase
    ? formatCommercialGoClosurePhaseBlockerDetail(nextPhase)
    : formatCommercialGoClosureProgressLabel(slice);

  return {
    id: "commercial-go-closure",
    title: nextPhase
      ? `Commercial GO — ${nextPhase.label.replace(/^Phase \d+ — /, "")}`
      : "Commercial GO — close ICP + LOI + GO/NO-GO",
    reason: `${formatCommercialGoClosureProgressLabel(slice)}. ${phaseDetail}`,
    severity: "critical",
    ownerRole: "owner",
    href: slice.launchWizardHref,
    status: "open",
    unblockCondition:
      "Qualify ICP, complete forbidden-claims review, record signed LOI env vars, then npm run smoke:pilot-gono-go.",
    priority: COMMERCIAL_GO_CLOSURE_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open commercial GO checklist",
    tone: "urgent",
  };
}

export function mergeBriefingCommercialGoClosureTopActions(
  goClosureAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!goClosureAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [goClosureAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
