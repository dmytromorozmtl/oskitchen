import { describe, expect, it } from "vitest";

import type { LaunchBlocker } from "@/lib/go-live/blocker-engine";
import {
  buildGoLiveFocusSnapshot,
  type GoLiveChecklistItemFocus,
} from "@/lib/go-live/go-live-focus-era18";
import {
  GO_LIVE_PROJECT_NEXT_STEP_ERA18_BACKLOG_ID,
  GO_LIVE_PROJECT_NEXT_STEP_ERA18_POLICY_ID,
  GO_LIVE_PROJECT_NEXT_STEP_ERA18_PROOF_STATUS,
  GO_LIVE_APPROVALS_ANCHOR,
} from "@/lib/go-live/go-live-project-next-step-focus-era18-policy";
import { resolveGoLiveProjectNextStepHero } from "@/lib/go-live/go-live-project-next-step-focus-era18";
import type { ImplementationPilotReadinessAttentionItem } from "@/lib/implementation/implementation-pilot-readiness-focus-era18";
import { validateLaunch } from "@/lib/go-live/launch-validator";
import type { ReadinessInputs } from "@/lib/go-live/readiness-engine";

function baseInputs(): ReadinessInputs {
  return {
    hasBusinessProfile: true,
    hasFulfillmentRules: true,
    hasMenu: true,
    productCount: 12,
    mappedProductCount: 12,
    unmappedProductCount: 0,
    customerCount: 8,
    connectionsConnected: 1,
    connectionsBroken: 0,
    testOrderCount: 2,
    productionRuns: 2,
    packingTaskCount: 2,
    packingValidatedCount: 2,
    labelsPrinted: 5,
    deliveryRoutes: 1,
    staffActive: 5,
    trainingCompletions: 2,
    hasBilling: true,
    hasBackup: true,
    hasSupportContact: true,
    hasAnalytics: true,
    storefrontPublished: true,
    webhooksHealthy: true,
    approvalsCount: 2,
    approvalsRequired: 5,
    externalCertificationRequired: true,
    externalTargetProviderCount: 1,
    externalCertifiedProviderCount: 1,
    externalMissingProviderCount: 0,
    externalMissingProviderLabels: [],
    placeholderIntegrationScopeCount: 0,
    placeholderIntegrationScopeLabels: [],
    trainingProgramsActive: 1,
    trainingAssignmentsTotal: 1,
    trainingAssignmentsCompleted: 1,
    certificationsActive: 1,
    certificationsExpiringSoon: 0,
    staffHasOwner: true,
    staffHasManager: true,
    staffKitchen: 2,
    staffPackers: 1,
    staffDrivers: 1,
    staffShiftsToday: 2,
    billingStripeConfigured: true,
    billingPlanActive: true,
    billingHasCustomer: true,
    billingMode: "LIVE",
    billingTrialDaysRemaining: 0,
  };
}

function criticalBlocker(over: Partial<LaunchBlocker> = {}): LaunchBlocker {
  return {
    key: "missing-menu",
    title: "Menu not ready",
    stage: "CATALOG_SETUP",
    severity: "CRITICAL",
    impact: "POS cannot sell",
    resolution: "Add menu items before launch.",
    actionRoute: "/dashboard/menus",
    detail: null,
    ...over,
  };
}

function pilotItem(
  over: Partial<ImplementationPilotReadinessAttentionItem> = {},
): ImplementationPilotReadinessAttentionItem {
  return {
    id: "channel-woo",
    title: "WooCommerce — awaiting live smoke",
    detail: "Complete pilot wizard and engineering live proof.",
    href: "/dashboard/sales-channels/health",
    priority: 3,
    tone: "urgent",
    category: "channel",
    ...over,
  };
}

describe("go-live-project-next-step-focus-era18 policy", () => {
  it("registers era18 next-step hero proof", () => {
    expect(GO_LIVE_PROJECT_NEXT_STEP_ERA18_POLICY_ID).toBe("era18-go-live-project-next-step-v1");
    expect(GO_LIVE_PROJECT_NEXT_STEP_ERA18_PROOF_STATUS).toBe("go_live_project_next_step_hero_wired");
    expect(GO_LIVE_PROJECT_NEXT_STEP_ERA18_BACKLOG_ID).toBe("KOS-E18-059");
  });
});

describe("resolveGoLiveProjectNextStepHero", () => {
  it("prioritizes critical launch blockers over pilot readiness items", () => {
    const validation = validateLaunch(baseInputs(), { status: "IN_PROGRESS" });
    const focus = buildGoLiveFocusSnapshot(validation, 3);
    const hero = resolveGoLiveProjectNextStepHero({
      blockers: [criticalBlocker()],
      focus,
      checklistItems: [],
      pilotReadinessItems: [pilotItem()],
    });

    expect(hero?.kind).toBe("blocker");
    expect(hero?.title).toBe("Menu not ready");
    expect(hero?.href).toBe("/dashboard/menus");
  });

  it("surfaces pilot channel setup when no launch blockers exist", () => {
    const validation = validateLaunch(baseInputs(), { status: "IN_PROGRESS" });
    const focus = buildGoLiveFocusSnapshot(validation, 0);
    const hero = resolveGoLiveProjectNextStepHero({
      blockers: [],
      focus,
      checklistItems: [],
      pilotReadinessItems: [pilotItem()],
    });

    expect(hero?.kind).toBe("pilot");
    expect(hero?.ctaLabel).toBe("Open channel setup");
  });

  it("surfaces pending approvals when validation is clear", () => {
    const hero = resolveGoLiveProjectNextStepHero({
      blockers: [],
      focus: {
        criticalBlockerCount: 0,
        highRiskBlockerCount: 0,
        warningBlockerCount: 0,
        approvalsPending: 4,
        readinessScore: 82,
        canApprove: false,
      },
      checklistItems: [],
      pilotReadinessItems: [],
    });

    expect(hero?.kind).toBe("approval");
    expect(hero?.href).toBe(GO_LIVE_APPROVALS_ANCHOR);
  });

  it("prefers blocked checklist items over normal pilot signals", () => {
    const validation = validateLaunch(baseInputs(), { status: "IN_PROGRESS" });
    const focus = buildGoLiveFocusSnapshot(validation, 0);
    const checklistItems: GoLiveChecklistItemFocus[] = [
      {
        id: "item-1",
        title: "Staff training sign-off",
        status: "BLOCKED",
        required: true,
        actionRoute: "/dashboard/training",
        dueAt: null,
      },
    ];

    const hero = resolveGoLiveProjectNextStepHero({
      blockers: [],
      focus,
      checklistItems,
      pilotReadinessItems: [pilotItem({ tone: "normal", priority: 12 })],
    });

    expect(hero?.kind).toBe("checklist");
    expect(hero?.href).toBe("/dashboard/training");
  });
});
