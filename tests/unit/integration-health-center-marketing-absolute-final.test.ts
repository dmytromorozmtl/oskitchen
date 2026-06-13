import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditIntegrationHealthCenterMarketingWiring } from "@/lib/marketing/integration-health-center-marketing-audit";
import {
  INTEGRATION_HEALTH_CENTER_MARKETING_META,
  INTEGRATION_HEALTH_CENTER_MARKETING_PATH,
  INTEGRATION_HEALTH_CENTER_MARKETING_H1,
  getIntegrationHealthCenterMarketingFeatures,
} from "@/lib/marketing/integration-health-center-marketing-content";
import {
  INTEGRATION_HEALTH_CENTER_DASHBOARD_ROUTE,
  INTEGRATION_HEALTH_CENTER_MARKETING_ABSOLUTE_FINAL_POLICY_ID,
  INTEGRATION_HEALTH_CENTER_MARKETING_CI_SCRIPTS,
  INTEGRATION_HEALTH_CENTER_MARKETING_ROUTE,
  INTEGRATION_HEALTH_CENTER_MARKETING_SALES_HOOK,
  INTEGRATION_HEALTH_CENTER_MARKETING_UNIT_TEST,
  INTEGRATION_HEALTH_CENTER_PRODUCT_ROUTE,
  INTEGRATION_HEALTH_CENTER_SALES_CHECK_NPM_SCRIPT,
  INTEGRATION_HEALTH_SALES_P1_24_POLICY_ID,
} from "@/lib/marketing/integration-health-center-marketing-absolute-final-policy";
import {
  INTEGRATION_HEALTH_CENTER_SALES_HOOK,
  INTEGRATION_HEALTH_DOORDASH_FAILURE_EXAMPLES,
  INTEGRATION_HEALTH_DOORDASH_FAILURE_SECTION_TEST_ID,
} from "@/lib/marketing/integration-health-sales-p1-24-content";

const ROOT = process.cwd();

describe("Integration Health Center sales page (P1-24 + Absolute Final Task 80)", () => {
  it("locks P1-24 sales hook and standalone marketing route", () => {
    expect(INTEGRATION_HEALTH_SALES_P1_24_POLICY_ID).toBe("integration-health-sales-p1-24-v1");
    expect(INTEGRATION_HEALTH_CENTER_SALES_HOOK).toBe(
      "See exactly why your DoorDash integration failed",
    );
    expect(INTEGRATION_HEALTH_CENTER_MARKETING_SALES_HOOK).toBe(
      INTEGRATION_HEALTH_CENTER_SALES_HOOK,
    );
    expect(INTEGRATION_HEALTH_CENTER_MARKETING_H1).toBe(INTEGRATION_HEALTH_CENTER_SALES_HOOK);
    expect(INTEGRATION_HEALTH_CENTER_MARKETING_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "integration-health-center-marketing-absolute-final-v1",
    );
    expect(INTEGRATION_HEALTH_CENTER_MARKETING_ROUTE).toBe("/integration-health-center");
    expect(INTEGRATION_HEALTH_CENTER_MARKETING_PATH).toBe("/integration-health-center");
    expect(INTEGRATION_HEALTH_CENTER_PRODUCT_ROUTE).toBe("/product/integration-health-center");
    expect(INTEGRATION_HEALTH_CENTER_DASHBOARD_ROUTE).toBe("/dashboard/integration-health");
    expect(INTEGRATION_HEALTH_DOORDASH_FAILURE_EXAMPLES.length).toBeGreaterThanOrEqual(4);
  });

  it("ships SEO metadata for DoorDash integration failure keywords", () => {
    expect(INTEGRATION_HEALTH_CENTER_MARKETING_META.title.toLowerCase()).toContain("doordash");
    expect(INTEGRATION_HEALTH_CENTER_MARKETING_META.description).toContain(
      INTEGRATION_HEALTH_CENTER_SALES_HOOK,
    );
    expect(INTEGRATION_HEALTH_CENTER_MARKETING_META.keywords).toContain(
      "integration health dashboard",
    );
  });

  it("reuses six product feature modules on marketing page", () => {
    expect(getIntegrationHealthCenterMarketingFeatures()).toHaveLength(6);
  });

  it("passes wiring audit including DoorDash failure section", () => {
    const audit = auditIntegrationHealthCenterMarketingWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);

    const landing = readFileSync(
      join(ROOT, "components/marketing/integration-health-center-marketing-landing.tsx"),
      "utf8",
    );
    expect(landing).toContain("IntegrationHealthDoordashFailureSection");
    expect(landing).toContain(INTEGRATION_HEALTH_DOORDASH_FAILURE_SECTION_TEST_ID);
  });

  it("registers CI cert scripts and P1-24 check script", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of INTEGRATION_HEALTH_CENTER_MARKETING_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(pkg.scripts?.[INTEGRATION_HEALTH_CENTER_SALES_CHECK_NPM_SCRIPT]).toContain(
      INTEGRATION_HEALTH_CENTER_MARKETING_UNIT_TEST,
    );

    const archive = JSON.parse(
      readFileSync(join(ROOT, "config/npm-scripts/archive-v1.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(archive.scripts?.["test:ci:integration-health-center-marketing"]).toContain(
      INTEGRATION_HEALTH_CENTER_MARKETING_UNIT_TEST,
    );
  });
});
