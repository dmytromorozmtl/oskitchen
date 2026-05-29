import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import { formatP0OpsVaultPhaseBlockerDetail } from "@/lib/commercial/p0-ops-vault-phases-era21";
import {
  formatP0OpsVaultProgressLabel,
  type P0OpsVaultUiSlice,
} from "@/lib/commercial/p0-ops-vault-ui-era21";

export const OWNER_DAILY_BRIEFING_P0_OPS_VAULT_ERA21_POLICY_ID =
  "era21-owner-daily-briefing-p0-ops-vault-v1" as const;

export const P0_OPS_VAULT_BRIEFING_ACTION_PRIORITY = 0 as const;

export function buildOwnerDailyBriefingP0OpsVaultAction(
  slice: P0OpsVaultUiSlice | null,
): OwnerDailyBriefingRankedAction | null {
  if (!slice?.blocked) return null;

  const nextPhase = slice.nextPhase;
  const phaseDetail = nextPhase
    ? `${formatP0OpsVaultPhaseBlockerDetail(nextPhase)} · ${nextPhase.docPath}`
    : formatP0OpsVaultProgressLabel(slice);

  return {
    id: "p0-ops-vault-day0",
    title: nextPhase
      ? `P0 ops vault — ${nextPhase.label.replace(/^Phase \d+ — /, "")}`
      : "P0 ops vault — configure staging credentials",
    reason: `${formatP0OpsVaultProgressLabel(slice)}. ${phaseDetail}`,
    severity: "critical",
    ownerRole: "owner",
    href: slice.platformOpsHref,
    status: "open",
    unblockCondition: `Configure ${slice.missingCount}/${slice.totalCount} ops vault vars (${slice.vaultReadinessArtifact}), then ${slice.orchestratorCommand}.`,
    priority: P0_OPS_VAULT_BRIEFING_ACTION_PRIORITY,
    ctaLabel: "Open VP Ops vault checklist",
    tone: "urgent",
  };
}

export function mergeBriefingP0OpsVaultTopActions(
  opsVaultAction: OwnerDailyBriefingRankedAction | null,
  generalActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  if (!opsVaultAction) return [...generalActions];

  const seen = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [opsVaultAction, ...generalActions]) {
    if (seen.has(action.id)) continue;
    seen.add(action.id);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}
