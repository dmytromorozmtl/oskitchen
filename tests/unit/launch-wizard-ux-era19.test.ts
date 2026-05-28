import { describe, expect, it } from "vitest";

import {
  buildLaunchWizardSteps,
  type LaunchWizardSignals,
} from "@/lib/launch-wizard/launch-wizard-era19";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import {
  buildLaunchWizardStepNavItems,
  launchWizardProgressAriaLabel,
  launchWizardStepAnchorHref,
  launchWizardStepStatusAriaLabel,
  launchWizardToggleModeHref,
  launchWizardViewModeHref,
  LAUNCH_WIZARD_UX_ERA19_POLICY_ID,
  pickLaunchWizardStickyNextStepLabel,
} from "@/lib/launch-wizard/launch-wizard-ux-era19";

const emptySignals: LaunchWizardSignals = {
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
};

describe("launch-wizard-ux-era19", () => {
  it("locks era19 launch wizard UX policy id", () => {
    expect(LAUNCH_WIZARD_UX_ERA19_POLICY_ID).toBe("era19-launch-wizard-ux-v1");
  });

  it("builds compact and full mode hrefs", () => {
    expect(launchWizardViewModeHref("compact")).toBe(`${LAUNCH_WIZARD_ROUTE}?mode=compact`);
    expect(launchWizardViewModeHref("full")).toBe(LAUNCH_WIZARD_ROUTE);
    expect(launchWizardToggleModeHref(true)).toBe(LAUNCH_WIZARD_ROUTE);
    expect(launchWizardToggleModeHref(false)).toBe(`${LAUNCH_WIZARD_ROUTE}?mode=compact`);
  });

  it("builds step anchor hrefs for sticky nav", () => {
    expect(launchWizardStepAnchorHref("menu-catalog", true)).toBe(
      `${LAUNCH_WIZARD_ROUTE}?mode=compact#launch-wizard-step-menu-catalog`,
    );
    expect(launchWizardStepAnchorHref("integrations")).toBe(
      `${LAUNCH_WIZARD_ROUTE}#launch-wizard-step-integrations`,
    );
  });

  it("builds accessible progress and status labels", () => {
    expect(
      launchWizardProgressAriaLabel({
        completedCount: 2,
        totalCount: 8,
        percent: 25,
        blockedCount: 1,
      }),
    ).toContain("25 percent");
    expect(launchWizardStepStatusAriaLabel("blocked")).toBe("Step blocked");
  });

  it("builds step nav items with next step highlighted", () => {
    const steps = buildLaunchWizardSteps(emptySignals);
    const nav = buildLaunchWizardStepNavItems({
      steps,
      nextStepId: "business-profile",
      compact: true,
    });
    expect(nav).toHaveLength(8);
    expect(nav.find((item) => item.id === "business-profile")?.isNext).toBe(true);
    expect(nav.every((item) => item.href.includes("#launch-wizard-step-"))).toBe(true);
  });

  it("returns sticky next-step copy for complete and in-progress states", () => {
    const steps = buildLaunchWizardSteps(emptySignals);
    expect(pickLaunchWizardStickyNextStepLabel(steps[0] ?? null)).toContain("Next:");
    expect(pickLaunchWizardStickyNextStepLabel(null)).toContain("GO/NO-GO");
  });
});
