import { describe, expect, it } from "vitest";

import {
  auditFinal20SalesPlaybook,
  auditSalesPlaybookHubRegistry,
  FINAL_20_SALES_PLAYBOOK_POLICY_ID,
} from "@/lib/execution/final-20-sales-playbook-audit-policy";
import {
  SALES_PLAYBOOK_RUNNER_SCRIPT,
  SALES_PLAYBOOK_SUMMARY_ARTIFACT,
  SALES_PLAYBOOK_VITEST_SPEC,
} from "@/lib/execution/sales-playbook-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

describe("final orchestrator FINAL-20 sales playbook audit", () => {
  it("locks FINAL-20 policy and task slot 214", () => {
    expect(FINAL_20_SALES_PLAYBOOK_POLICY_ID).toBe("final-20-sales-playbook-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[19]?.id).toBe("FINAL-20");
    expect(FINAL_ORCHESTRATOR_PHASES[19]?.taskSlot).toBe(214);
    expect(SALES_PLAYBOOK_SUMMARY_ARTIFACT).toBe("artifacts/sales-playbook-summary.json");
    expect(SALES_PLAYBOOK_RUNNER_SCRIPT).toBe("scripts/ops/run-sales-playbook-audit.ts");
    expect(SALES_PLAYBOOK_VITEST_SPEC).toBe("tests/unit/sales-playbook-hub-surfaces.test.ts");
  });

  it("registers sales-safe hub contract markers in SALES_PLAYBOOK.md", () => {
    expect(auditSalesPlaybookHubRegistry()).toBe(true);
  });

  it("passes playbook audit when artifact is honest PASS", () => {
    const report = auditFinal20SalesPlaybook();
    expect(report.hubRegistryHonest).toBe(true);
    expect(report.final19Passed).toBe(true);
    expect(report.playbookHonest).toBe(true);
    expect(report.passed).toBe(true);
  });
});
