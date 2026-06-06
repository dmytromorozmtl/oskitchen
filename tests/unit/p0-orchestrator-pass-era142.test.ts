import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditFinal02P0OrchestratorArtifact } from "@/lib/execution/final-02-p0-orchestrator-artifact-audit-policy";
import {
  P0_ORCHESTRATOR_PASS_ERA142_CANONICAL_P0_POLICY_ID,
  P0_ORCHESTRATOR_PASS_ERA142_CAPABILITIES,
  P0_ORCHESTRATOR_PASS_ERA142_FINAL02_POLICY_ID,
  P0_ORCHESTRATOR_PASS_ERA142_POLICY_ID,
  P0_ORCHESTRATOR_PASS_ERA142_REQUIRED_STEPS,
  P0_ORCHESTRATOR_PASS_ERA142_STAGING_RUN_ARTIFACT,
  P0_ORCHESTRATOR_PASS_ERA142_SUMMARY_ARTIFACT,
  P0_ORCHESTRATOR_PASS_ERA142_VAULT_ARTIFACT,
  P0_ORCHESTRATOR_PASS_ERA142_WIRING_PATHS,
} from "@/lib/ops/p0-orchestrator-pass-era142-policy";
import {
  auditP0OrchestratorPassSmokeWiring,
  buildP0OrchestratorPassSmokeEra142Summary,
  readStagingRunOverall,
  readVaultP0ArtifactOverall,
  resolveP0OrchestratorPassSmokeEra142ProofStatus,
} from "@/lib/ops/p0-orchestrator-pass-smoke-summary";
import { P0_STAGING_PROOF_EXECUTION_ORCHESTRATOR_POLICY_ID } from "@/lib/ops/p0-staging-proof-execution-orchestrator";

const ROOT = process.cwd();

describe("p0 orchestrator pass era142", () => {
  it("locks era142 policy and artifact paths", () => {
    expect(P0_ORCHESTRATOR_PASS_ERA142_POLICY_ID).toBe("era142-p0-orchestrator-pass-v1");
    expect(P0_ORCHESTRATOR_PASS_ERA142_SUMMARY_ARTIFACT).toBe(
      "artifacts/p0-orchestrator-pass-smoke-summary.json",
    );
    expect(P0_ORCHESTRATOR_PASS_ERA142_VAULT_ARTIFACT).toBe(
      "artifacts/vault-readiness-report.json",
    );
    expect(P0_ORCHESTRATOR_PASS_ERA142_STAGING_RUN_ARTIFACT).toBe(
      "artifacts/p0-orchestrator-staging-run-summary.json",
    );
    expect(P0_ORCHESTRATOR_PASS_ERA142_REQUIRED_STEPS).toHaveLength(7);
    expect(P0_ORCHESTRATOR_PASS_ERA142_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era142 with canonical P0 orchestrator policies", () => {
    expect(P0_ORCHESTRATOR_PASS_ERA142_CANONICAL_P0_POLICY_ID).toBe(
      P0_STAGING_PROOF_EXECUTION_ORCHESTRATOR_POLICY_ID,
    );
    expect(P0_ORCHESTRATOR_PASS_ERA142_FINAL02_POLICY_ID).toBe(
      "final-02-p0-orchestrator-artifact-v1",
    );
  });

  it("audits in-repo P0 orchestrator PASS wiring", () => {
    const audit = auditP0OrchestratorPassSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of P0_ORCHESTRATOR_PASS_ERA142_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("reads vault and staging artifacts with PASSED/PASS overall", () => {
    expect(readVaultP0ArtifactOverall(ROOT)).toBe("PASSED");
    expect(readStagingRunOverall(ROOT)).toBe("PASS");

    const vault = JSON.parse(
      readFileSync(join(ROOT, P0_ORCHESTRATOR_PASS_ERA142_VAULT_ARTIFACT), "utf8"),
    ) as { p0ProofStatus?: string };
    expect(vault.p0ProofStatus).toBe("proof_passed");

    const final02 = auditFinal02P0OrchestratorArtifact(ROOT);
    expect(final02.passed).toBe(true);
    expect(final02.honestOverall).toBe(true);
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveP0OrchestratorPassSmokeEra142ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveP0OrchestratorPassSmokeEra142ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildP0OrchestratorPassSmokeEra142Summary({
      certPassed: true,
      root: ROOT,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.vaultP0ArtifactOverall).toBe("PASSED");
    expect(summary.stagingRunOverall).toBe("PASS");
    expect(summary.capabilities).toContain("p0_aggregate");
  });
});
