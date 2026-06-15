import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { VENDOR_PORTAL_ERA117_POLICY_ID } from "@/lib/marketplace/vendor-portal-era117-policy";
import {
  VENDOR_PORTAL_ERA192_CANONICAL_POLICY_ID,
  VENDOR_PORTAL_ERA192_MODULES,
  VENDOR_PORTAL_ERA192_POLICY_ID,
  VENDOR_PORTAL_ERA192_ROUTE,
  VENDOR_PORTAL_ERA192_SERVICE,
  VENDOR_PORTAL_ERA192_SUMMARY_ARTIFACT,
  VENDOR_PORTAL_ERA192_WIRING_PATHS,
} from "@/lib/marketplace/vendor-portal-era192-policy";
import {
  auditVendorPortalSmokeEra192Wiring,
  buildVendorPortalSmokeEra192Summary,
  resolveVendorPortalSmokeEra192ProofStatus,
} from "@/lib/marketplace/vendor-portal-era192-smoke-summary";
import {
  VENDOR_PORTAL_POLICY_ID,
  VENDOR_PORTAL_SERVICE,
} from "@/lib/marketplace/vendor-portal-policy";

const ROOT = process.cwd();

describe("vendor portal era192", () => {
  it("locks era192 policy and artifact path", () => {
    expect(VENDOR_PORTAL_ERA192_POLICY_ID).toBe("era192-vendor-portal-v2-v1");
    expect(VENDOR_PORTAL_ERA192_SUMMARY_ARTIFACT).toBe(
      "artifacts/vendor-portal-era192-smoke-summary.json",
    );
    expect(VENDOR_PORTAL_ERA192_ROUTE).toBe("/vendor/dashboard");
    expect(VENDOR_PORTAL_ERA192_WIRING_PATHS).toHaveLength(8);
    expect(VENDOR_PORTAL_ERA192_MODULES).toHaveLength(3);
  });

  it("aligns era192 with canonical Vendor Portal 2.0 policy", () => {
    expect(VENDOR_PORTAL_ERA192_CANONICAL_POLICY_ID).toBe(VENDOR_PORTAL_ERA117_POLICY_ID);
    expect(VENDOR_PORTAL_ERA192_SERVICE).toBe(VENDOR_PORTAL_SERVICE);
    expect(VENDOR_PORTAL_POLICY_ID).toBe("vendor-portal-v2");
  });

  it("audits in-repo Vendor Portal 2.0 Round 2 wiring", () => {
    const audit = auditVendorPortalSmokeEra192Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of VENDOR_PORTAL_ERA192_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes orders invoices analytics vendor hub wiring", () => {
    const service = readFileSync(join(ROOT, VENDOR_PORTAL_ERA192_SERVICE), "utf8");
    expect(service).toContain("loadVendorPortalHub");
    expect(service).toContain("loadVendorInvoices");
    expect(service).toContain("buildVendorPortalHub");

    const builders = readFileSync(
      join(ROOT, "lib/marketplace/vendor-portal-builders.ts"),
      "utf8",
    );
    expect(builders).toContain("buildVendorOrdersModule");
    expect(builders).toContain("buildVendorInvoicesModule");
    expect(builders).toContain("buildVendorAnalyticsModule");

    const hub = readFileSync(
      join(ROOT, "components/marketplace/vendor-portal-hub.tsx"),
      "utf8",
    );
    expect(hub).toContain("vendor-portal-hub");
    expect(hub).toContain("Vendor Portal 2.0");
    expect(hub).toContain("Orders inbox, commission invoices, and sales analytics");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveVendorPortalSmokeEra192ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveVendorPortalSmokeEra192ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildVendorPortalSmokeEra192Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.modules).toContain("orders");
    expect(summary.modules).toContain("invoices");
    expect(summary.modules).toContain("analytics");
  });
});
