import { describe, expect, it } from "vitest";

import type { OwnerDailyBriefingIntegrationHealthSlice } from "@/lib/briefing/owner-daily-briefing-integration-health-era19";
import {
  buildBriefingIntegrationRecoveryConvergedAction,
  enrichBriefingIntegrationRecoveryPackTiles,
  mergeBriefingIntegrationRecoveryTopActions,
  OWNER_DAILY_BRIEFING_INTEGRATION_RECOVERY_CONVERGENCE_ERA19_POLICY_ID,
  pickBriefingIntegrationRecoveryTarget,
  resolveBriefingIntegrationRecoveryHref,
} from "@/lib/briefing/owner-daily-briefing-integration-recovery-convergence-era19";
import { BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF } from "@/lib/briefing/owner-daily-briefing-smoke-action-era19-policy";
import { INTEGRATION_HEALTH_RECOVERY_ANCHOR } from "@/lib/integrations/integration-health-recovery-era19-policy";
import type { IntegrationHealthSmokeNextAction } from "@/lib/integrations/integration-health-smoke-artifacts-depth-era19";

const smokeNextAction: IntegrationHealthSmokeNextAction = {
  rowId: "p0-staging-proof-unblock",
  label: "P0 staging proof unblock",
  smokeScript: "smoke:p0-staging-proof-unblock",
  reason: "SKIPPED WITH REASON — 11 env var(s) missing.",
  displayStatus: "SKIPPED WITH REASON",
  missingEnvVars: ["DATABASE_URL"],
  opsChecklistDoc: "docs/era18-p0-staging-proof-ops-checklist.md",
};

function degradedSlice(): OwnerDailyBriefingIntegrationHealthSlice {
  return {
    healthHref: "/dashboard/integration-health",
    overall: "degraded",
    headline: "Integrations need attention.",
    healthyCount: 1,
    degradedCount: 1,
    downCount: 0,
    failedWebhookCount: 2,
    liveProofUrgentCount: 0,
    pendingLiveSmokeCount: 0,
    channelSmokeOverall: "SKIPPED",
    channelSmokeProofStatus: "proof_skipped_missing_prerequisites",
    connections: [],
    liveProofRows: [],
    allClear: false,
  };
}

describe("owner-daily-briefing-integration-recovery-convergence-era19", () => {
  it("locks era19 integration recovery convergence policy id", () => {
    expect(OWNER_DAILY_BRIEFING_INTEGRATION_RECOVERY_CONVERGENCE_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-integration-recovery-convergence-v1",
    );
  });

  it("routes smoke blockers to the smoke next-action anchor", () => {
    const target = pickBriefingIntegrationRecoveryTarget({
      integrationOverall: "healthy",
      integrationHealth: null,
      smokeNextAction,
      errorIntegrations: 0,
      webhooksNeedingAttention: 0,
    });

    expect(target.mode).toBe("smoke");
    expect(resolveBriefingIntegrationRecoveryHref({
      integrationOverall: "healthy",
      integrationHealth: null,
      smokeNextAction,
      errorIntegrations: 0,
      webhooksNeedingAttention: 0,
    })).toBe(BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF);
  });

  it("routes connection issues to the recovery checklist anchor", () => {
    const href = resolveBriefingIntegrationRecoveryHref({
      integrationOverall: "degraded",
      integrationHealth: degradedSlice(),
      smokeNextAction: null,
      errorIntegrations: 1,
      webhooksNeedingAttention: 0,
    });

    expect(href).toBe(`/dashboard/integration-health${INTEGRATION_HEALTH_RECOVERY_ANCHOR}`);
  });

  it("enriches integration-health tile with converged href", () => {
    const [tile] = enrichBriefingIntegrationRecoveryPackTiles(
      [
        {
          id: "integration-health",
          category: "integrations",
          label: "Integrations",
          value: "degraded",
          detail: "Integrations need attention.",
          href: "/dashboard/integration-health",
          availability: "available",
          tone: "attention",
          priority: 4,
          whyItMatters: "Channel health prevents silent order loss.",
          linkState: "blocked",
        },
      ],
      {
        integrationOverall: "degraded",
        integrationHealth: degradedSlice(),
        smokeNextAction: null,
        errorIntegrations: 1,
        webhooksNeedingAttention: 0,
      },
    );

    expect(tile?.href).toContain(INTEGRATION_HEALTH_RECOVERY_ANCHOR);
    expect(tile?.detail).toContain("recovery checklist");
  });

  it("builds smoke converged action for owners and dedupes generic integration action", () => {
    const action = buildBriefingIntegrationRecoveryConvergedAction({
      integrationOverall: "healthy",
      integrationHealth: null,
      smokeNextAction,
      errorIntegrations: 0,
      webhooksNeedingAttention: 0,
    });

    expect(action?.id).toBe("briefing-smoke-p0-staging-proof-unblock");

    const merged = mergeBriefingIntegrationRecoveryTopActions(
      [
        {
          id: "integration-health-action",
          title: "Review integration health",
          reason: "Generic",
          severity: "high",
          ownerRole: "owner",
          href: "/dashboard/integration-health",
          status: "open",
          unblockCondition: "Restore health",
          priority: 7,
          ctaLabel: "Open",
          tone: "urgent",
        },
      ],
      action ? [action] : [],
    );

    expect(merged.some((row) => row.id === "integration-health-action")).toBe(false);
    expect(merged[0]?.href).toBe(BRIEFING_INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_HREF);
  });
});
