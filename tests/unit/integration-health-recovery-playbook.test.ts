import { describe, expect, it } from "vitest";

import {
  computeRecoverySuccessRate,
  getRecoveryPlaybookForAlert,
  INTEGRATION_RECOVERY_PLAYBOOK_POLICY_ID,
} from "@/lib/integration-health/recovery-playbook-policy";
import {
  assignRecoveryPlaybooks,
} from "@/services/integration-health/recovery-playbook-service";
import type { IntegrationHealthPredictiveAlert } from "@/services/integration-health/health-scoring-engine";

describe("integration recovery playbook service", () => {
  it("locks recovery playbook policy id", () => {
    expect(INTEGRATION_RECOVERY_PLAYBOOK_POLICY_ID).toBe(
      "critical-integration-recovery-playbook-v1",
    );
  });

  it("maps alert codes to playbooks with auto and manual steps", () => {
    const syncPlaybook = getRecoveryPlaybookForAlert("sync_stale");
    expect(syncPlaybook?.steps.some((s) => s.kind === "auto")).toBe(true);
    expect(syncPlaybook?.steps.some((s) => s.kind === "manual")).toBe(true);

    const webhookPlaybook = getRecoveryPlaybookForAlert("webhook_failures");
    expect(webhookPlaybook?.steps.every((s) => s.kind === "manual")).toBe(true);
  });

  it("assigns playbooks to scoreboard alerts", () => {
    const alerts: IntegrationHealthPredictiveAlert[] = [
      {
        id: "a1",
        connectionId: "c1",
        provider: "SHOPIFY",
        severity: "warning",
        code: "sync_stale",
        message: "Stale sync",
      },
      {
        id: "a2",
        connectionId: "c1",
        provider: "SHOPIFY",
        severity: "critical",
        code: "webhook_failures",
        message: "Webhook failures",
      },
    ];
    const assignments = assignRecoveryPlaybooks(alerts);
    expect(assignments).toHaveLength(2);
    expect(assignments[0]?.playbook.alertCode).toBe("sync_stale");
  });

  it("computes auto-recovery success rate", () => {
    const rate = computeRecoverySuccessRate([
      {
        id: "1",
        connectionId: "c1",
        alertCode: "sync_stale",
        stepId: "auto-pull-inventory",
        autoAction: "pull_inventory_sync",
        status: "success",
        executedAt: new Date().toISOString(),
      },
      {
        id: "2",
        connectionId: "c1",
        alertCode: "sync_stale",
        stepId: "auto-pull-inventory",
        autoAction: "pull_inventory_sync",
        status: "failed",
        executedAt: new Date().toISOString(),
      },
    ]);
    expect(rate.attempts).toBe(2);
    expect(rate.successes).toBe(1);
    expect(rate.successRate).toBe(0.5);
  });
});
