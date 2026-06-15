import { describe, expect, it } from "vitest";

import {
  auditFinal17WebhookSignatureMatrix,
  auditWebhookSignatureMatrixTest,
  FINAL_17_WEBHOOK_SIGNATURE_POLICY_ID,
} from "@/lib/execution/final-17-webhook-signature-audit-policy";
import {
  WEBHOOK_SIGNATURE_MATRIX_SUMMARY_ARTIFACT,
  WEBHOOK_SIGNATURE_MATRIX_RUNNER_SCRIPT,
  WEBHOOK_SIGNATURE_MATRIX_VITEST_SPEC,
} from "@/lib/execution/webhook-signature-matrix-policy";
import { FINAL_ORCHESTRATOR_PHASES } from "@/lib/execution/final-orchestrator-phases";

describe("final orchestrator FINAL-17 webhook signature matrix audit", () => {
  it("locks FINAL-17 policy and task slot 211", () => {
    expect(FINAL_17_WEBHOOK_SIGNATURE_POLICY_ID).toBe("final-17-webhook-signature-v1");
    expect(FINAL_ORCHESTRATOR_PHASES[16]?.id).toBe("FINAL-17");
    expect(FINAL_ORCHESTRATOR_PHASES[16]?.taskSlot).toBe(211);
    expect(WEBHOOK_SIGNATURE_MATRIX_SUMMARY_ARTIFACT).toBe(
      "artifacts/webhook-signature-matrix-summary.json",
    );
    expect(WEBHOOK_SIGNATURE_MATRIX_RUNNER_SCRIPT).toBe(
      "scripts/ops/run-webhook-signature-matrix-audit.ts",
    );
    expect(WEBHOOK_SIGNATURE_MATRIX_VITEST_SPEC).toBe(
      "tests/unit/webhook-signature-matrix.test.ts",
    );
  });

  it("registers 52-route signature verification contract in matrix test", () => {
    expect(auditWebhookSignatureMatrixTest()).toBe(true);
  });

  it("passes matrix audit when artifact is honest PASS", () => {
    const report = auditFinal17WebhookSignatureMatrix();
    expect(report.contractRegistryHonest).toBe(true);
    expect(report.staticAuditPresent).toBe(true);
    expect(report.final16Passed).toBe(true);
    expect(report.matrixHonest).toBe(true);
    expect(report.passed).toBe(true);
  });
});
