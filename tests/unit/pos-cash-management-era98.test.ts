import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  POS_CASH_MANAGEMENT_ERA98_POLICY_ID,
  POS_CASH_MANAGEMENT_ERA98_ROUTE,
  POS_CASH_MANAGEMENT_ERA98_SUMMARY_ARTIFACT,
  POS_CASH_MANAGEMENT_ERA98_WIRING_PATHS,
  POS_CASH_MANAGEMENT_ERA98_WORKFLOW_STEPS,
} from "@/lib/pos/pos-cash-management-era98-policy";
import {
  auditPosCashManagementSmokeWiring,
  buildPosCashManagementSmokeEra98Summary,
  resolvePosCashManagementSmokeEra98ProofStatus,
} from "@/lib/pos/pos-cash-management-smoke-summary";
import {
  POS_CASH_MANAGEMENT_ROUTE,
  POS_CASH_MANAGEMENT_STEPS,
} from "@/lib/pos/pos-cash-management";

const ROOT = process.cwd();

describe("pos cash management era98", () => {
  it("locks era98 policy and artifact path", () => {
    expect(POS_CASH_MANAGEMENT_ERA98_POLICY_ID).toBe("era98-pos-cash-management-v1");
    expect(POS_CASH_MANAGEMENT_ERA98_SUMMARY_ARTIFACT).toBe(
      "artifacts/pos-cash-management-smoke-summary.json",
    );
    expect(POS_CASH_MANAGEMENT_ERA98_ROUTE).toBe("/dashboard/pos/cash");
    expect(POS_CASH_MANAGEMENT_ERA98_WORKFLOW_STEPS).toEqual([
      "open",
      "count",
      "close",
      "report",
    ]);
  });

  it("aligns era98 workflow with canonical cash management module", () => {
    expect(POS_CASH_MANAGEMENT_ROUTE).toBe(POS_CASH_MANAGEMENT_ERA98_ROUTE);
    expect(POS_CASH_MANAGEMENT_STEPS).toEqual(POS_CASH_MANAGEMENT_ERA98_WORKFLOW_STEPS);
  });

  it("audits in-repo POS Cash Management wiring", () => {
    const audit = auditPosCashManagementSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of POS_CASH_MANAGEMENT_ERA98_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes open → count → close → report panels in client", () => {
    const client = readFileSync(
      join(ROOT, "components/pos/pos-cash-management-client.tsx"),
      "utf8",
    );
    expect(client).toContain("pos-cash-open-panel");
    expect(client).toContain("pos-cash-count-panel");
    expect(client).toContain("pos-cash-close-panel");
    expect(client).toContain("pos-cash-report-panel");
    expect(client).toContain("buildCashCloseReport");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolvePosCashManagementSmokeEra98ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolvePosCashManagementSmokeEra98ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildPosCashManagementSmokeEra98Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.workflowSteps).toEqual(["open", "count", "close", "report"]);
  });
});
