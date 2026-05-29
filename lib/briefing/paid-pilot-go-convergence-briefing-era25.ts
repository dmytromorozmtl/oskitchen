/**
 * era25 Paid Pilot GO Convergence — briefing B3 + ranked action.
 */
import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import type { PaidPilotGoConvergenceState } from "@/lib/commercial/load-paid-pilot-go-convergence-state-era25";
import {
  PAID_PILOT_GO_CONVERGENCE_ERA25_PLATFORM_ANCHOR,
} from "@/lib/commercial/paid-pilot-go-convergence-phases-era25";
import type { OwnerDailyBriefingBreakthroughEra25Tile } from "@/lib/briefing/owner-daily-briefing-breakthrough-era25";

export const PAID_PILOT_GO_CONVERGENCE_BRIEFING_ERA25_POLICY_ID =
  "era25-paid-pilot-go-convergence-briefing-v1" as const;

export const PAID_PILOT_GO_CONVERGENCE_BRIEFING_ACTION_PRIORITY = 1 as const;

export function buildPaidPilotGoConvergenceB3Tile(
  goState: PaidPilotGoConvergenceState,
): Pick<OwnerDailyBriefingBreakthroughEra25Tile, "headline" | "detail" | "href" | "tone"> {
  if (!goState.artifactPresent) {
    return {
      headline: "Pilot GO/NO-GO — artifact missing",
      detail: "Run npm run smoke:pilot-gono-go — never fake GO",
      href: `/platform/commercial-pilot-ops${PAID_PILOT_GO_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`,
      tone: "attention",
    };
  }

  const decision = goState.decision ?? "NO-GO";
  const tone =
    decision === "GO" ? "success" : decision === "CONDITIONAL" ? "default" : "attention";

  return {
    headline: `Pilot GO/NO-GO — ${decision}`,
    detail: goState.loiRecorded
      ? `${goState.customerName ?? "Customer"} · ICP ${goState.icpQualified ? "qualified" : "not qualified"}`
      : `No signed LOI · ${goState.blockerCount} blocker(s) — honest NO-GO`,
    href: `/platform/commercial-pilot-ops${PAID_PILOT_GO_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`,
    tone,
  };
}

export function buildPaidPilotGoConvergenceBriefingAction(
  goState: PaidPilotGoConvergenceState,
): OwnerDailyBriefingRankedAction | null {
  if (goState.decision === "GO") return null;

  const headline = !goState.artifactPresent
    ? "Paid pilot GO/NO-GO — run evaluator smoke"
    : !goState.icpQualified
      ? "Paid pilot — qualify ICP before contract"
      : !goState.loiRecorded
        ? "Paid pilot — record signed LOI"
        : !goState.forbiddenClaimsPassed
          ? "Paid pilot — forbidden claims scan required"
          : `Paid pilot GO/NO-GO — ${goState.decision ?? "NO-GO"}`;

  return {
    id: "paid-pilot-go-convergence-era25",
    title: headline,
    reason:
      goState.topBlocker ??
      "Run npm run smoke:pilot-gono-go and resolve blockers before paid pilot cutover.",
    severity: "critical",
    ownerRole: "owner",
    href: `/platform/commercial-pilot-ops${PAID_PILOT_GO_CONVERGENCE_ERA25_PLATFORM_ANCHOR}`,
    status: "open",
    unblockCondition:
      "ICP qualified + signed LOI + forbidden-claims PASS + smoke:pilot-gono-go → decision GO",
    priority: PAID_PILOT_GO_CONVERGENCE_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open GO convergence",
    tone: "urgent",
  };
}

export type LaunchWizardPaidPilotGoConvergenceSlice = {
  decision: string;
  artifactPresent: boolean;
  icpQualified: boolean;
  loiRecorded: boolean;
  headline: string;
  href: string;
};

export function buildLaunchWizardPaidPilotGoConvergenceSlice(
  goState: PaidPilotGoConvergenceState,
): LaunchWizardPaidPilotGoConvergenceSlice {
  const decision = goState.decision ?? "NO-GO";
  return {
    decision,
    artifactPresent: goState.artifactPresent,
    icpQualified: goState.icpQualified,
    loiRecorded: goState.loiRecorded,
    headline: goState.artifactPresent
      ? `Commercial GO/NO-GO: ${decision} — ${goState.blockerCount} blocker(s)`
      : "Commercial GO/NO-GO artifact missing — run smoke:pilot-gono-go",
    href: `/dashboard/launch-wizard#launch-wizard-commercial-blockers`,
  };
}

export function mergeBriefingPaidPilotGoConvergenceTopActions(
  goConvergenceAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!goConvergenceAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [goConvergenceAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
