import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditIntegrationHealthCenterProductWiring } from "@/lib/integrations/integration-health-center-product-audit";
import {
  INTEGRATION_HEALTH_CENTER_DASHBOARD_ROUTE,
  INTEGRATION_HEALTH_CENTER_PRODUCT_ABSOLUTE_FINAL_POLICY_ID,
  INTEGRATION_HEALTH_CENTER_PRODUCT_CI_SCRIPTS,
  INTEGRATION_HEALTH_CENTER_PRODUCT_FEATURE_MODULES,
  INTEGRATION_HEALTH_CENTER_PRODUCT_ROUTE,
  INTEGRATION_HEALTH_CENTER_PRODUCT_UNIT_TEST,
} from "@/lib/integrations/integration-health-center-product-absolute-final-policy";
import {
  INTEGRATION_HEALTH_CENTER_PRODUCT_FEATURES,
  INTEGRATION_HEALTH_CENTER_PRODUCT_HEADLINE,
} from "@/lib/integrations/integration-health-center-product-content";

const ROOT = process.cwd();

describe("Integration Health Center product page (Absolute Final Task 70)", () => {
  it("locks absolute final policy with six feature modules", () => {
    expect(INTEGRATION_HEALTH_CENTER_PRODUCT_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "integration-health-center-product-absolute-final-v1",
    );
    expect(INTEGRATION_HEALTH_CENTER_PRODUCT_ROUTE).toBe("/product/integration-health-center");
    expect(INTEGRATION_HEALTH_CENTER_DASHBOARD_ROUTE).toBe("/dashboard/integration-health");
    expect(INTEGRATION_HEALTH_CENTER_PRODUCT_FEATURE_MODULES).toHaveLength(6);
  });

  it("defines six product features with dashboard paths", () => {
    expect(INTEGRATION_HEALTH_CENTER_PRODUCT_FEATURES).toHaveLength(6);
    expect(INTEGRATION_HEALTH_CENTER_PRODUCT_FEATURES.map((f) => f.id)).toEqual([
      "health_score",
      "predictive_alerts",
      "recovery_playbooks",
      "maturity_matrix",
      "live_proof_smoke",
      "hardware_device_fleet",
    ]);
    expect(INTEGRATION_HEALTH_CENTER_PRODUCT_HEADLINE.length).toBeGreaterThan(20);
  });

  it("renders product page with honesty markers", () => {
    const component = readFileSync(
      join(ROOT, "components/product/integration-health-center-product-page.tsx"),
      "utf8",
    );
    expect(component).toContain("Integration Health Center");
    expect(component).toContain("SKIPPED");
    expect(component).toContain("INTEGRATION_HEALTH_CENTER_PRODUCT_ABSOLUTE_FINAL_POLICY_ID");
    expect(component).toContain("ihc-product-feature-");
    expect(component).toContain("not guaranteed uptime");
  });

  it("passes wiring audit", () => {
    const audit = auditIntegrationHealthCenterProductWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.featureCount).toBe(6);
  });

  it("ships npm cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of INTEGRATION_HEALTH_CENTER_PRODUCT_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(INTEGRATION_HEALTH_CENTER_PRODUCT_UNIT_TEST).toBe(
      "tests/unit/integration-health-center-product-absolute-final.test.ts",
    );
  });
});
