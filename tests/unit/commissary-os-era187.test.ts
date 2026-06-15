import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { COMMISSARY_OS_ERA112_POLICY_ID } from "@/lib/enterprise/commissary-os-era112-policy";
import {
  COMMISSARY_OS_ERA187_CANONICAL_POLICY_ID,
  COMMISSARY_OS_ERA187_PILLARS,
  COMMISSARY_OS_ERA187_POLICY_ID,
  COMMISSARY_OS_ERA187_ROUTE,
  COMMISSARY_OS_ERA187_SERVICE,
  COMMISSARY_OS_ERA187_SUMMARY_ARTIFACT,
  COMMISSARY_OS_ERA187_WIRING_PATHS,
} from "@/lib/enterprise/commissary-os-era187-policy";
import {
  auditCommissaryOsSmokeEra187Wiring,
  buildCommissaryOsSmokeEra187Summary,
  resolveCommissaryOsSmokeEra187ProofStatus,
} from "@/lib/enterprise/commissary-os-era187-smoke-summary";
import {
  ENTERPRISE_COMMISSARY_POLICY_ID,
  ENTERPRISE_COMMISSARY_SERVICE,
} from "@/lib/enterprise/commissary-policy";

const ROOT = process.cwd();

describe("commissary os era187", () => {
  it("locks era187 policy and artifact path", () => {
    expect(COMMISSARY_OS_ERA187_POLICY_ID).toBe("era187-commissary-os-v1");
    expect(COMMISSARY_OS_ERA187_SUMMARY_ARTIFACT).toBe(
      "artifacts/commissary-os-era187-smoke-summary.json",
    );
    expect(COMMISSARY_OS_ERA187_ROUTE).toBe("/dashboard/enterprise/commissary");
    expect(COMMISSARY_OS_ERA187_WIRING_PATHS).toHaveLength(5);
    expect(COMMISSARY_OS_ERA187_PILLARS).toHaveLength(4);
  });

  it("aligns era187 with canonical Commissary OS policy", () => {
    expect(COMMISSARY_OS_ERA187_CANONICAL_POLICY_ID).toBe(COMMISSARY_OS_ERA112_POLICY_ID);
    expect(COMMISSARY_OS_ERA187_SERVICE).toBe(ENTERPRISE_COMMISSARY_SERVICE);
    expect(ENTERPRISE_COMMISSARY_POLICY_ID).toBe("enterprise-commissary-v1");
  });

  it("audits in-repo Commissary OS Round 2 wiring", () => {
    const audit = auditCommissaryOsSmokeEra187Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of COMMISSARY_OS_ERA187_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes four-pillar production purchasing delivery distribution wiring", () => {
    const service = readFileSync(join(ROOT, COMMISSARY_OS_ERA187_SERVICE), "utf8");
    expect(service).toContain("loadEnterpriseCommissaryDashboard");
    expect(service).toContain("getProductionCalendar");
    expect(service).toContain("listTransfers");
    expect(service).toContain("loadRouteOverviewKpis");

    const builders = readFileSync(join(ROOT, "lib/enterprise/commissary-builders.ts"), "utf8");
    expect(builders).toContain("buildProductionPillar");
    expect(builders).toContain("buildPurchasingPillar");
    expect(builders).toContain("buildDeliveryPillar");
    expect(builders).toContain("buildDistributionPillar");

    const panel = readFileSync(
      join(ROOT, "components/enterprise/commissary-enterprise-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("enterprise-commissary-panel");
    expect(panel).toContain("Commissary OS");
    expect(panel).toContain("pillars.map");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveCommissaryOsSmokeEra187ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveCommissaryOsSmokeEra187ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildCommissaryOsSmokeEra187Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.pillars).toContain("production");
    expect(summary.pillars).toContain("purchasing");
    expect(summary.pillars).toContain("delivery");
    expect(summary.pillars).toContain("distribution");
  });
});
