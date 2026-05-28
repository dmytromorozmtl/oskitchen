import { describe, expect, it } from "vitest";

import type { LaunchBlocker } from "@/lib/go-live/blocker-engine";
import {
  GO_LIVE_FOCUS_ERA18_BACKLOG_ID,
  GO_LIVE_FOCUS_ERA18_POLICY_ID,
  GO_LIVE_FOCUS_ERA18_PROOF_STATUS,
} from "@/lib/go-live/go-live-focus-era18-policy";
import {
  buildGoLiveFocusSnapshot,
  pickGoLiveAttentionItems,
  pickGoLiveLegacyAttentionItems,
  resolveGoLiveBlockerRowNextAction,
  summarizeGoLiveFocus,
} from "@/lib/go-live/go-live-focus-era18";
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

describe("go-live-focus-era18 policy", () => {
  it("registers era18 go-live focus proof", () => {
    expect(GO_LIVE_FOCUS_ERA18_POLICY_ID).toBe("era18-go-live-focus-v1");
    expect(GO_LIVE_FOCUS_ERA18_PROOF_STATUS).toBe("go_live_focus_attention_wired");
    expect(GO_LIVE_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-029");
  });
});

describe("pickGoLiveAttentionItems", () => {
  it("prioritizes critical blockers over warnings", () => {
    const report = validateLaunch(
      {
        ...baseInputs(),
        hasMenu: false,
        productCount: 0,
        hasAnalytics: false,
      },
      "RESTAURANT",
      "IN_PROGRESS",
    );
    const focus = buildGoLiveFocusSnapshot(report, 3);
    const items = pickGoLiveAttentionItems(report.blockers, focus);

    expect(items.some((item) => item.id === "no_active_menu")).toBe(true);
    expect(items[0]?.tone).toBe("urgent");
  });

  it("includes pending approvals when blockers allow room", () => {
    const report = validateLaunch(baseInputs(), "RESTAURANT", "IN_PROGRESS");
    const focus = buildGoLiveFocusSnapshot(report, 3);
    const items = pickGoLiveAttentionItems(report.blockers, focus);
    expect(items.some((item) => item.id === "approvals-pending")).toBe(true);
  });
});

describe("pickGoLiveLegacyAttentionItems", () => {
  it("surfaces incomplete legacy checklist steps", () => {
    const items = pickGoLiveLegacyAttentionItems([
      { label: "Menu setup", href: "/dashboard/menus", done: false },
      { label: "Billing configured", href: "/dashboard/billing", done: true },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0]?.href).toBe("/dashboard/menus");
  });
});

describe("resolveGoLiveBlockerRowNextAction", () => {
  it("routes critical blockers to fix action", () => {
    const blocker: LaunchBlocker = {
      key: "no_billing",
      severity: "CRITICAL",
      stage: "FINANCIAL_VALIDATION",
      title: "Billing not configured",
      impact: "test",
      resolution: "test",
      actionRoute: "/dashboard/billing",
    };
    const action = resolveGoLiveBlockerRowNextAction(blocker);
    expect(action?.label).toBe("Fix blocker");
    expect(action?.href).toBe("/dashboard/billing");
  });
});

describe("summarizeGoLiveFocus", () => {
  it("flags urgent when critical blockers exist", () => {
    const report = validateLaunch(
      { ...baseInputs(), hasBilling: false },
      "RESTAURANT",
      "IN_PROGRESS",
    );
    const focus = buildGoLiveFocusSnapshot(report, 0);
    expect(summarizeGoLiveFocus(focus).hasUrgent).toBe(true);
  });
});
