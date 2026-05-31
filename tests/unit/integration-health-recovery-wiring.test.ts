import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("integration recovery playbook wiring", () => {
  it("ships recovery playbook service", () => {
    const source = readFileSync(
      join(ROOT, "services/integration-health/recovery-playbook-service.ts"),
      "utf8",
    );
    expect(source).toContain("executeRecoveryAutoStep");
    expect(source).toContain("runAutoRecoveryForAlert");
    expect(source).toContain("loadIntegrationRecoveryPlan");
    expect(source).toContain("computeRecoverySuccessRate");
  });

  it("defines playbooks for all alert codes", () => {
    const policy = readFileSync(
      join(ROOT, "lib/integration-health/recovery-playbook-policy.ts"),
      "utf8",
    );
    expect(existsSync(join(ROOT, "services/integration-health/recovery-playbook-service.ts"))).toBe(
      true,
    );
    for (const code of [
      "score_critical",
      "score_declining",
      "sync_stale",
      "webhook_failures",
      "latency_spike",
      "auth_degraded",
    ]) {
      expect(policy).toContain(`"${code}"`);
    }
  });
});
