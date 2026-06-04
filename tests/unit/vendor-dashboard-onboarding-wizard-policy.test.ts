import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildVendorOnboardingSteps,
  isVendorCatalogStepComplete,
  isVendorConnectStepComplete,
  isVendorFirstOrderStepComplete,
  isVendorProfileStepComplete,
  shouldShowVendorOnboardingWizard,
  summarizeVendorOnboarding,
  VENDOR_DASHBOARD_ONBOARDING_WIZARD_POLICY_ID,
  VENDOR_ONBOARDING_WIZARD_TEST_ID,
  type VendorOnboardingSnapshot,
} from "@/lib/marketplace/vendor-dashboard-onboarding-wizard-policy";

const ROOT = process.cwd();

const freshVendor: VendorOnboardingSnapshot = {
  vendorStatus: "APPROVED",
  stripeAccountId: null,
  connectStatus: "not_connected",
  connectReady: false,
  activeProductCount: 0,
  pendingReviewProductCount: 0,
  hasContactProfile: false,
  ordersTotal: 0,
};

describe("vendor dashboard onboarding wizard policy (DES-20)", () => {
  it("locks DES-20 policy id and test id", () => {
    expect(VENDOR_DASHBOARD_ONBOARDING_WIZARD_POLICY_ID).toBe(
      "vendor-dashboard-onboarding-wizard-des20-v1",
    );
    expect(VENDOR_ONBOARDING_WIZARD_TEST_ID).toBe("vendor-onboarding-wizard");
  });

  it("marks profile step incomplete without contact details", () => {
    expect(isVendorProfileStepComplete(freshVendor)).toBe(false);
    expect(
      isVendorProfileStepComplete({
        ...freshVendor,
        hasContactProfile: true,
      }),
    ).toBe(true);
  });

  it("builds four steps with a single current step", () => {
    const steps = buildVendorOnboardingSteps({
      ...freshVendor,
      hasContactProfile: true,
    });
    expect(steps.map((s) => s.id)).toEqual(["profile", "connect", "catalog", "first_order"]);
    expect(steps.filter((s) => s.status === "current")).toHaveLength(1);
    expect(steps[0]?.status).toBe("complete");
    expect(steps[1]?.status).toBe("current");
  });

  it("summarizes progress for a partially complete vendor", () => {
    const summary = summarizeVendorOnboarding({
      ...freshVendor,
      hasContactProfile: true,
      connectReady: true,
      connectStatus: "ready",
      stripeAccountId: "acct_123",
      activeProductCount: 2,
    });
    expect(summary.completedCount).toBe(3);
    expect(summary.progressPercent).toBe(75);
    expect(summary.currentStep?.id).toBe("first_order");
    expect(summary.allComplete).toBe(false);
  });

  it("hides wizard when all steps complete or dismissed", () => {
    const complete: VendorOnboardingSnapshot = {
      vendorStatus: "APPROVED",
      stripeAccountId: "acct_123",
      connectStatus: "ready",
      connectReady: true,
      activeProductCount: 1,
      pendingReviewProductCount: 0,
      hasContactProfile: true,
      ordersTotal: 3,
    };
    expect(isVendorConnectStepComplete(complete)).toBe(true);
    expect(isVendorCatalogStepComplete(complete)).toBe(true);
    expect(isVendorFirstOrderStepComplete(complete)).toBe(true);
    expect(summarizeVendorOnboarding(complete).allComplete).toBe(true);
    expect(shouldShowVendorOnboardingWizard(complete)).toBe(false);
    expect(shouldShowVendorOnboardingWizard(freshVendor, { dismissed: true })).toBe(false);
    expect(shouldShowVendorOnboardingWizard(freshVendor)).toBe(true);
  });

  it("wires wizard component and dashboard client", () => {
    const clientSource = readFileSync(
      join(ROOT, "components/marketplace/vendor-dashboard-client.tsx"),
      "utf8",
    );
    const wizardSource = readFileSync(
      join(ROOT, "components/marketplace/vendor-dashboard-onboarding-wizard.tsx"),
      "utf8",
    );
    expect(clientSource).toContain("VendorDashboardOnboardingWizard");
    expect(wizardSource).toContain("VENDOR_ONBOARDING_WIZARD_TEST_ID");
  });
});
