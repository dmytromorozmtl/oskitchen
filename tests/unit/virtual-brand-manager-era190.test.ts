import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  VIRTUAL_BRAND_MANAGER_ERA115_POLICY_ID,
} from "@/lib/enterprise/virtual-brand-manager-era115-policy";
import {
  VIRTUAL_BRAND_MANAGER_ERA190_CANONICAL_POLICY_ID,
  VIRTUAL_BRAND_MANAGER_ERA190_POLICY_ID,
  VIRTUAL_BRAND_MANAGER_ERA190_PROVISION_TARGET_MINUTES,
  VIRTUAL_BRAND_MANAGER_ERA190_ROUTE,
  VIRTUAL_BRAND_MANAGER_ERA190_SERVICE,
  VIRTUAL_BRAND_MANAGER_ERA190_SUMMARY_ARTIFACT,
  VIRTUAL_BRAND_MANAGER_ERA190_TEMPLATES,
  VIRTUAL_BRAND_MANAGER_ERA190_WIRING_PATHS,
} from "@/lib/enterprise/virtual-brand-manager-era190-policy";
import {
  auditVirtualBrandManagerSmokeEra190Wiring,
  buildVirtualBrandManagerSmokeEra190Summary,
  resolveVirtualBrandManagerSmokeEra190ProofStatus,
} from "@/lib/enterprise/virtual-brand-manager-era190-smoke-summary";
import {
  VIRTUAL_BRAND_POLICY_ID,
  VIRTUAL_BRAND_SERVICE,
} from "@/lib/enterprise/virtual-brand-policy";

const ROOT = process.cwd();

describe("virtual brand manager era190", () => {
  it("locks era190 policy and artifact path", () => {
    expect(VIRTUAL_BRAND_MANAGER_ERA190_POLICY_ID).toBe("era190-virtual-brand-manager-v1");
    expect(VIRTUAL_BRAND_MANAGER_ERA190_SUMMARY_ARTIFACT).toBe(
      "artifacts/virtual-brand-manager-era190-smoke-summary.json",
    );
    expect(VIRTUAL_BRAND_MANAGER_ERA190_ROUTE).toBe("/dashboard/enterprise/virtual-brand");
    expect(VIRTUAL_BRAND_MANAGER_ERA190_WIRING_PATHS).toHaveLength(6);
    expect(VIRTUAL_BRAND_MANAGER_ERA190_PROVISION_TARGET_MINUTES).toBe(5);
    expect(VIRTUAL_BRAND_MANAGER_ERA190_TEMPLATES).toHaveLength(4);
  });

  it("aligns era190 with canonical Virtual Brand Manager policy", () => {
    expect(VIRTUAL_BRAND_MANAGER_ERA190_CANONICAL_POLICY_ID).toBe(
      VIRTUAL_BRAND_MANAGER_ERA115_POLICY_ID,
    );
    expect(VIRTUAL_BRAND_MANAGER_ERA190_SERVICE).toBe(VIRTUAL_BRAND_SERVICE);
    expect(VIRTUAL_BRAND_POLICY_ID).toBe("enterprise-virtual-brand-v1");
  });

  it("audits in-repo Virtual Brand Manager Round 2 wiring", () => {
    const audit = auditVirtualBrandManagerSmokeEra190Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of VIRTUAL_BRAND_MANAGER_ERA190_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes 5-minute provision template menu storefront wiring", () => {
    const service = readFileSync(join(ROOT, VIRTUAL_BRAND_MANAGER_ERA190_SERVICE), "utf8");
    expect(service).toContain("loadVirtualBrandManagerDashboard");
    expect(service).toContain("provisionVirtualBrand");
    expect(service).toContain("buildVirtualBrandProvisionResult");

    const builders = readFileSync(
      join(ROOT, "lib/enterprise/virtual-brand-builders.ts"),
      "utf8",
    );
    expect(builders).toContain("buildVirtualBrandProvisionSteps");
    expect(builders).toContain("buildVirtualBrandTemplateCards");
    expect(builders).toContain("buildVirtualBrandManagerDashboard");

    const action = readFileSync(join(ROOT, "actions/virtual-brand.ts"), "utf8");
    expect(action).toContain("provisionVirtualBrandQuick");

    const panel = readFileSync(
      join(ROOT, "components/enterprise/virtual-brand-manager-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("virtual-brand-manager-panel");
    expect(panel).toContain("Virtual Brand Manager");
    expect(panel).toContain("provisionTargetMinutes");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveVirtualBrandManagerSmokeEra190ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveVirtualBrandManagerSmokeEra190ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildVirtualBrandManagerSmokeEra190Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.provisionTargetMinutes).toBe(5);
    expect(summary.templates).toContain("ghost_kitchen");
    expect(summary.templates).toContain("cloud_kitchen");
    expect(summary.templates).toContain("meal_prep");
    expect(summary.templates).toContain("catering");
  });
});
