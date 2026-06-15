import { describe, expect, it } from "vitest";

import {
  buildLaunchWizardSteps,
  type LaunchWizardSignals,
} from "@/lib/launch-wizard/launch-wizard-era19";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";
import {
  buildLaunchWizardOnboardingHeroModel,
  buildOwnerDailyBriefingLaunchWizardSetupAction,
  enrichBriefingLaunchWizardPackTiles,
  LAUNCH_WIZARD_ONBOARDING_CONVERGENCE_ERA19_POLICY_ID,
  resolveLaunchWizardBriefingHref,
  resolveLaunchWizardPilotStatusBriefingHref,
} from "@/lib/launch-wizard/launch-wizard-onboarding-convergence-era19";
import type { OwnerDailyBriefingTile } from "@/lib/briefing/owner-daily-briefing-era19";

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

function baseTiles(): OwnerDailyBriefingTile[] {
  return [
    {
      id: "go-live-readiness",
      category: "go-live",
      label: "Go-live readiness",
      value: "25%",
      detail: "Complete setup categories before pilot cutover.",
      href: LAUNCH_WIZARD_ROUTE,
      availability: "available",
      tone: "attention",
      priority: 16,
      whyItMatters: "Setup completeness gates safe pilot cutover.",
      linkState: "blocked",
    },
    {
      id: "pilot-status",
      category: "pilot",
      label: "Pilot readiness",
      value: "2 gap(s)",
      detail: "Channel, SSO, or launch validation needs attention.",
      href: LAUNCH_WIZARD_ROUTE,
      availability: "available",
      tone: "neutral",
      priority: 17,
      whyItMatters: "Commercial proof gaps block paid pilot.",
      linkState: "operational",
    },
  ];
}

describe("launch-wizard-onboarding-convergence-era19", () => {
  it("locks era19 onboarding convergence policy id", () => {
    expect(LAUNCH_WIZARD_ONBOARDING_CONVERGENCE_ERA19_POLICY_ID).toBe(
      "era19-launch-wizard-onboarding-convergence-v1",
    );
  });

  it("builds briefing href with next step anchor", () => {
    expect(resolveLaunchWizardBriefingHref("menu-catalog")).toBe(
      `${LAUNCH_WIZARD_ROUTE}?mode=compact#launch-wizard-step-menu-catalog`,
    );
  });

  it("builds onboarding hero with remaining step count", () => {
    const steps = buildLaunchWizardSteps(emptySignals);
    const nextStep = steps[0]!;
    const hero = buildLaunchWizardOnboardingHeroModel({
      progress: { completedCount: 0, totalCount: 8, percent: 0, blockedCount: 0 },
      nextStep,
    });

    expect(hero?.headline).toContain("8 steps left");
    expect(hero?.workflowHref).toBe(nextStep.href);
    expect(hero?.stepAnchorHref).toContain("#launch-wizard-step-business-profile");
  });

  it("builds setup next briefing action when commercial path is clear", () => {
    const steps = buildLaunchWizardSteps(emptySignals);
    const nextStep = steps[0]!;

    const action = buildOwnerDailyBriefingLaunchWizardSetupAction({
      nextStep,
      progress: { completedCount: 0, totalCount: 8, percent: 0, blockedCount: 0 },
      hasCommercialUnblock: false,
    });

    expect(action?.id).toBe("launch-wizard-setup-business-profile");
    expect(action?.href).toContain("#launch-wizard-step-business-profile");
    expect(action?.ctaLabel).toBe(nextStep.ctaLabel);
  });

  it("skips setup action when commercial unblock takes precedence", () => {
    const steps = buildLaunchWizardSteps(emptySignals);
    expect(
      buildOwnerDailyBriefingLaunchWizardSetupAction({
        nextStep: steps[0]!,
        progress: { completedCount: 0, totalCount: 8, percent: 0, blockedCount: 0 },
        hasCommercialUnblock: true,
      }),
    ).toBeNull();
  });

  it("enriches go-live and pilot tiles with next step deep links", () => {
    const steps = buildLaunchWizardSteps(emptySignals);
    const nextStep = steps.find((step) => step.id === "menu-catalog")!;
    const enriched = enrichBriefingLaunchWizardPackTiles({
      tiles: baseTiles(),
      nextStep,
      progress: { completedCount: 1, totalCount: 8, percent: 13, blockedCount: 0 },
    });

    expect(enriched.find((tile) => tile.id === "go-live-readiness")?.href).toContain(
      "#launch-wizard-step-menu-catalog",
    );
    expect(enriched.find((tile) => tile.id === "go-live-readiness")?.detail).toContain(
      "Menu & catalog",
    );
  });

  it("links pilot tile to commercial blockers when setup is complete", () => {
    const enriched = enrichBriefingLaunchWizardPackTiles({
      tiles: baseTiles(),
      nextStep: null,
      progress: { completedCount: 8, totalCount: 8, percent: 100, blockedCount: 0 },
    });

    expect(enriched.find((tile) => tile.id === "pilot-status")?.href).toBe(
      `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`,
    );
  });

  it("links pilot tile to pilot-readiness step when that is next", () => {
    const href = resolveLaunchWizardPilotStatusBriefingHref({
      nextStepId: "pilot-readiness",
      setupComplete: false,
    });
    expect(href).toContain("#launch-wizard-step-pilot-readiness");
  });
});
