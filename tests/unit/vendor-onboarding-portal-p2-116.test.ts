import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditVendorOnboardingPortalP2_116,
  formatVendorOnboardingPortalP2_116AuditLines,
} from "@/lib/marketplace/vendor-onboarding-portal-p2-116-audit";
import { VENDOR_ONBOARDING_PORTAL_P2_116_CAPABILITIES } from "@/lib/marketplace/vendor-onboarding-portal-p2-116-content";
import {
  buildVendorOnboardingPortalDemoReport,
  computeReadinessScore,
  isVendorOnboardingReady,
} from "@/lib/marketplace/vendor-onboarding-portal-p2-116-operations";
import {
  VENDOR_ONBOARDING_PORTAL_P2_116_CAPABILITY_COUNT,
  VENDOR_ONBOARDING_PORTAL_P2_116_CI_WORKFLOW,
  VENDOR_ONBOARDING_PORTAL_P2_116_DOC,
  VENDOR_ONBOARDING_PORTAL_P2_116_NPM_SCRIPT,
  VENDOR_ONBOARDING_PORTAL_P2_116_POLICY_ID,
  VENDOR_ONBOARDING_PORTAL_P2_116_ROUTE,
  VENDOR_ONBOARDING_PORTAL_P2_116_UNIT_TEST,
} from "@/lib/marketplace/vendor-onboarding-portal-p2-116-policy";

const ROOT = process.cwd();

describe("Vendor onboarding portal (P2-116)", () => {
  it("locks policy id, route, and five capabilities", () => {
    expect(VENDOR_ONBOARDING_PORTAL_P2_116_POLICY_ID).toBe("vendor-onboarding-portal-p2-116-v1");
    expect(VENDOR_ONBOARDING_PORTAL_P2_116_ROUTE).toBe("/dashboard/marketplace/vendor-onboarding");
    expect(VENDOR_ONBOARDING_PORTAL_P2_116_CAPABILITY_COUNT).toBe(5);
    expect(VENDOR_ONBOARDING_PORTAL_P2_116_CAPABILITIES).toHaveLength(5);
  });

  it("passes full vendor onboarding portal audit", () => {
    const summary = auditVendorOnboardingPortalP2_116(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyRegistrationLinked).toBe(true);
    expect(summary.legacySettingsLinked).toBe(true);
    expect(summary.legacySettingsTypesLinked).toBe(true);
    expect(summary.legacyWizardLinked).toBe(true);
    expect(summary.legacyWizardComponentLinked).toBe(true);
    expect(summary.legacyProductsLinked).toBe(true);
    expect(summary.capabilityCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("computes readiness score from block statuses", () => {
    const score = computeReadinessScore([
      { id: "a", label: "A", status: "ready", summary: "" },
      { id: "b", label: "B", status: "partial", summary: "" },
      { id: "c", label: "C", status: "missing", summary: "" },
    ]);
    expect(score).toBe(50);
  });

  it("builds demo vendor onboarding portal report", () => {
    const report = buildVendorOnboardingPortalDemoReport();
    expect(report.blocks).toHaveLength(5);
    expect(report.activeSkuCount).toBeGreaterThan(0);
    expect(report.deliveryZoneCount).toBeGreaterThan(0);
    expect(report.orderCutoffTime).toBe("14:00");
    expect(isVendorOnboardingReady(report)).toBe(true);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[VENDOR_ONBOARDING_PORTAL_P2_116_NPM_SCRIPT]).toContain(
      "audit-vendor-onboarding-portal-p2-116.ts",
    );
    expect(pkg.scripts["test:ci:vendor-onboarding-portal-p2-116"]).toContain(
      VENDOR_ONBOARDING_PORTAL_P2_116_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, VENDOR_ONBOARDING_PORTAL_P2_116_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(VENDOR_ONBOARDING_PORTAL_P2_116_NPM_SCRIPT);

    expect(existsSync(join(ROOT, VENDOR_ONBOARDING_PORTAL_P2_116_DOC))).toBe(true);
    expect(
      formatVendorOnboardingPortalP2_116AuditLines(auditVendorOnboardingPortalP2_116(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
