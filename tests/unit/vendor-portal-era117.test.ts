import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  VENDOR_PORTAL_ERA117_CANONICAL_POLICY_ID,
  VENDOR_PORTAL_ERA117_MODULES,
  VENDOR_PORTAL_ERA117_POLICY_ID,
  VENDOR_PORTAL_ERA117_ROUTE,
  VENDOR_PORTAL_ERA117_SERVICE,
  VENDOR_PORTAL_ERA117_SUMMARY_ARTIFACT,
  VENDOR_PORTAL_ERA117_WIRING_PATHS,
} from "@/lib/marketplace/vendor-portal-era117-policy";
import {
  auditVendorPortalSmokeWiring,
  buildVendorPortalSmokeEra117Summary,
  resolveVendorPortalSmokeEra117ProofStatus,
} from "@/lib/marketplace/vendor-portal-smoke-summary";
import { VENDOR_PORTAL_POLICY_ID } from "@/lib/marketplace/vendor-portal-policy";

const ROOT = process.cwd();

describe("vendor portal era117", () => {
  it("locks era117 policy and artifact path", () => {
    expect(VENDOR_PORTAL_ERA117_POLICY_ID).toBe("era117-vendor-portal-v2-v1");
    expect(VENDOR_PORTAL_ERA117_SUMMARY_ARTIFACT).toBe(
      "artifacts/vendor-portal-smoke-summary.json",
    );
    expect(VENDOR_PORTAL_ERA117_ROUTE).toBe("/vendor/dashboard");
    expect(VENDOR_PORTAL_ERA117_MODULES).toHaveLength(3);
  });

  it("aligns era117 with canonical vendor portal v2 policy", () => {
    expect(VENDOR_PORTAL_ERA117_CANONICAL_POLICY_ID).toBe(VENDOR_PORTAL_POLICY_ID);
    expect(VENDOR_PORTAL_POLICY_ID).toBe("vendor-portal-v2");
  });

  it("audits in-repo Vendor Portal 2.0 wiring", () => {
    const audit = auditVendorPortalSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of VENDOR_PORTAL_ERA117_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes orders invoices analytics vendor hub wiring", () => {
    const service = readFileSync(join(ROOT, VENDOR_PORTAL_ERA117_SERVICE), "utf8");
    expect(service).toContain("loadVendorPortalHub");
    expect(service).toContain("loadVendorInvoices");

    const builders = readFileSync(
      join(ROOT, "lib/marketplace/vendor-portal-builders.ts"),
      "utf8",
    );
    expect(builders).toContain("buildVendorOrdersModule");
    expect(builders).toContain("buildVendorAnalyticsModule");

    const hub = readFileSync(
      join(ROOT, "components/marketplace/vendor-portal-hub.tsx"),
      "utf8",
    );
    expect(hub).toContain("vendor-portal-hub");
    expect(hub).toContain("Vendor Portal 2.0");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveVendorPortalSmokeEra117ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveVendorPortalSmokeEra117ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildVendorPortalSmokeEra117Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.modules).toContain("invoices");
  });
});
