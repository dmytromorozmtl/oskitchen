import { describe, expect, it } from "vitest";

import {
  buildLaunchWizardSteps,
  type LaunchWizardSignals,
} from "@/lib/launch-wizard/launch-wizard-era19";
import {
  buildLaunchWizardGoldenPathStepLinks,
  launchWizardGoldenPathWorkflowCount,
  pickPrimaryWorkflowForLaunchStep,
} from "@/lib/launch-wizard/launch-wizard-golden-path-era20";

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

describe("launch wizard golden path era20", () => {
  it("builds phase links for default wizard steps", () => {
    const steps = buildLaunchWizardSteps(emptySignals);
    const links = buildLaunchWizardGoldenPathStepLinks(steps);
    expect(links).toHaveLength(steps.length);
    expect(links.every((l) => l.phaseLabel.length > 0)).toBe(true);
  });

  it("picks primary workflow for integrations step", () => {
    const workflow = pickPrimaryWorkflowForLaunchStep("integrations");
    expect(workflow?.id).toBe("integration_health_recovery");
  });

  it("reports workflow count aligned with era20 proof module", () => {
    expect(launchWizardGoldenPathWorkflowCount()).toBe(8);
  });
});
