import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditRestaurantIntegrationHealthLandingP3_63,
  formatRestaurantIntegrationHealthLandingP3_63AuditLines,
} from "@/lib/marketing/restaurant-integration-health-landing-p3-63-audit";
import { validateRestaurantIntegrationHealthLandingContract } from "@/lib/marketing/restaurant-integration-health-landing-p3-63-measurement";
import {
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_AUDIT_SCRIPT,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_CANONICAL_PATH,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_CHECK_NPM_SCRIPT,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_DOC,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_NPM_SCRIPT,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_NPM_SCRIPTS,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_POLICY_ID,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_PRIMARY_KEYWORD,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_UNIT_TEST,
  restaurantIntegrationHealthLandingPathsAligned,
} from "@/lib/marketing/restaurant-integration-health-landing-p3-63-policy";

const ROOT = process.cwd();

describe("Restaurant integration health landing (P3-63)", () => {
  it("locks canonical /restaurant-integration-health path", () => {
    expect(RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_POLICY_ID).toBe(
      "restaurant-integration-health-landing-p3-63-v1",
    );
    expect(RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_CANONICAL_PATH).toBe(
      "/restaurant-integration-health",
    );
    expect(RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_PRIMARY_KEYWORD).toBe(
      "restaurant integration health",
    );
    expect(restaurantIntegrationHealthLandingPathsAligned()).toBe(true);
  });

  it("validates restaurant integration health landing contract", () => {
    const validation = validateRestaurantIntegrationHealthLandingContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.pathsAligned).toBe(true);
    expect(validation.sitemapWired).toBe(true);
    expect(validation.salesPageCrossLink).toBe(true);
  });

  it("passes full restaurant integration health landing audit", () => {
    const summary = auditRestaurantIntegrationHealthLandingP3_63(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.canonicalPathWired).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatRestaurantIntegrationHealthLandingP3_63AuditLines(summary).length).toBeGreaterThan(
      5,
    );
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_DOC))).toBe(true);
    expect(existsSync(join(ROOT, RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_AUDIT_SCRIPT))).toBe(
      true,
    );
    expect(existsSync(join(ROOT, RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_NPM_SCRIPT]).toContain(
      "audit-restaurant-integration-health-landing-p3-63.ts",
    );
    expect(pkg.scripts?.[RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_CHECK_NPM_SCRIPT]).toContain(
      RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_UNIT_TEST,
    );
    for (const script of RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
