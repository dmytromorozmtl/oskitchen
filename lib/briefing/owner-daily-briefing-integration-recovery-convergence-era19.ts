import type { OwnerDailyBriefingRankedAction } from "@/lib/briefing/owner-daily-briefing-era19";
import { normalizeBriefingActionPath } from "@/lib/briefing/owner-daily-briefing-production-grade-era20";
import type { OwnerDailyBriefingTile } from "@/lib/briefing/owner-daily-briefing-era19";
import type { OwnerDailyBriefingIntegrationHealthSlice } from "@/lib/briefing/owner-daily-briefing-integration-health-era19";
import { OWNER_DAILY_BRIEFING_INTEGRATION_HEALTH_HREF } from "@/lib/briefing/owner-daily-briefing-integration-health-era19";
import {
  buildBriefingSmokeNextActionRankedAction,
} from "@/lib/briefing/owner-daily-briefing-smoke-action-era19";
import { BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF } from "@/lib/briefing/owner-daily-briefing-smoke-action-era19-policy";
import {
  OWNER_DAILY_BRIEFING_INTEGRATION_RECOVERY_CONVERGENCE_ERA19_POLICY_ID,
} from "@/lib/briefing/owner-daily-briefing-integration-recovery-convergence-era19-policy";
import { INTEGRATION_HEALTH_RECOVERY_ANCHOR } from "@/lib/integrations/integration-health-recovery-era19-policy";
import type { IntegrationHealthSmokeNextAction } from "@/lib/integrations/integration-health-smoke-artifacts-depth-era19";

export const OWNER_DAILY_BRIEFING_INTEGRATION_RECOVERY_CONVERGENCE_AGGREGATOR_ERA19_POLICY_ID =
  "era19-owner-daily-briefing-integration-recovery-convergence-aggregator-v1" as const;

export { OWNER_DAILY_BRIEFING_INTEGRATION_RECOVERY_CONVERGENCE_ERA19_POLICY_ID };

export type BriefingIntegrationRecoveryInput = {
  integrationOverall: "healthy" | "degraded" | "down" | "unknown";
  integrationHealth: OwnerDailyBriefingIntegrationHealthSlice | null;
  smokeNextAction: IntegrationHealthSmokeNextAction | null;
  errorIntegrations: number;
  webhooksNeedingAttention: number;
};

export type BriefingIntegrationRecoveryMode = "smoke" | "recovery" | "healthy";

export type BriefingIntegrationRecoveryTarget = {
  policyId: typeof OWNER_DAILY_BRIEFING_INTEGRATION_RECOVERY_CONVERGENCE_ERA19_POLICY_ID;
  mode: BriefingIntegrationRecoveryMode;
  href: string;
  headline: string;
  ctaLabel: string;
  priority: number;
};

const INTEGRATION_HEALTH_RECOVERY_HREF =
  `/dashboard/integration-health${INTEGRATION_HEALTH_RECOVERY_ANCHOR}` as const;

function integrationNeedsRecovery(input: BriefingIntegrationRecoveryInput): boolean {
  if (input.integrationOverall === "down" || input.integrationOverall === "degraded") {
    return true;
  }
  if (input.integrationHealth && !input.integrationHealth.allClear) {
    return true;
  }
  return input.errorIntegrations > 0 || input.webhooksNeedingAttention > 0;
}

export function pickBriefingIntegrationRecoveryTarget(
  input: BriefingIntegrationRecoveryInput,
): BriefingIntegrationRecoveryTarget {
  if (
    input.smokeNextAction &&
    input.smokeNextAction.displayStatus !== "PASSED"
  ) {
    return {
      policyId: OWNER_DAILY_BRIEFING_INTEGRATION_RECOVERY_CONVERGENCE_ERA19_POLICY_ID,
      mode: "smoke",
      href: BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF,
      headline: `Next smoke — ${input.smokeNextAction.label}`,
      ctaLabel: "Open smoke proof",
      priority:
        input.smokeNextAction.displayStatus === "FAILED"
          ? 1
          : input.smokeNextAction.rowId === "p0-staging-proof-unblock"
            ? 2
            : 3,
    };
  }

  if (integrationNeedsRecovery(input)) {
    const webhookNote =
      (input.integrationHealth?.failedWebhookCount ?? 0) > 0
        ? `${input.integrationHealth!.failedWebhookCount} webhook delivery(ies) need attention.`
        : input.integrationOverall === "down"
          ? "One or more integrations are in error — channel orders may fail."
          : "Integrations need attention before scaling pilot traffic.";

    return {
      policyId: OWNER_DAILY_BRIEFING_INTEGRATION_RECOVERY_CONVERGENCE_ERA19_POLICY_ID,
      mode: "recovery",
      href: INTEGRATION_HEALTH_RECOVERY_HREF,
      headline: webhookNote,
      ctaLabel: "Open recovery checklist",
      priority: input.integrationOverall === "down" ? 2 : 7,
    };
  }

  return {
    policyId: OWNER_DAILY_BRIEFING_INTEGRATION_RECOVERY_CONVERGENCE_ERA19_POLICY_ID,
    mode: "healthy",
    href: OWNER_DAILY_BRIEFING_INTEGRATION_HEALTH_HREF,
    headline: "Integrations look healthy — monitor through the shift.",
    ctaLabel: "Open health center",
    priority: 22,
  };
}

export function resolveBriefingIntegrationRecoveryHref(
  input: BriefingIntegrationRecoveryInput,
): string {
  return pickBriefingIntegrationRecoveryTarget(input).href;
}

export function enrichBriefingIntegrationRecoveryPackTiles(
  tiles: readonly OwnerDailyBriefingTile[],
  input: BriefingIntegrationRecoveryInput,
): OwnerDailyBriefingTile[] {
  const target = pickBriefingIntegrationRecoveryTarget(input);
  if (target.mode === "healthy") return [...tiles];

  return tiles.map((tile) => {
    if (tile.id !== "integration-health") return tile;

    const smokeDetail =
      target.mode === "smoke" && input.smokeNextAction
        ? ` Next engineering smoke: ${input.smokeNextAction.label} (${input.smokeNextAction.displayStatus}).`
        : "";

    return {
      ...tile,
      href: target.href,
      detail:
        target.mode === "recovery"
          ? `${tile.detail} Open the recovery checklist for prioritized fix steps.`
          : `${tile.detail}${smokeDetail}`,
      tone: "attention" as const,
    };
  });
}

export function buildBriefingIntegrationRecoveryConvergedAction(
  input: BriefingIntegrationRecoveryInput,
): OwnerDailyBriefingRankedAction | null {
  const target = pickBriefingIntegrationRecoveryTarget(input);
  if (target.mode === "healthy") return null;

  if (target.mode === "smoke" && input.smokeNextAction) {
    return buildBriefingSmokeNextActionRankedAction(input.smokeNextAction);
  }

  return {
    id: "integration-recovery-unblock",
    title: "Clear integration recovery blockers",
    reason: target.headline,
    severity: input.integrationOverall === "down" ? "critical" : "high",
    ownerRole: "owner",
    href: target.href,
    status: "open",
    unblockCondition:
      "Connections, webhooks, and channel proofs report healthy before scaling pilot orders.",
    priority: target.priority,
    ctaLabel: target.ctaLabel,
    tone: "urgent",
  };
}

export function mergeBriefingIntegrationRecoveryTopActions(
  generalActions: readonly OwnerDailyBriefingRankedAction[],
  convergedActions: readonly OwnerDailyBriefingRankedAction[],
): OwnerDailyBriefingRankedAction[] {
  const withoutDuplicates = generalActions.filter(
    (action) =>
      action.id !== "integration-health-action" &&
      !action.id.startsWith("briefing-smoke-"),
  );

  const seenIds = new Set<string>();
  const seenPaths = new Set<string>();
  const merged: OwnerDailyBriefingRankedAction[] = [];

  for (const action of [...convergedActions, ...withoutDuplicates]) {
    if (seenIds.has(action.id)) continue;
    const path = normalizeBriefingActionPath(action.href);
    if (seenPaths.has(path)) continue;
    seenIds.add(action.id);
    seenPaths.add(path);
    merged.push(action);
  }

  return merged.sort((a, b) => a.priority - b.priority);
}

export function briefingIntegrationRecoveryConvergencePolicySnapshot(): {
  policyId: typeof OWNER_DAILY_BRIEFING_INTEGRATION_RECOVERY_CONVERGENCE_ERA19_POLICY_ID;
  smokeHref: typeof BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF;
  recoveryHref: typeof INTEGRATION_HEALTH_RECOVERY_HREF;
} {
  return {
    policyId: OWNER_DAILY_BRIEFING_INTEGRATION_RECOVERY_CONVERGENCE_ERA19_POLICY_ID,
    smokeHref: BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF,
    recoveryHref: INTEGRATION_HEALTH_RECOVERY_HREF,
  };
}
