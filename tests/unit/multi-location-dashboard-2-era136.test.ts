import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  MULTI_LOCATION_DASHBOARD_2_ERA136_CANONICAL_POLICY_ID,
  MULTI_LOCATION_DASHBOARD_2_ERA136_CAPABILITIES,
  MULTI_LOCATION_DASHBOARD_2_ERA136_POLICY_ID,
  MULTI_LOCATION_DASHBOARD_2_ERA136_ROUTE,
  MULTI_LOCATION_DASHBOARD_2_ERA136_SCALE_THRESHOLD,
  MULTI_LOCATION_DASHBOARD_2_ERA136_SERVICE,
  MULTI_LOCATION_DASHBOARD_2_ERA136_SUMMARY_ARTIFACT,
  MULTI_LOCATION_DASHBOARD_2_ERA136_WIRING_PATHS,
} from "@/lib/enterprise/multi-location-dashboard-2-era136-policy";
import {
  auditMultiLocationDashboard2SmokeWiring,
  buildMultiLocationDashboard2SmokeEra136Summary,
  resolveMultiLocationDashboard2SmokeEra136ProofStatus,
} from "@/lib/enterprise/multi-location-dashboard-2-smoke-summary";
import {
  buildEnterpriseMultiLocationDashboardV2,
  resolveMultiLocationScaleTier,
} from "@/lib/enterprise/multi-location-dashboard-2-builders";
import { MULTI_LOCATION_DASHBOARD_2_POLICY_ID } from "@/lib/enterprise/multi-location-dashboard-2-policy";

const ROOT = process.cwd();

describe("multi-location dashboard 2 era136", () => {
  it("locks era136 policy and artifact path", () => {
    expect(MULTI_LOCATION_DASHBOARD_2_ERA136_POLICY_ID).toBe(
      "era136-multi-location-dashboard-2-v1",
    );
    expect(MULTI_LOCATION_DASHBOARD_2_ERA136_SUMMARY_ARTIFACT).toBe(
      "artifacts/multi-location-dashboard-2-smoke-summary.json",
    );
    expect(MULTI_LOCATION_DASHBOARD_2_ERA136_ROUTE).toBe(
      "/dashboard/enterprise/multi-location",
    );
    expect(MULTI_LOCATION_DASHBOARD_2_ERA136_SCALE_THRESHOLD).toBe(100);
    expect(MULTI_LOCATION_DASHBOARD_2_ERA136_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era136 with canonical multi-location dashboard 2 policy", () => {
    expect(MULTI_LOCATION_DASHBOARD_2_ERA136_CANONICAL_POLICY_ID).toBe(
      MULTI_LOCATION_DASHBOARD_2_POLICY_ID,
    );
  });

  it("audits in-repo Multi-Location Dashboard 2.0 wiring", () => {
    const audit = auditMultiLocationDashboard2SmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of MULTI_LOCATION_DASHBOARD_2_ERA136_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes 100+ pagination comparison drill-down wiring", () => {
    const service = readFileSync(join(ROOT, MULTI_LOCATION_DASHBOARD_2_ERA136_SERVICE), "utf8");
    expect(service).toContain("parseMultiLocationDashboard2ViewState");
    expect(service).toContain("compareA");

    const panel = readFileSync(
      join(ROOT, "components/enterprise/multi-location-enterprise-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("enterprise-multi-location-panel");
    expect(panel).toContain("Revenue ranking");

    expect(resolveMultiLocationScaleTier(150)).toBe("enterprise");
    const v2 = buildEnterpriseMultiLocationDashboardV2({
      ranks: Array.from({ length: 110 }, (_, i) => ({
        locationId: `loc-${i}`,
        locationName: `Site ${i}`,
        rank: i + 1,
        revenue: 1000,
        orders: 10,
        laborPct: 25,
        foodCostPct: 30,
        revenueShare: 1,
        vsAvgRevenue: null,
        vsAvgLaborPct: null,
        vsAvgFoodCostPct: null,
      })),
      totalLocations: 110,
      viewState: {},
    });
    expect(v2.supportsHundredPlus).toBe(true);
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveMultiLocationDashboard2SmokeEra136ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveMultiLocationDashboard2SmokeEra136ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildMultiLocationDashboard2SmokeEra136Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("comparison");
  });
});
