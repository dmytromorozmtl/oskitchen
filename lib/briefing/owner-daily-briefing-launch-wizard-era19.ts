import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import type { LaunchWizardCommercialBlockersSlice } from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import type {
  LaunchWizardCommercialSetupSlice,
  LaunchWizardNextCommercialUnblock,
} from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";

export const OWNER_DAILY_BRIEFING_LAUNCH_WIZARD_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-launch-wizard-v1" as const;

function commercialUnblockSeverity(
  blockerId: string,
): OwnerDailyBriefingRankedAction["severity"] {
  if (
    blockerId === "gono-go-no-go" ||
    blockerId === "p0-staging-blocked" ||
    blockerId === "gono-go-artifact-missing"
  ) {
    return "critical";
  }
  if (
    blockerId === "channel-live-proof-blocked" ||
    blockerId === "sso-proof-blocked" ||
    blockerId === "pilot-customer-missing"
  ) {
    return "high";
  }
  return "normal";
}

function commercialUnblockPriority(blockerId: string): number {
  if (blockerId === "gono-go-no-go" || blockerId === "gono-go-artifact-missing") return 1;
  if (blockerId === "p0-staging-blocked") return 2;
  if (blockerId === "channel-live-proof-blocked") return 3;
  if (blockerId === "sso-proof-blocked") return 4;
  if (blockerId === "pilot-customer-missing") return 5;
  if (blockerId.startsWith("golive-")) return 6;
  return 10;
}

export function buildOwnerDailyBriefingLaunchWizardCommercialAction(input: {
  commercialBlockers: LaunchWizardCommercialBlockersSlice;
  nextUnblock: LaunchWizardNextCommercialUnblock | null;
}): OwnerDailyBriefingRankedAction | null {
  if (!input.nextUnblock) {
    if (input.commercialBlockers.decision === "GO" && input.commercialBlockers.blockers.length === 0) {
      return null;
    }
    if (input.commercialBlockers.blockers.length === 0) {
      return {
        id: "launch-wizard-commercial-review",
        title: "Review commercial pilot evidence",
        reason: input.commercialBlockers.headline,
        severity: "normal",
        ownerRole: "owner",
        href: LAUNCH_WIZARD_ROUTE,
        status: "monitor",
        unblockCondition: "Confirm GO/NO-GO artifact before contract cutover.",
        priority: 12,
        ctaLabel: "Open launch wizard",
        tone: "normal",
      };
    }
    return null;
  }

  const { nextUnblock } = input;
  const severity = commercialUnblockSeverity(nextUnblock.blockerId);
  const priority = commercialUnblockPriority(nextUnblock.blockerId);

  return {
    id: `launch-wizard-${nextUnblock.blockerId}`,
    title: nextUnblock.label,
    reason: nextUnblock.detail,
    severity,
    ownerRole: "owner",
    href: nextUnblock.href,
    status: "open",
    unblockCondition: "Resolve the commercial blocker and refresh Today briefing.",
    priority,
    ctaLabel: "Unblock pilot",
    tone: severity === "critical" || severity === "high" ? "urgent" : "normal",
  };
}

export function mergeBriefingLaunchWizardTopActions(
  commercialAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!commercialAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [commercialAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

export function ownerBriefingHasLaunchWizardCommercialUnblock(input: {
  commercialAction: OwnerDailyBriefingRankedAction | null;
}): boolean {
  return input.commercialAction !== null;
}

export function buildOwnerDailyBriefingLaunchWizardSlice(input: {
  commercialBlockers: LaunchWizardCommercialBlockersSlice;
  commercialSetup: LaunchWizardCommercialSetupSlice;
}): {
  nextUnblock: LaunchWizardNextCommercialUnblock | null;
  decisionLabel: string;
  blockerCount: number;
} {
  return {
    nextUnblock: input.commercialSetup.nextUnblock,
    decisionLabel: input.commercialBlockers.decisionLabel,
    blockerCount: input.commercialBlockers.blockers.length,
  };
}
