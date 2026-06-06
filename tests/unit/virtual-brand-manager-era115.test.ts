import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  VIRTUAL_BRAND_MANAGER_ERA115_CANONICAL_POLICY_ID,
  VIRTUAL_BRAND_MANAGER_ERA115_POLICY_ID,
  VIRTUAL_BRAND_MANAGER_ERA115_PROVISION_TARGET_MINUTES,
  VIRTUAL_BRAND_MANAGER_ERA115_ROUTE,
  VIRTUAL_BRAND_MANAGER_ERA115_SERVICE,
  VIRTUAL_BRAND_MANAGER_ERA115_SUMMARY_ARTIFACT,
  VIRTUAL_BRAND_MANAGER_ERA115_TEMPLATES,
  VIRTUAL_BRAND_MANAGER_ERA115_WIRING_PATHS,
} from "@/lib/enterprise/virtual-brand-manager-era115-policy";
import {
  auditVirtualBrandManagerSmokeWiring,
  buildVirtualBrandManagerSmokeEra115Summary,
  resolveVirtualBrandManagerSmokeEra115ProofStatus,
} from "@/lib/enterprise/virtual-brand-manager-smoke-summary";
import { VIRTUAL_BRAND_POLICY_ID } from "@/lib/enterprise/virtual-brand-policy";

const ROOT = process.cwd();

describe("virtual brand manager era115", () => {
  it("locks era115 policy and artifact path", () => {
    expect(VIRTUAL_BRAND_MANAGER_ERA115_POLICY_ID).toBe("era115-virtual-brand-manager-v1");
    expect(VIRTUAL_BRAND_MANAGER_ERA115_SUMMARY_ARTIFACT).toBe(
      "artifacts/virtual-brand-manager-smoke-summary.json",
    );
    expect(VIRTUAL_BRAND_MANAGER_ERA115_ROUTE).toBe("/dashboard/enterprise/virtual-brand");
    expect(VIRTUAL_BRAND_MANAGER_ERA115_PROVISION_TARGET_MINUTES).toBe(5);
    expect(VIRTUAL_BRAND_MANAGER_ERA115_TEMPLATES).toHaveLength(4);
  });

  it("aligns era115 with canonical virtual brand policy", () => {
    expect(VIRTUAL_BRAND_MANAGER_ERA115_CANONICAL_POLICY_ID).toBe(VIRTUAL_BRAND_POLICY_ID);
  });

  it("audits in-repo Virtual Brand Manager wiring", () => {
    const audit = auditVirtualBrandManagerSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of VIRTUAL_BRAND_MANAGER_ERA115_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes 5-minute provision template menu storefront wiring", () => {
    const service = readFileSync(join(ROOT, VIRTUAL_BRAND_MANAGER_ERA115_SERVICE), "utf8");
    expect(service).toContain("loadVirtualBrandManagerDashboard");
    expect(service).toContain("provisionVirtualBrand");

    const builders = readFileSync(
      join(ROOT, "lib/enterprise/virtual-brand-builders.ts"),
      "utf8",
    );
    expect(builders).toContain("buildVirtualBrandProvisionSteps");
    expect(builders).toContain("buildVirtualBrandTemplateCards");

    const panel = readFileSync(
      join(ROOT, "components/enterprise/virtual-brand-manager-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("virtual-brand-manager-panel");
    expect(panel).toContain("Virtual Brand Manager");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveVirtualBrandManagerSmokeEra115ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveVirtualBrandManagerSmokeEra115ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildVirtualBrandManagerSmokeEra115Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.provisionTargetMinutes).toBe(5);
    expect(summary.templates).toContain("ghost_kitchen");
  });
});
