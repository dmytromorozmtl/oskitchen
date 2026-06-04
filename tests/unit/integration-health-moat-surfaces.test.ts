import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  INTEGRATION_HEALTH_DASHBOARD_PAGE,
  INTEGRATION_HEALTH_DASHBOARD_PAGE_MARKERS,
  INTEGRATION_HEALTH_HOME_MARKERS,
  INTEGRATION_HEALTH_HOME_PAGE,
  INTEGRATION_HEALTH_LANDING_COMPONENT,
  INTEGRATION_HEALTH_LANDING_MARKERS,
  INTEGRATION_HEALTH_STRIP_COMPONENT,
  INTEGRATION_HEALTH_STRIP_MARKERS,
} from "@/lib/execution/integration-health-moat-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

/**
 * FINAL-18 / DES-08 / MKT-06 — Integration Health strip + landing + dashboard page moat.
 */
describe("integration health moat surfaces — FINAL-18", () => {
  it("polished IntegrationHealthStrip for Today Command Center", () => {
    const source = readSource(INTEGRATION_HEALTH_STRIP_COMPONENT);
    for (const marker of INTEGRATION_HEALTH_STRIP_MARKERS) {
      expect(source, `strip missing: ${marker}`).toContain(marker);
    }
    expect(source).toContain("export function IntegrationHealthStrip");
    expect(source).toContain("data-testid=\"pilot-integration-beta-env-footnote\"");
  });

  it("landing moat explains PASS / SKIPPED / FAILED honesty", () => {
    const source = readSource(INTEGRATION_HEALTH_LANDING_COMPONENT);
    for (const marker of INTEGRATION_HEALTH_LANDING_MARKERS) {
      expect(source, `landing missing: ${marker}`).toContain(marker);
    }
    expect(source).toContain("export function LandingIntegrationHealthMoat");
  });

  it("home page wires LandingIntegrationHealthMoat after hero", () => {
    const source = readSource(INTEGRATION_HEALTH_HOME_PAGE);
    for (const marker of INTEGRATION_HEALTH_HOME_MARKERS) {
      expect(source, `home missing: ${marker}`).toContain(marker);
    }
  });

  it("dashboard integration health page is present", () => {
    const path = join(ROOT, INTEGRATION_HEALTH_DASHBOARD_PAGE);
    expect(existsSync(path)).toBe(true);
    const source = readSource(INTEGRATION_HEALTH_DASHBOARD_PAGE);
    for (const marker of INTEGRATION_HEALTH_DASHBOARD_PAGE_MARKERS) {
      expect(source, `dashboard page missing: ${marker}`).toContain(marker);
    }
  });

  it("pilot shim re-exports IntegrationHealthStrip", () => {
    const shim = readSource("components/dashboard/pilot-integration-health-strip.tsx");
    expect(shim).toContain("@/components/dashboard/integration-health-strip");
    expect(shim).toContain("PilotIntegrationHealthStrip");
  });
});
