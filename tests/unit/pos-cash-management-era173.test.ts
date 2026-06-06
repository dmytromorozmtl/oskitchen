import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  POS_CASH_MANAGEMENT_ROUTE,
  POS_CASH_MANAGEMENT_STEPS,
} from "@/lib/pos/pos-cash-management";
import { POS_CASH_MANAGEMENT_ERA98_POLICY_ID } from "@/lib/pos/pos-cash-management-era98-policy";
import {
  POS_CASH_MANAGEMENT_ERA173_CANONICAL_POLICY_ID,
  POS_CASH_MANAGEMENT_ERA173_CAPABILITIES,
  POS_CASH_MANAGEMENT_ERA173_POLICY_ID,
  POS_CASH_MANAGEMENT_ERA173_ROUTE,
  POS_CASH_MANAGEMENT_ERA173_SUMMARY_ARTIFACT,
  POS_CASH_MANAGEMENT_ERA173_WIRING_PATHS,
  POS_CASH_MANAGEMENT_ERA173_WORKFLOW_STEPS,
} from "@/lib/pos/pos-cash-management-era173-policy";
import {
  auditPosCashManagementSmokeEra173Wiring,
  buildPosCashManagementSmokeEra173Summary,
  resolvePosCashManagementSmokeEra173ProofStatus,
} from "@/lib/pos/pos-cash-management-era173-smoke-summary";

const ROOT = process.cwd();

describe("pos cash management era173", () => {
  it("locks era173 policy and artifact path", () => {
    expect(POS_CASH_MANAGEMENT_ERA173_POLICY_ID).toBe("era173-pos-cash-management-v1");
    expect(POS_CASH_MANAGEMENT_ERA173_SUMMARY_ARTIFACT).toBe(
      "artifacts/pos-cash-management-era173-smoke-summary.json",
    );
    expect(POS_CASH_MANAGEMENT_ERA173_ROUTE).toBe("/dashboard/pos/cash");
    expect(POS_CASH_MANAGEMENT_ERA173_WORKFLOW_STEPS).toEqual([
      "open",
      "count",
      "close",
      "report",
    ]);
    expect(POS_CASH_MANAGEMENT_ERA173_WIRING_PATHS).toHaveLength(7);
    expect(POS_CASH_MANAGEMENT_ERA173_CAPABILITIES).toHaveLength(4);
  });

  it("aligns era173 with canonical POS Cash Management policy", () => {
    expect(POS_CASH_MANAGEMENT_ERA173_CANONICAL_POLICY_ID).toBe(
      POS_CASH_MANAGEMENT_ERA98_POLICY_ID,
    );
    expect(POS_CASH_MANAGEMENT_ROUTE).toBe(POS_CASH_MANAGEMENT_ERA173_ROUTE);
    expect(POS_CASH_MANAGEMENT_STEPS).toEqual(POS_CASH_MANAGEMENT_ERA173_WORKFLOW_STEPS);
  });

  it("audits in-repo POS Cash Management Round 2 wiring", () => {
    const audit = auditPosCashManagementSmokeEra173Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of POS_CASH_MANAGEMENT_ERA173_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes open → count → close → report workflow wiring", () => {
    const client = readFileSync(
      join(ROOT, "components/pos/pos-cash-management-client.tsx"),
      "utf8",
    );
    expect(client).toContain("pos-cash-open-panel");
    expect(client).toContain("pos-cash-count-panel");
    expect(client).toContain("pos-cash-close-panel");
    expect(client).toContain("pos-cash-report-panel");

    const policy = readFileSync(join(ROOT, "lib/pos/pos-cash-management.ts"), "utf8");
    expect(policy).toContain("buildCashCloseReport");

    const page = readFileSync(join(ROOT, "app/dashboard/pos/cash/page.tsx"), "utf8");
    expect(page).toContain("PosCashManagementClient");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePosCashManagementSmokeEra173ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePosCashManagementSmokeEra173ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPosCashManagementSmokeEra173Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.workflowSteps).toEqual(["open", "count", "close", "report"]);
    expect(summary.capabilities).toContain("open_float");
    expect(summary.capabilities).toContain("close_report");
  });
});
