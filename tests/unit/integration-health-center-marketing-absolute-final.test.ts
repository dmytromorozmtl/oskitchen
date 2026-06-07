import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditIntegrationHealthCenterMarketingWiring } from "@/lib/marketing/integration-health-center-marketing-audit";
import {
  INTEGRATION_HEALTH_CENTER_MARKETING_META,
  INTEGRATION_HEALTH_CENTER_MARKETING_PATH,
  getIntegrationHealthCenterMarketingFeatures,
} from "@/lib/marketing/integration-health-center-marketing-content";
import {
  INTEGRATION_HEALTH_CENTER_DASHBOARD_ROUTE,
  INTEGRATION_HEALTH_CENTER_MARKETING_ABSOLUTE_FINAL_POLICY_ID,
  INTEGRATION_HEALTH_CENTER_MARKETING_CI_SCRIPTS,
  INTEGRATION_HEALTH_CENTER_MARKETING_ROUTE,
  INTEGRATION_HEALTH_CENTER_MARKETING_UNIT_TEST,
  INTEGRATION_HEALTH_CENTER_PRODUCT_ROUTE,
} from "@/lib/marketing/integration-health-center-marketing-absolute-final-policy";

const ROOT = process.cwd();

describe("Integration Health Center marketing page (Absolute Final Task 80)", () => {
  it("locks absolute final policy and standalone marketing route", () => {
    expect(INTEGRATION_HEALTH_CENTER_MARKETING_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "integration-health-center-marketing-absolute-final-v1",
    );
    expect(INTEGRATION_HEALTH_CENTER_MARKETING_ROUTE).toBe("/integration-health-center");
    expect(INTEGRATION_HEALTH_CENTER_MARKETING_PATH).toBe("/integration-health-center");
    expect(INTEGRATION_HEALTH_CENTER_PRODUCT_ROUTE).toBe("/product/integration-health-center");
    expect(INTEGRATION_HEALTH_CENTER_DASHBOARD_ROUTE).toBe("/dashboard/integration-health");
  });

  it("ships SEO metadata for integration monitoring keywords", () => {
    expect(INTEGRATION_HEALTH_CENTER_MARKETING_META.keywords).toContain(
      "integration health dashboard",
    );
    expect(INTEGRATION_HEALTH_CENTER_MARKETING_META.title.toLowerCase()).toContain(
      "integration health",
    );
  });

  it("reuses six product feature modules on marketing page", () => {
    expect(getIntegrationHealthCenterMarketingFeatures()).toHaveLength(6);
  });

  it("passes wiring audit", () => {
    const audit = auditIntegrationHealthCenterMarketingWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of INTEGRATION_HEALTH_CENTER_MARKETING_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(INTEGRATION_HEALTH_CENTER_MARKETING_UNIT_TEST).toBe(
      "tests/unit/integration-health-center-marketing-absolute-final.test.ts",
    );
  });
});
