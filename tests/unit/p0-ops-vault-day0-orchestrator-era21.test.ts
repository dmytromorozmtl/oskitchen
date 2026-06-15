import { describe, expect, it } from "vitest";

import {
  buildP0VaultDay0OrchestratorSummary,
  buildP0VaultDay0ReadinessChecklistMarkdown,
  isP0VaultDay0PartialComplete,
  resolveP0VaultDay0Milestone,
  resolveP0VaultDay0MilestoneFromPhaseStatuses,
} from "@/lib/commercial/p0-ops-vault-day0-orchestrator-era21";
import { evaluateP0VaultEnv } from "@/scripts/ops/validate-p0-vault-env";

describe("p0-ops-vault-day0-orchestrator-era21", () => {
  it("resolves day0_partial when phase 1 and 2 complete", () => {
    const env = evaluateP0VaultEnv({
      E2E_STAGING_BASE_URL: "https://staging.example.com",
      E2E_LOGIN_EMAIL: "owner@example.com",
      E2E_LOGIN_PASSWORD: "secret",
      DATABASE_URL: "postgres://x",
      ENCRYPTION_KEY: "key",
    });
    expect(env.day0PartialComplete).toBe(true);
    expect(env.day0Milestone).toBe("day0_partial");
    expect(isP0VaultDay0PartialComplete(env)).toBe(true);
  });

  it("resolves blocked when phase 1 incomplete", () => {
    const env = evaluateP0VaultEnv({
      DATABASE_URL: "postgres://x",
    });
    expect(env.day0Milestone).toBe("blocked");
  });

  it("resolves proof_passed from artifact status", () => {
    const milestone = resolveP0VaultDay0Milestone({
      env: evaluateP0VaultEnv({}),
      p0ProofStatus: "proof_passed",
    });
    expect(milestone).toBe("proof_passed");
  });

  it("builds orchestrator summary from env + artifact", () => {
    const env = evaluateP0VaultEnv({
      E2E_STAGING_BASE_URL: "https://staging.example.com",
    });
    const summary = buildP0VaultDay0OrchestratorSummary({
      env,
      artifact: { p0ProofStatus: "awaiting_ops_credentials", allMissingEnvVars: env.missing },
      stagingHealth: {
        checked: false,
        ok: false,
        url: null,
        statusCode: null,
        error: "not set",
      },
    });
    expect(summary.milestone).toBe("blocked");
    expect(summary.recommendedCommands.length).toBeGreaterThan(3);
  });

  it("builds readiness checklist markdown", () => {
    const env = evaluateP0VaultEnv({});
    const summary = buildP0VaultDay0OrchestratorSummary({
      env,
      artifact: null,
      stagingHealth: {
        checked: false,
        ok: false,
        url: null,
        statusCode: null,
        error: "not set",
      },
    });
    const markdown = buildP0VaultDay0ReadinessChecklistMarkdown({ summary, env });
    expect(markdown).toContain("Day 0 Readiness Checklist");
    expect(markdown).toContain("integration-health");
  });

  it("resolves milestone from phase statuses for UI", () => {
    const milestone = resolveP0VaultDay0MilestoneFromPhaseStatuses(
      [
        { id: "staging_login", complete: true },
        { id: "database_encryption", complete: true },
        { id: "channel_live", complete: false },
        { id: "sso_idp", complete: false },
      ],
      "awaiting_ops_credentials",
    );
    expect(milestone).toBe("day0_partial");
  });
});
