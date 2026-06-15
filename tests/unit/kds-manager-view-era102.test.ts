import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KDS_MANAGER_VIEW_ERA102_PILLARS,
  KDS_MANAGER_VIEW_ERA102_POLICY_ID,
  KDS_MANAGER_VIEW_ERA102_ROUTE,
  KDS_MANAGER_VIEW_ERA102_SUMMARY_ARTIFACT,
  KDS_MANAGER_VIEW_ERA102_WIRING_PATHS,
} from "@/lib/kitchen/kds-manager-view-era102-policy";
import {
  auditKdsManagerViewSmokeWiring,
  buildKdsManagerViewSmokeEra102Summary,
  resolveKdsManagerViewSmokeEra102ProofStatus,
} from "@/lib/kitchen/kds-manager-view-smoke-summary";
import {
  KDS_MANAGER_VIEW_POLICY_ID,
  KDS_MANAGER_VIEW_ROUTE,
} from "@/lib/kitchen/kds-manager-view-policy";

const ROOT = process.cwd();

describe("kds manager view era102", () => {
  it("locks era102 policy and artifact path", () => {
    expect(KDS_MANAGER_VIEW_ERA102_POLICY_ID).toBe("era102-kds-manager-view-v1");
    expect(KDS_MANAGER_VIEW_ERA102_SUMMARY_ARTIFACT).toBe(
      "artifacts/kds-manager-view-smoke-summary.json",
    );
    expect(KDS_MANAGER_VIEW_ERA102_ROUTE).toBe("/dashboard/kitchen/manager");
    expect(KDS_MANAGER_VIEW_ERA102_PILLARS).toEqual(["performance", "delays", "efficiency"]);
  });

  it("aligns era102 route with canonical manager view policy", () => {
    expect(KDS_MANAGER_VIEW_POLICY_ID).toBe("kds-manager-view-v1");
    expect(KDS_MANAGER_VIEW_ROUTE).toBe(KDS_MANAGER_VIEW_ERA102_ROUTE);
  });

  it("audits in-repo KDS Manager View wiring", () => {
    const audit = auditKdsManagerViewSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of KDS_MANAGER_VIEW_ERA102_WIRING_PATHS) {
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
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveKdsManagerViewSmokeEra102ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveKdsManagerViewSmokeEra102ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildKdsManagerViewSmokeEra102Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.pillars).toEqual(["performance", "delays", "efficiency"]);
  });
});
