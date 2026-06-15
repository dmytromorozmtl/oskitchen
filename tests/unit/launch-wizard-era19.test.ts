import { describe, expect, it } from "vitest";

import {
  buildLaunchWizardSteps,
  launchWizardHeadline,
  pickLaunchWizardNextStep,
  summarizeLaunchWizardProgress,
  type LaunchWizardSignals,
} from "@/lib/launch-wizard/launch-wizard-era19";
import {
  LAUNCH_WIZARD_ERA19_POLICY_ID,
  LAUNCH_WIZARD_ROUTE,
  LAUNCH_WIZARD_STEP_IDS,
} from "@/lib/launch-wizard/launch-wizard-era19-policy";

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

describe("launch wizard era19", () => {
  it("locks era19 launch wizard policy", () => {
    expect(LAUNCH_WIZARD_ERA19_POLICY_ID).toBe("era19-launch-wizard-v1");
    expect(LAUNCH_WIZARD_ROUTE).toBe("/dashboard/launch-wizard");
    expect(LAUNCH_WIZARD_STEP_IDS).toHaveLength(8);
  });

  it("builds eight wizard steps with evidence and CTAs", () => {
    const steps = buildLaunchWizardSteps(emptySignals);
    expect(steps).toHaveLength(8);
    expect(steps.every((step) => step.href.startsWith("/dashboard"))).toBe(true);
    expect(steps.every((step) => step.evidenceSource.length > 0)).toBe(true);
  });

  it("marks business profile complete when settings exist", () => {
    const steps = buildLaunchWizardSteps({
      ...emptySignals,
      businessProfile: {
        businessName: "Pilot Kitchen",
        businessType: "RESTAURANT",
        settingsCompleted: true,
      },
    });
    expect(steps.find((step) => step.id === "business-profile")?.status).toBe("complete");
  });

  it("blocks integrations when channel errors exist", () => {
    const steps = buildLaunchWizardSteps({
      ...emptySignals,
      integrations: {
        connectedCount: 1,
        errorCount: 2,
        pilotChannelsReady: false,
        liveProofIncompleteCount: 1,
      },
    });
    const integrations = steps.find((step) => step.id === "integrations");
    expect(integrations?.status).toBe("blocked");
    expect(integrations?.missingItems.some((item) => item.includes("error"))).toBe(true);
  });

  it("does not fake pilot readiness GO without artifact", () => {
    const steps = buildLaunchWizardSteps({
      ...emptySignals,
      pilotReadiness: {
        ...emptySignals.pilotReadiness,
        commercialDecision: "UNKNOWN",
      },
    });
    const pilot = steps.find((step) => step.id === "pilot-readiness");
    expect(pilot?.status).toBe("blocked");
    expect(pilot?.missingItems.some((item) => item.includes("smoke:pilot-gono-go"))).toBe(true);
    expect(pilot?.missingItems.some((item) => item.includes("Paid pilot customer"))).toBe(true);
  });

  it("blocks pilot readiness on commercial NO-GO and P0 proof", () => {
    const steps = buildLaunchWizardSteps({
      ...emptySignals,
      pilotReadiness: {
        ...emptySignals.pilotReadiness,
        workspaceAttentionCount: 2,
        hasUrgent: true,
        commercialDecision: "NO-GO",
        p0Blocked: true,
        ssoProofBlocked: true,
        channelLiveProofBlocked: true,
      },
    });
    const pilot = steps.find((step) => step.id === "pilot-readiness");
    expect(pilot?.status).toBe("blocked");
    expect(pilot?.ctaLabel).toBe("Review commercial blockers");
    expect(pilot?.href).toBe(LAUNCH_WIZARD_ROUTE);
    expect(pilot?.missingItems.some((item) => item.includes("NO-GO"))).toBe(true);
    expect(pilot?.missingItems.some((item) => item.includes("P0"))).toBe(true);
    expect(pilot?.missingItems.some((item) => item.includes("SSO"))).toBe(true);
    expect(pilot?.missingItems.some((item) => item.includes("Woo/Shopify"))).toBe(true);
  });

  it("picks blocked step before not-started step", () => {
    const steps = buildLaunchWizardSteps({
      ...emptySignals,
      integrations: {
        connectedCount: 1,
        errorCount: 1,
        pilotChannelsReady: false,
        liveProofIncompleteCount: 0,
      },
    });
    const next = pickLaunchWizardNextStep(steps);
    expect(next?.id).toBe("integrations");
  });

  it("summarizes progress and headline honestly", () => {
    const steps = buildLaunchWizardSteps({
      ...emptySignals,
      businessProfile: {
        businessName: "Kitchen",
        businessType: "RESTAURANT",
        settingsCompleted: true,
      },
      integrations: {
        connectedCount: 1,
        errorCount: 1,
        pilotChannelsReady: true,
        liveProofIncompleteCount: 0,
      },
    });
    const progress = summarizeLaunchWizardProgress(steps);
    expect(progress.completedCount).toBe(1);
    expect(progress.blockedCount).toBe(2);
    expect(launchWizardHeadline(progress)).toContain("blocked");
  });
});
