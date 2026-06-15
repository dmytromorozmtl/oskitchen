import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { KDS_MANAGER_VIEW_ERA102_POLICY_ID } from "@/lib/kitchen/kds-manager-view-era102-policy";
import {
  KDS_MANAGER_VIEW_ERA177_CANONICAL_POLICY_ID,
  KDS_MANAGER_VIEW_ERA177_CAPABILITIES,
  KDS_MANAGER_VIEW_ERA177_PILLARS,
  KDS_MANAGER_VIEW_ERA177_POLICY_ID,
  KDS_MANAGER_VIEW_ERA177_ROUTE,
  KDS_MANAGER_VIEW_ERA177_SUMMARY_ARTIFACT,
  KDS_MANAGER_VIEW_ERA177_WIRING_PATHS,
} from "@/lib/kitchen/kds-manager-view-era177-policy";
import {
  auditKdsManagerViewSmokeEra177Wiring,
  buildKdsManagerViewSmokeEra177Summary,
  resolveKdsManagerViewSmokeEra177ProofStatus,
} from "@/lib/kitchen/kds-manager-view-era177-smoke-summary";
import {
  KDS_MANAGER_VIEW_POLICY_ID,
  KDS_MANAGER_VIEW_ROUTE,
} from "@/lib/kitchen/kds-manager-view-policy";

const ROOT = process.cwd();

describe("kds manager view era177", () => {
  it("locks era177 policy and artifact path", () => {
    expect(KDS_MANAGER_VIEW_ERA177_POLICY_ID).toBe("era177-kds-manager-view-v1");
    expect(KDS_MANAGER_VIEW_ERA177_SUMMARY_ARTIFACT).toBe(
      "artifacts/kds-manager-view-era177-smoke-summary.json",
    );
    expect(KDS_MANAGER_VIEW_ERA177_ROUTE).toBe("/dashboard/kitchen/manager");
    expect(KDS_MANAGER_VIEW_ERA177_PILLARS).toEqual(["performance", "delays", "efficiency"]);
    expect(KDS_MANAGER_VIEW_ERA177_WIRING_PATHS).toHaveLength(5);
    expect(KDS_MANAGER_VIEW_ERA177_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era177 with canonical KDS Manager View policy", () => {
    expect(KDS_MANAGER_VIEW_ERA177_CANONICAL_POLICY_ID).toBe(KDS_MANAGER_VIEW_ERA102_POLICY_ID);
    expect(KDS_MANAGER_VIEW_POLICY_ID).toBe("kds-manager-view-v1");
    expect(KDS_MANAGER_VIEW_ROUTE).toBe(KDS_MANAGER_VIEW_ERA177_ROUTE);
  });

  it("audits in-repo KDS Manager View Round 2 wiring", () => {
    const audit = auditKdsManagerViewSmokeEra177Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of KDS_MANAGER_VIEW_ERA177_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes performance, delays, and efficiency panels in manager client", () => {
    const client = readFileSync(
      join(ROOT, "components/kitchen/manager-view-client.tsx"),
      "utf8",
    );
    expect(client).toContain("kds-manager-view-root");
    expect(client).toContain("kds-manager-delays-panel");
    expect(client).toContain("kds-manager-efficiency-panel");
    expect(client).toContain("kds-manager-efficiency-score");
    expect(client).toContain("kds-manager-alerts");

    const core = readFileSync(join(ROOT, "lib/kitchen/kds-manager-view.ts"), "utf8");
    expect(core).toContain("buildKdsManagerViewSnapshot");
    expect(core).toContain("efficiencyScore");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveKdsManagerViewSmokeEra177ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveKdsManagerViewSmokeEra177ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildKdsManagerViewSmokeEra177Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.pillars).toEqual(["performance", "delays", "efficiency"]);
    expect(summary.capabilities).toContain("performance_metrics");
    expect(summary.capabilities).toContain("manager_alerts");
  });
});
