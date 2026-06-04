import { describe, expect, it } from "vitest";

import {
  auditFinal01VaultGate,
  FINAL_01_VAULT_GATE_POLICY_ID,
} from "@/lib/execution/final-01-vault-gate-audit-policy";
import {
  FINAL_ORCHESTRATOR_FIRST_TASK_SLOT,
  FINAL_ORCHESTRATOR_PHASES,
} from "@/lib/execution/final-orchestrator-phases";

describe("final orchestrator FINAL-01 vault gate audit", () => {
  it("locks FINAL-01 policy and task slot 195", () => {
    expect(FINAL_01_VAULT_GATE_POLICY_ID).toBe("final-01-vault-gate-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[0]?.id).toBe("FINAL-01");
    expect(FINAL_ORCHESTRATOR_FIRST_TASK_SLOT).toBe(195);
    expect(FINAL_ORCHESTRATOR_PHASES[0]?.taskSlot).toBe(195);
  });

  it("passes vault gate audit against repo", () => {
    const report = auditFinal01VaultGate();
    expect(report.passed).toBe(true);
    expect(report.vaultReportPresent).toBe(true);
    expect(report.vaultSchemaValid).toBe(true);
    expect(report.reconciliationPassed).toBe(true);
    expect(report.honestP0Status).toBe(true);
  });

  it("requires check-vault-readiness script wiring", () => {
    const report = auditFinal01VaultGate();
    expect(report.checkScriptWired).toBe(true);
    expect(report.vaultMatrixDocPresent).toBe(true);
  });

  it("does not require vaultReady true for honest closure gate", () => {
    const report = auditFinal01VaultGate();
    expect(report.passed).toBe(true);
  });
});
