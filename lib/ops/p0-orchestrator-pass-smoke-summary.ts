/**
 * P0 orchestrator PASS smoke summary — wiring audit (Era 142).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  P0_ORCHESTRATOR_PASS_ERA142_CAPABILITIES,
  P0_ORCHESTRATOR_PASS_ERA142_POLICY_ID,
  P0_ORCHESTRATOR_PASS_ERA142_STAGING_RUN_ARTIFACT,
  P0_ORCHESTRATOR_PASS_ERA142_VAULT_ARTIFACT,
  P0_ORCHESTRATOR_PASS_ERA142_WIRING_PATHS,
} from "@/lib/ops/p0-orchestrator-pass-era142-policy";

export const P0_ORCHESTRATOR_PASS_SMOKE_SUMMARY_VERSION = P0_ORCHESTRATOR_PASS_ERA142_POLICY_ID;

export type P0OrchestratorPassSmokeEra142Overall = "PASSED" | "FAILED" | "SKIPPED";

export type P0OrchestratorPassSmokeEra142ProofStatus =
  | "proof_passed"
  | "proof_failed_wiring"
  | "proof_failed_cert"
  | "proof_failed_artifact"
  | "proof_failed";

export type P0OrchestratorPassSmokeEra142Step = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  reason?: string;
};

export type P0OrchestratorPassSmokeEra142Summary = {
  version: typeof P0_ORCHESTRATOR_PASS_SMOKE_SUMMARY_VERSION;
  runAt: string;
  commitSha: string | null;
  overall: P0OrchestratorPassSmokeEra142Overall;
  proofStatus: P0OrchestratorPassSmokeEra142ProofStatus;
  wiringCertPassed: boolean;
  vaultP0ArtifactOverall: string | null;
  stagingRunOverall: string | null;
  capabilities: readonly string[];
  steps: P0OrchestratorPassSmokeEra142Step[];
  honestyNote: string;
};

export function readVaultP0ArtifactOverall(root: string = process.cwd()): string | null {
  const path = join(root, P0_ORCHESTRATOR_PASS_ERA142_VAULT_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { p0ArtifactOverall?: string };
    return parsed.p0ArtifactOverall ?? null;
  } catch {
    return null;
  }
}

export function readStagingRunOverall(root: string = process.cwd()): string | null {
  const path = join(root, P0_ORCHESTRATOR_PASS_ERA142_STAGING_RUN_ARTIFACT);
  if (!existsSync(path)) return null;
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as { overall?: string };
    return parsed.overall ?? null;
  } catch {
    return null;
  }
}

export function auditP0OrchestratorPassSmokeWiring(root: string = process.cwd()): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  for (const rel of P0_ORCHESTRATOR_PASS_ERA142_WIRING_PATHS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      failures.push(`missing ${rel}`);
      continue;
    }
    const src = readFileSync(path, "utf8");

    if (rel === "lib/ops/p0-staging-proof-execution-orchestrator.ts") {
      if (!src.includes("buildP0StagingProofExecutionPhaseStatuses")) {
        failures.push("p0-staging-proof-execution-orchestrator.ts missing phase statuses builder");
      }
      if (!src.includes("resolveP0StagingProofExecutionMilestone")) {
        failures.push("p0-staging-proof-execution-orchestrator.ts missing milestone resolver");
      }
      if (!src.includes("p0_aggregate")) {
        failures.push("p0-staging-proof-execution-orchestrator.ts missing p0_aggregate phase");
      }
      if (!src.includes("integrity_validate")) {
        failures.push("p0-staging-proof-execution-orchestrator.ts missing integrity_validate phase");
      }
    }

    if (rel === "lib/execution/final-02-p0-orchestrator-artifact-audit-policy.ts") {
      if (!src.includes("auditFinal02P0OrchestratorArtifact")) {
        failures.push("final-02 policy missing auditFinal02P0OrchestratorArtifact");
      }
      if (!src.includes("P0_ORCHESTRATOR_REQUIRED_STEP_IDS")) {
        failures.push("final-02 policy missing required step ids");
      }
      if (!src.includes("p0ArtifactOverall")) {
        failures.push("final-02 policy missing p0ArtifactOverall check");
      }
    }

    if (rel === "lib/ops/vault-readiness-report.ts") {
      if (!src.includes("buildVaultReadinessReport")) {
        failures.push("vault-readiness-report.ts missing buildVaultReadinessReport");
      }
      if (!src.includes("p0ArtifactOverall")) {
        failures.push("vault-readiness-report.ts missing p0ArtifactOverall field");
      }
      if (!src.includes("p0ProofStatus")) {
        failures.push("vault-readiness-report.ts missing p0ProofStatus field");
      }
    }

    if (rel === "scripts/run-p0-orchestrator-staging.sh") {
      if (!src.includes("p0-orchestrator-staging-run-summary.json")) {
        failures.push("run-p0-orchestrator-staging.sh missing staging run artifact");
      }
      if (!src.includes("vault-readiness-report.json")) {
        failures.push("run-p0-orchestrator-staging.sh missing vault readiness artifact");
      }
      if (!src.includes("p0ArtifactOverall")) {
        failures.push("run-p0-orchestrator-staging.sh missing p0ArtifactOverall propagation");
      }
      if (!src.includes("smoke_integrity")) {
        failures.push("run-p0-orchestrator-staging.sh missing smoke_integrity step");
      }
    }

    if (rel === ".github/workflows/p0-orchestrator.yml") {
      if (!src.includes("p0-orchestrator")) {
        failures.push("p0-orchestrator.yml missing job name");
      }
      if (!src.includes("check-vault-readiness")) {
        failures.push("p0-orchestrator.yml missing vault readiness check");
      }
      if (!src.includes("p0ArtifactOverall")) {
        failures.push("p0-orchestrator.yml missing p0ArtifactOverall output");
      }
    }
  }

  const vaultOverall = readVaultP0ArtifactOverall(root);
  if (vaultOverall !== "PASSED") {
    failures.push(
      `vault-readiness-report.json p0ArtifactOverall is ${vaultOverall ?? "missing"}, expected PASSED`,
    );
  }

  const stagingOverall = readStagingRunOverall(root);
  if (stagingOverall !== "PASS") {
    failures.push(
      `p0-orchestrator-staging-run-summary.json overall is ${stagingOverall ?? "missing"}, expected PASS`,
    );
  }

  return { ok: failures.length === 0, failures };
}

export function resolveP0OrchestratorPassSmokeEra142ProofStatus(input: {
  wiringOk: boolean;
  certPassed: boolean;
}): P0OrchestratorPassSmokeEra142ProofStatus {
  if (!input.certPassed) return "proof_failed_cert";
  if (!input.wiringOk) return "proof_failed_wiring";
  return "proof_passed";
}

export function buildP0OrchestratorPassSmokeEra142Summary(input: {
  certPassed: boolean;
  wiringFailures?: readonly string[];
  commitSha?: string | null;
  runAt?: Date;
  root?: string;
}): P0OrchestratorPassSmokeEra142Summary {
  const root = input.root ?? process.cwd();
  const wiringFailures = input.wiringFailures ?? [];
  const wiringOk = wiringFailures.length === 0;
  const proofStatus = resolveP0OrchestratorPassSmokeEra142ProofStatus({
    wiringOk,
    certPassed: input.certPassed,
  });
  const overall: P0OrchestratorPassSmokeEra142Overall =
    proofStatus === "proof_passed" ? "PASSED" : "FAILED";

  const steps: P0OrchestratorPassSmokeEra142Step[] = [
    {
      id: "wiring_audit",
      label: "Vault gate → child smokes → p0ArtifactOverall PASSED",
      status: wiringOk ? "PASSED" : "FAILED",
      reason: wiringOk ? undefined : wiringFailures.join("; "),
    },
    {
      id: "unit_cert",
      label: "Era 142 P0 orchestrator PASS cert",
      status: input.certPassed ? "PASSED" : "FAILED",
    },
  ];

  return {
    version: P0_ORCHESTRATOR_PASS_SMOKE_SUMMARY_VERSION,
    runAt: (input.runAt ?? new Date()).toISOString(),
    commitSha: input.commitSha ?? null,
    overall,
    proofStatus,
    wiringCertPassed: wiringOk && input.certPassed,
    vaultP0ArtifactOverall: readVaultP0ArtifactOverall(root),
    stagingRunOverall: readStagingRunOverall(root),
    capabilities: P0_ORCHESTRATOR_PASS_ERA142_CAPABILITIES,
    steps,
    honestyNote:
      "PASS certifies in-repo wiring and committed artifacts — live re-run requires ops vault credentials.",
  };
}

export function formatP0OrchestratorPassSmokeEra142ReportLines(
  summary: P0OrchestratorPassSmokeEra142Summary,
): string[] {
  return [
    `Overall: ${summary.overall}`,
    `Proof status: ${summary.proofStatus}`,
    `Wiring cert: ${summary.wiringCertPassed ? "PASSED" : "FAILED"}`,
    `Vault p0ArtifactOverall: ${summary.vaultP0ArtifactOverall ?? "n/a"}`,
    `Staging run overall: ${summary.stagingRunOverall ?? "n/a"}`,
    `Capabilities: ${summary.capabilities.join(", ")}`,
    ...summary.steps.map(
      (step) =>
        `  [${step.status}] ${step.label}${step.reason ? ` — ${step.reason}` : ""}`,
    ),
  ];
}
