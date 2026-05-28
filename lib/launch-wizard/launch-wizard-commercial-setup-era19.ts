import type { LaunchBlocker } from "@/lib/go-live/blocker-engine";
import { resolveGoLiveBlockerRowNextAction } from "@/lib/go-live/go-live-focus-era18";
import type { LaunchWizardCommercialBlockerRow } from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import {
  launchWizardCommercialBlockerHref,
  LAUNCH_WIZARD_COMMERCIAL_RECOVERY_LINKS,
  LAUNCH_WIZARD_COMMERCIAL_SETUP_ERA19_POLICY_ID,
} from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const LAUNCH_WIZARD_COMMERCIAL_SETUP_AGGREGATOR_ERA19_POLICY_ID =
  "era19-launch-wizard-commercial-setup-aggregator-v1" as const;

export type LaunchWizardNextCommercialUnblock = {
  label: string;
  detail: string;
  href: string;
  blockerId: string;
};

export type LaunchWizardCommercialSetupSlice = {
  policyId: typeof LAUNCH_WIZARD_COMMERCIAL_SETUP_ERA19_POLICY_ID;
  nextUnblock: LaunchWizardNextCommercialUnblock | null;
  recoveryLinks: typeof LAUNCH_WIZARD_COMMERCIAL_RECOVERY_LINKS;
};

const COMMERCIAL_BLOCKER_PRIORITY: Record<string, number> = {
  "gono-go-no-go": 1,
  "p0-staging-blocked": 2,
  "channel-live-proof-blocked": 3,
  "sso-proof-blocked": 4,
  "pilot-customer-missing": 5,
  "gono-go-artifact-missing": 6,
};

function blockerPriority(id: string): number {
  if (id.startsWith("golive-")) return 7;
  if (id.startsWith("gate-")) return 8;
  return COMMERCIAL_BLOCKER_PRIORITY[id] ?? 20;
}

export function mapGoLiveBlockersToCommercialRows(
  blockers: readonly LaunchBlocker[],
): LaunchWizardCommercialBlockerRow[] {
  return blockers
    .filter(
      (blocker) => blocker.severity === "CRITICAL" || blocker.severity === "HIGH_RISK",
    )
    .slice(0, 3)
    .map((blocker) => {
      const nextAction = resolveGoLiveBlockerRowNextAction(blocker);
      return {
        id: `golive-${blocker.key}`,
        label: blocker.title,
        detail: blocker.resolution || blocker.impact,
        tone: "urgent" as const,
        href: nextAction?.href ?? "/dashboard/go-live",
      };
    });
}

export function normalizeCommercialBlockerHrefs(
  blockers: readonly LaunchWizardCommercialBlockerRow[],
): LaunchWizardCommercialBlockerRow[] {
  return blockers.map((blocker) => ({
    ...blocker,
    href: blocker.href.startsWith("/") ? blocker.href : launchWizardCommercialBlockerHref(blocker.id),
  }));
}

export function pickLaunchWizardNextCommercialUnblock(
  blockers: readonly LaunchWizardCommercialBlockerRow[],
): LaunchWizardNextCommercialUnblock | null {
  if (blockers.length === 0) return null;

  const sorted = [...blockers].sort(
    (a, b) => blockerPriority(a.id) - blockerPriority(b.id),
  );
  const top = sorted[0]!;

  return {
    blockerId: top.id,
    label: top.label,
    detail: top.detail,
    href: top.href,
  };
}

export function buildLaunchWizardCommercialSetupSlice(input: {
  blockers: readonly LaunchWizardCommercialBlockerRow[];
}): LaunchWizardCommercialSetupSlice {
  const normalized = normalizeCommercialBlockerHrefs(input.blockers);

  return {
    policyId: LAUNCH_WIZARD_COMMERCIAL_SETUP_ERA19_POLICY_ID,
    nextUnblock: pickLaunchWizardNextCommercialUnblock(normalized),
    recoveryLinks: LAUNCH_WIZARD_COMMERCIAL_RECOVERY_LINKS,
  };
}

export function mergeLaunchWizardCommercialBlockers(input: {
  baseBlockers: LaunchWizardCommercialBlockerRow[];
  goLiveBlockers: readonly LaunchBlocker[];
  maxRows?: number;
}): LaunchWizardCommercialBlockerRow[] {
  const goLiveRows = mapGoLiveBlockersToCommercialRows(input.goLiveBlockers);
  const seen = new Set<string>();
  const merged: LaunchWizardCommercialBlockerRow[] = [];

  for (const row of [...input.baseBlockers, ...goLiveRows]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    merged.push(row);
  }

  return normalizeCommercialBlockerHrefs(merged).slice(0, input.maxRows ?? 8);
}
