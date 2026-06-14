import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_ARTIFACT,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_CHECK_NPM_SCRIPT,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_CI_NPM_SCRIPT,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_CI_WORKFLOW,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_COUNTER_TEST_ID,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_DASHBOARD_COMPONENT,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_DASHBOARD_TEST_ID,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_DOC,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_HOME_PAGE,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_IHC_ROUTE,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_LANDING_COMPONENT,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_POLICY_ID,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_TEST_ID,
  INTEGRATION_HEALTH_CENTER_HERO_P1_22_WIRING_PATHS,
} from "@/lib/marketing/integration-health-center-hero-p1-22-policy";
import {
  countSyncHealthMarketingMaturity,
  SYNC_HEALTH_DASHBOARD_MARKETING_CHANNELS,
} from "@/lib/marketing/sync-health-dashboard-marketing-content";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Integration Health Center hero section (P1-22)", () => {
  it("locks P1-22 policy id and maturity counter matches channel matrix", () => {
    expect(INTEGRATION_HEALTH_CENTER_HERO_P1_22_POLICY_ID).toBe(
      "integration-health-center-hero-p1-22-v1",
    );

    const counts = countSyncHealthMarketingMaturity();
    expect(counts.total).toBe(SYNC_HEALTH_DASHBOARD_MARKETING_CHANNELS.length);
    expect(counts.live).toBeGreaterThan(0);
    expect(counts.live + counts.beta + counts.skipped + counts.setupReady).toBe(counts.total);
  });

  it("homepage wires LandingIntegrationHealthMoat after hero", () => {
    const home = readSource(INTEGRATION_HEALTH_CENTER_HERO_P1_22_HOME_PAGE);
    expect(home).toContain("LandingIntegrationHealthMoat");
    expect(home).toContain("afterHero");
  });

  it("landing moat exposes hero test id, live counter, and embedded dashboard", () => {
    const landing = readSource(INTEGRATION_HEALTH_CENTER_HERO_P1_22_LANDING_COMPONENT);
    expect(landing).toContain("INTEGRATION_HEALTH_CENTER_HERO_P1_22_TEST_ID");
    expect(landing).toContain("INTEGRATION_HEALTH_CENTER_HERO_P1_22_COUNTER_TEST_ID");
    expect(landing).toContain("countSyncHealthMarketingMaturity");
    expect(landing).toContain("SyncHealthDashboardMarketing");
    expect(landing).toContain(INTEGRATION_HEALTH_CENTER_HERO_P1_22_IHC_ROUTE);
    expect(landing).toContain("export function LandingIntegrationHealthMoat");
  });

  it("dashboard marketing component exposes sync health test id", () => {
    const dashboard = readSource(INTEGRATION_HEALTH_CENTER_HERO_P1_22_DASHBOARD_COMPONENT);
    expect(dashboard).toContain(`data-testid="${INTEGRATION_HEALTH_CENTER_HERO_P1_22_DASHBOARD_TEST_ID}"`);
    expect(dashboard).toContain("export function SyncHealthDashboardMarketing");
  });

  it("P1-22 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of INTEGRATION_HEALTH_CENTER_HERO_P1_22_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${INTEGRATION_HEALTH_CENTER_HERO_P1_22_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${INTEGRATION_HEALTH_CENTER_HERO_P1_22_CI_NPM_SCRIPT}"`);

    const ci = readSource(INTEGRATION_HEALTH_CENTER_HERO_P1_22_CI_WORKFLOW);
    expect(ci).toContain(INTEGRATION_HEALTH_CENTER_HERO_P1_22_CHECK_NPM_SCRIPT);

    const doc = readSource(INTEGRATION_HEALTH_CENTER_HERO_P1_22_DOC);
    expect(doc).toContain(INTEGRATION_HEALTH_CENTER_HERO_P1_22_POLICY_ID);

    const artifact = JSON.parse(readSource(INTEGRATION_HEALTH_CENTER_HERO_P1_22_ARTIFACT));
    expect(artifact.policyId).toBe(INTEGRATION_HEALTH_CENTER_HERO_P1_22_POLICY_ID);
    expect(artifact.heroTestId).toBe(INTEGRATION_HEALTH_CENTER_HERO_P1_22_TEST_ID);
  });
});
