import { describe, expect, it } from "vitest";

import { buildLaunchWizardSteps, type LaunchWizardSignals } from "@/lib/launch-wizard/launch-wizard-era19";
import {
  buildLaunchWizardKdsProductionMissingItems,
  buildLaunchWizardKdsProductionOperatorLinks,
  buildLaunchWizardKdsProductionSetupGuidance,
  enrichLaunchWizardKdsProductionStep,
  resolveLaunchWizardKdsProductionCtaLabel,
  resolveLaunchWizardKdsProductionPrimaryHref,
} from "@/lib/launch-wizard/launch-wizard-kds-production-era19";
import {
  LAUNCH_WIZARD_KDS_PRIORITY_LANE_HREF,
  LAUNCH_WIZARD_KDS_PRODUCTION_ERA19_BACKLOG_ID,
  LAUNCH_WIZARD_KDS_PRODUCTION_ERA19_POLICY_ID,
  LAUNCH_WIZARD_KDS_PRODUCTION_ERA19_PROOF_STATUS,
  LAUNCH_WIZARD_KDS_PRODUCTION_OPERATOR_LINKS_ANCHOR,
  LAUNCH_WIZARD_POS_MANAGER_OVERRIDE_HREF,
  LAUNCH_WIZARD_PRODUCTION_BOARD_ROUTE,
  LAUNCH_WIZARD_PRODUCTION_CALENDAR_ROUTE,
} from "@/lib/launch-wizard/launch-wizard-kds-production-era19-policy";
import { POS_CASHIER_SPEED_MODE_ROUTE } from "@/lib/pos/pos-cashier-speed-mode-era19-policy";

const baseProductionInput = {
  posFirstUse: false,
  productionPlanCount: 0,
  firstProductionCompleted: false,
};

describe("launch-wizard-kds-production-era19 policy", () => {
  it("locks era19 launch wizard KDS/production cross-link policy", () => {
    expect(LAUNCH_WIZARD_KDS_PRODUCTION_ERA19_POLICY_ID).toBe(
      "era19-launch-wizard-kds-production-v1",
    );
    expect(LAUNCH_WIZARD_KDS_PRODUCTION_ERA19_BACKLOG_ID).toBe("KOS-E19-028");
    expect(LAUNCH_WIZARD_KDS_PRODUCTION_ERA19_PROOF_STATUS).toBe(
      "launch_wizard_kds_production_crosslink_wired",
    );
    expect(LAUNCH_WIZARD_KDS_PRODUCTION_OPERATOR_LINKS_ANCHOR).toBe(
      "launch-wizard-kds-production-links",
    );
    expect(LAUNCH_WIZARD_POS_MANAGER_OVERRIDE_HREF).toContain("pos-manager-override");
    expect(LAUNCH_WIZARD_KDS_PRIORITY_LANE_HREF).toContain("kds-priority-lane-strip");
  });
});

describe("launch-wizard-kds-production-era19", () => {
  it("requires POS checkout before KDS priority lane is unblocked", () => {
    const links = buildLaunchWizardKdsProductionOperatorLinks(baseProductionInput);
    const kds = links.find((row) => row.id === "kds-priority-lane");
    const override = links.find((row) => row.id === "pos-manager-override");

    expect(kds?.blocked).toBe(true);
    expect(kds?.blockedReason).toContain("POS checkout");
    expect(override?.blocked).toBe(true);
  });

  it("unblocks KDS and manager override links after POS first use", () => {
    const links = buildLaunchWizardKdsProductionOperatorLinks({
      ...baseProductionInput,
      posFirstUse: true,
    });
    const kds = links.find((row) => row.id === "kds-priority-lane");
    const override = links.find((row) => row.id === "pos-manager-override");

    expect(kds?.blocked).toBe(false);
    expect(kds?.href).toBe(LAUNCH_WIZARD_KDS_PRIORITY_LANE_HREF);
    expect(override?.blocked).toBe(false);
    expect(override?.href).toBe(LAUNCH_WIZARD_POS_MANAGER_OVERRIDE_HREF);
  });

  it("lists production calendar and board links without blocking", () => {
    const links = buildLaunchWizardKdsProductionOperatorLinks(baseProductionInput);
    expect(links.find((row) => row.id === "production-calendar")?.href).toBe(
      LAUNCH_WIZARD_PRODUCTION_CALENDAR_ROUTE,
    );
    expect(links.find((row) => row.id === "production-board")?.href).toBe(
      LAUNCH_WIZARD_PRODUCTION_BOARD_ROUTE,
    );
  });

  it("builds missing items from POS and production signals", () => {
    expect(buildLaunchWizardKdsProductionMissingItems(baseProductionInput)).toEqual([
      "Run first POS checkout to feed kitchen tickets",
      "Complete a production task or schedule batches on the calendar",
    ]);
    expect(
      buildLaunchWizardKdsProductionMissingItems({
        posFirstUse: true,
        productionPlanCount: 0,
        firstProductionCompleted: false,
      }),
    ).toEqual(["Complete a production task or schedule batches on the calendar"]);
    expect(
      buildLaunchWizardKdsProductionMissingItems({
        posFirstUse: true,
        productionPlanCount: 2,
        firstProductionCompleted: false,
      }),
    ).toEqual([]);
  });

  it("routes primary CTA to POS before production when checkout missing", () => {
    expect(resolveLaunchWizardKdsProductionPrimaryHref(baseProductionInput)).toBe(
      POS_CASHIER_SPEED_MODE_ROUTE,
    );
    expect(resolveLaunchWizardKdsProductionCtaLabel(baseProductionInput)).toBe("Run POS checkout");
    expect(buildLaunchWizardKdsProductionSetupGuidance(baseProductionInput)).toContain(
      "POS checkout",
    );
  });

  it("routes in-progress setup to production board when POS used but production incomplete", () => {
    const input = {
      posFirstUse: true,
      productionPlanCount: 0,
      firstProductionCompleted: false,
    };
    expect(resolveLaunchWizardKdsProductionPrimaryHref(input)).toBe(
      LAUNCH_WIZARD_PRODUCTION_BOARD_ROUTE,
    );
    expect(resolveLaunchWizardKdsProductionCtaLabel(input)).toBe("Set up production");
    expect(buildLaunchWizardKdsProductionSetupGuidance(input)).toContain("production batches");
  });

  it("routes complete step to KDS priority lane when POS has been used", () => {
    const input = {
      posFirstUse: true,
      productionPlanCount: 1,
      firstProductionCompleted: false,
    };
    expect(resolveLaunchWizardKdsProductionPrimaryHref(input)).toBe(
      LAUNCH_WIZARD_KDS_PRIORITY_LANE_HREF,
    );
    expect(resolveLaunchWizardKdsProductionCtaLabel(input)).toBe("Open KDS priority lane");
    expect(buildLaunchWizardKdsProductionSetupGuidance(input)).toContain("priority lane");
  });

  it("enriches kds-production wizard step with operator links", () => {
    const baseStep = buildLaunchWizardSteps({
      businessProfile: {
        businessName: "Kitchen",
        businessType: "RESTAURANT",
        settingsCompleted: true,
      },
      menuCatalog: {
        menuCount: 1,
        productCount: 1,
        firstMenuCreated: true,
        firstProductCreated: true,
      },
      storefront: { publishedCount: 1 },
      pos: { firstUse: true },
      production: { firstProductionCompleted: false, productionPlanCount: 0 },
      integrations: {
        connectedCount: 0,
        errorCount: 0,
        pilotChannelsReady: true,
        liveProofIncompleteCount: 0,
      },
      goLive: {
        projectId: null,
        criticalBlockerCount: 0,
        simulationPassed: false,
        approvalsPending: 0,
      },
      pilotReadiness: {
        workspaceAttentionCount: 0,
        hasUrgent: false,
        commercialDecision: "UNKNOWN",
        p0Blocked: false,
        customerExecutionStatus: "skipped_missing_customer",
        ssoProofBlocked: false,
        channelLiveProofBlocked: false,
      },
    } satisfies LaunchWizardSignals).find((row) => row.id === "kds-production")!;

    const enriched = enrichLaunchWizardKdsProductionStep(
      baseStep,
      { firstUse: true },
      { firstProductionCompleted: false, productionPlanCount: 0 },
    );

    expect(enriched.policyId).toBe(LAUNCH_WIZARD_KDS_PRODUCTION_ERA19_POLICY_ID);
    expect(enriched.operatorLinks).toHaveLength(4);
    expect(enriched.operatorLinksAnchor).toBe(LAUNCH_WIZARD_KDS_PRODUCTION_OPERATOR_LINKS_ANCHOR);
    expect(enriched.setupGuidance).toContain("production");
    expect(enriched.status).toBe("in_progress");
  });

  it("wires kds-production enrichment through buildLaunchWizardSteps", () => {
    const step = buildLaunchWizardSteps({
      businessProfile: {
        businessName: null,
        businessType: null,
        settingsCompleted: false,
      },
      menuCatalog: {
        menuCount: 0,
        productCount: 0,
        firstMenuCreated: false,
        firstProductCreated: false,
      },
      storefront: { publishedCount: 0 },
      pos: { firstUse: false },
      production: { firstProductionCompleted: false, productionPlanCount: 0 },
      integrations: {
        connectedCount: 0,
        errorCount: 0,
        pilotChannelsReady: true,
        liveProofIncompleteCount: 0,
      },
      goLive: {
        projectId: null,
        criticalBlockerCount: 0,
        simulationPassed: false,
        approvalsPending: 0,
      },
      pilotReadiness: {
        workspaceAttentionCount: 0,
        hasUrgent: false,
        commercialDecision: "UNKNOWN",
        p0Blocked: false,
        customerExecutionStatus: "skipped_missing_customer",
        ssoProofBlocked: false,
        channelLiveProofBlocked: false,
      },
    }).find((row) => row.id === "kds-production");

    expect(step?.operatorLinks).toHaveLength(4);
    expect(step?.href).toBe(POS_CASHIER_SPEED_MODE_ROUTE);
    expect(step?.ctaLabel).toBe("Run POS checkout");
    expect(step?.missingItems.some((item) => item.includes("POS checkout"))).toBe(true);
  });
});
