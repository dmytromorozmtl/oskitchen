import { describe, expect, it } from "vitest";

import type { CommercialPilotOpsStatusModel } from "@/lib/commercial/commercial-pilot-ops-status-era18";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import type { P0StagingProofUnblockSummary } from "@/lib/commercial/p0-staging-proof-unblock-summary";
import {
  buildOwnerDailyBriefingSupportAdminActions,
  buildOwnerDailyBriefingSupportAdminAlerts,
  buildOwnerDailyBriefingSupportAdminTiles,
  OWNER_DAILY_BRIEFING_SUPPORT_ADMIN_ERA19_POLICY_ID,
} from "@/lib/briefing/owner-daily-briefing-support-admin-era19";
import {
  filterBriefingTilesForRolePack,
  resolveBriefingRolePack,
  shouldShowBriefingForPersona,
  shouldShowBriefingIntegrationHealthLane,
  shouldShowBriefingPilotReadinessLane,
} from "@/lib/briefing/owner-daily-briefing-role-packs-era19";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";

const goNoGo: PilotGoNoGoSummary = {
  version: "era17-pilot-gono-go-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  decision: "NO-GO",
  blockers: ["P0 staging proof blocked"],
  warnings: [],
  customerExecutionStatus: "skipped_missing_customer",
  customerName: null,
  loiSignedDate: null,
  icpQualification: { qualified: false, disqualifiers: [], missingCriteria: [] },
  evidenceGates: [],
  evaluatorInput: {
    tier0Pass: false,
    tier1Pass: false,
    tier2Pass: false,
    roleChecklistsComplete: false,
    forbiddenClaimsInContract: false,
    icpQualified: false,
    stagingUrl: null,
    commitSha: null,
  },
};

const p0Summary: P0StagingProofUnblockSummary = {
  version: "era17-p0-staging-proof-unblock-v1",
  runAt: "2026-05-28T00:00:00.000Z",
  commitSha: null,
  overall: "SKIPPED",
  p0ProofStatus: "awaiting_ops_credentials",
  defaultProofStatus: "awaiting_ops_credentials",
  allMissingEnvVars: ["DATABASE_URL", "E2E_STAGING_BASE_URL"],
  children: {
    ssoIdpStaging: {
      smokeScript: "smoke:enterprise-sso-idp-staging",
      artifactPath: "artifacts/enterprise-sso-idp-staging-smoke-summary.json",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: [],
    },
    stagingWorkflowsFirstGreen: {
      smokeScript: "smoke:staging-workflows-first-green",
      artifactPath: "artifacts/staging-workflows-first-green-summary.json",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites",
      missingEnvVars: [],
    },
    channelLive: {
      smokeScript: "smoke:woo-shopify-live",
      artifactPath: "artifacts/channel-live-smoke-summary.json",
      overall: "SKIPPED",
      proofStatus: "proof_skipped_missing_prerequisites/proof_skipped_missing_prerequisites",
      missingEnvVars: [],
    },
  },
};

const commercialOps: CommercialPilotOpsStatusModel = {
  loadedAt: "2026-05-28T00:00:00.000Z",
  goNoGo: { artifactPresent: true, summary: goNoGo },
  p0Staging: { artifactPresent: true, summary: p0Summary },
};

describe("owner-daily-briefing-support-admin-era19", () => {
  it("locks era19 support admin policy id", () => {
    expect(OWNER_DAILY_BRIEFING_SUPPORT_ADMIN_ERA19_POLICY_ID).toBe(
      "era19-owner-daily-briefing-support-admin-v1",
    );
  });

  it("builds support admin tiles with honest P0 and GO/NO-GO states", () => {
    const tiles = buildOwnerDailyBriefingSupportAdminTiles({
      blockers: [
        {
          id: "integrations",
          title: "Integration errors",
          detail: "1 connection in error state.",
          href: "/dashboard/sales-channels/health",
          priority: 12,
        },
      ],
      openSupportTickets: 3,
      errorIntegrations: 1,
      commercialOps,
    });

    expect(tiles.some((tile) => tile.id === "support-p0-proof")).toBe(true);
    expect(tiles.some((tile) => tile.id === "support-pilot-gono-go")).toBe(true);
    expect(tiles.find((tile) => tile.id === "support-pilot-gono-go")?.href).toBe(
      LAUNCH_WIZARD_ROUTE,
    );
    expect(tiles.every((tile) => tile.whyItMatters.length > 10)).toBe(true);
    expect(tiles.find((tile) => tile.id === "support-open-tickets")?.value).toBe("3");
  });

  it("does not fake GO when artifact says NO-GO", () => {
    const tiles = buildOwnerDailyBriefingSupportAdminTiles({
      blockers: [],
      openSupportTickets: 0,
      errorIntegrations: 0,
      commercialOps,
    });
    const goTile = tiles.find((tile) => tile.id === "support-pilot-gono-go");
    expect(goTile?.tone).not.toBe("success");
    expect(goTile?.detail).toContain("blocker");
  });

  it("builds support alerts and ranked actions for triage", () => {
    const alerts = buildOwnerDailyBriefingSupportAdminAlerts({
      blockers: [
        {
          id: "integrations",
          title: "Integration errors",
          detail: "1 connection in error state.",
          href: "/dashboard/sales-channels/health",
          priority: 12,
        },
      ],
      openSupportTickets: 2,
      commercialOps,
    });
    const actions = buildOwnerDailyBriefingSupportAdminActions({
      blockers: [
        {
          id: "integrations",
          title: "Integration errors",
          detail: "1 connection in error state.",
          href: "/dashboard/sales-channels/health",
          priority: 12,
        },
      ],
      openSupportTickets: 2,
      commercialOps,
    });

    expect(alerts.some((alert) => alert.id === "support-gono-go-alert")).toBe(true);
    expect(actions.every((action) => action.ownerRole === "support")).toBe(true);
    expect(actions.length).toBeLessThanOrEqual(3);
  });

  it("resolves support admin role pack for triage users who are not owners", () => {
    expect(
      resolveBriefingRolePack({
        workspaceRole: "STAFF",
        persona: "manager",
        supportAdmin: true,
      }),
    ).toBe("support_admin");
    expect(
      resolveBriefingRolePack({
        workspaceRole: "OWNER",
        persona: "manager",
        supportAdmin: true,
      }),
    ).toBe("owner");
  });

  it("shows briefing and pilot/integration lanes for support admin pack", () => {
    expect(
      shouldShowBriefingForPersona({
        workspaceRole: "STAFF",
        persona: "manager",
        supportAdmin: true,
      }),
    ).toBe(true);
    expect(shouldShowBriefingPilotReadinessLane("support_admin")).toBe(true);
    expect(shouldShowBriefingIntegrationHealthLane("support_admin")).toBe(true);

    const tiles = buildOwnerDailyBriefingSupportAdminTiles({
      blockers: [],
      openSupportTickets: 0,
      errorIntegrations: 0,
      commercialOps,
    });
    const packTiles = filterBriefingTilesForRolePack(tiles, "support_admin");
    expect(packTiles.length).toBeGreaterThan(0);
  });
});
