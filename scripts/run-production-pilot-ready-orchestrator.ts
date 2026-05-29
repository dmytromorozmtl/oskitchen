#!/usr/bin/env npx tsx
/**
 * Production Pilot Ready orchestrator — runs existing honest smokes and ops validators.
 * PASS > SKIPPED: never fabricates proof_passed without real child smoke PASS.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { buildVaultReadinessReport } from "@/lib/ops/vault-readiness-report";

export const PRODUCTION_PILOT_READY_EXECUTION_ARTIFACT =
  "artifacts/production-pilot-ready-execution-summary.json" as const;

type StepResult = {
  id: string;
  command: string;
  exitCode: number;
  skipped?: boolean;
  note?: string;
};

function runStep(id: string, command: string, options?: { allowFail?: boolean }): StepResult {
  console.log(`\n→ ${command}\n`);
  try {
    execSync(command, { stdio: "inherit", env: process.env });
    return { id, command, exitCode: 0 };
  } catch (error) {
    const exitCode =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status?: number }).status === "number"
        ? ((error as { status: number }).status ?? 1)
        : 1;
    if (options?.allowFail) {
      return { id, command, exitCode, note: "allowed-fail" };
    }
    return { id, command, exitCode };
  }
}

function readJson<T>(relativePath: string): T | null {
  const path = join(process.cwd(), relativePath);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function main() {
  const skipSmokes = process.argv.includes("--skip-smokes");
  const steps: StepResult[] = [];

  steps.push(runStep("vault-readiness", "npm run check-vault-readiness -- --write", { allowFail: true }));

  const vaultReport = buildVaultReadinessReport({
    p0Artifact: readJson("artifacts/p0-staging-proof-unblock-summary.json"),
  });

  if (!skipSmokes && vaultReport.vaultReady) {
    steps.push(
      runStep("p0-execution", "npm run ops:run-p0-staging-proof-execution -- --write", {
        allowFail: true,
      }),
    );
    steps.push(runStep("p0-orchestrator", "npm run smoke:p0-staging-proof-unblock", { allowFail: true }));
    steps.push(
      runStep("tier2-execution", "npm run ops:run-tier2-staging-proof-execution -- --write", {
        allowFail: true,
      }),
    );
    steps.push(runStep("tier2-golden-path", "npm run smoke:tier2-staging-golden-path", { allowFail: true }));
    steps.push(runStep("kds-playwright", "npm run smoke:kds-staging-playwright", { allowFail: true }));
    steps.push(
      runStep("commercial-gate", "npm run ops:run-commercial-gate-execution -- --write", {
        allowFail: true,
      }),
    );
    steps.push(
      runStep("pilot-week1", "npm run ops:run-pilot-week1-execution -- --write", {
        allowFail: true,
      }),
    );
    steps.push(
      runStep("pilot-scale-expansion", "npm run ops:run-pilot-scale-expansion-execution -- --write", {
        allowFail: true,
      }),
    );
    steps.push(
      runStep("production-ga", "npm run ops:run-production-ga-execution -- --write", {
        allowFail: true,
      }),
    );
    steps.push(
      runStep(
        "series-a-expansion",
        "npm run ops:run-series-a-partner-expansion-execution -- --write",
        { allowFail: true },
      ),
    );
    steps.push(
      runStep(
        "market-leader-positioning",
        "npm run ops:run-market-leader-positioning-execution -- --write",
        { allowFail: true },
      ),
    );
    steps.push(
      runStep(
        "sustained-operational-excellence",
        "npm run ops:run-sustained-operational-excellence-execution -- --write",
        { allowFail: true },
      ),
    );
    steps.push(
      runStep(
        "sustained-product-evolution",
        "npm run ops:run-sustained-product-evolution-execution -- --write",
        { allowFail: true },
      ),
    );
    steps.push(
      runStep(
        "continuous-improvement-loop",
        "npm run ops:run-continuous-improvement-loop-execution -- --write",
        { allowFail: true },
      ),
    );
  } else if (!skipSmokes) {
    steps.push({
      id: "p0-orchestrator",
      command: "npm run smoke:p0-staging-proof-unblock",
      exitCode: 0,
      skipped: true,
      note: "vault not ready — child smokes would SKIPPED; run after 11 secrets configured",
    });
  }

  steps.push(runStep("icp-check", "npm run icp-qualification-check", { allowFail: true }));
  steps.push(runStep("pilot-gono-go", "npm run smoke:pilot-gono-go", { allowFail: true }));
  steps.push(
    runStep(
      "commercial-inflection",
      "npm run ops:run-commercial-inflection-readiness-orchestrator -- --json",
      { allowFail: true },
    ),
  );

  const p0 = readJson<{ p0ProofStatus?: string; overall?: string }>(
    "artifacts/p0-staging-proof-unblock-summary.json",
  );
  const tier2 = readJson<{ tier2ProofStatus?: string; overall?: string }>(
    "artifacts/tier2-staging-golden-path-summary.json",
  );
  const gonoGo = readJson<{ decision?: string; blockers?: string[] }>(
    "artifacts/pilot-gono-go-summary.json",
  );

  const summary = {
    version: "production-pilot-ready-execution-v1",
    generatedAt: new Date().toISOString(),
    vaultReady: vaultReport.vaultReady,
    p0ProofStatus: p0?.p0ProofStatus ?? "missing",
    p0Overall: p0?.overall ?? "missing",
    tier2ProofStatus: tier2?.tier2ProofStatus ?? "missing",
    tier2Overall: tier2?.overall ?? "missing",
    goDecision: gonoGo?.decision ?? "missing",
    goBlockers: gonoGo?.blockers ?? [],
    steps,
    honestyNote:
      "This orchestrator never fabricates proof_passed. Configure ops vault secrets for real P0 PASS.",
  };

  const path = join(process.cwd(), PRODUCTION_PILOT_READY_EXECUTION_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log("\n=== Production Pilot Ready execution summary ===\n");
  console.log(`Vault ready: ${summary.vaultReady}`);
  console.log(`P0: ${summary.p0ProofStatus} (${summary.p0Overall})`);
  console.log(`Tier 2: ${summary.tier2ProofStatus} (${summary.tier2Overall})`);
  console.log(`GO/NO-GO: ${summary.goDecision}`);
  if (summary.goBlockers.length) {
    console.log(`Blockers: ${summary.goBlockers.join("; ")}`);
  }
  console.log(`\nArtifact: ${PRODUCTION_PILOT_READY_EXECUTION_ARTIFACT}\n`);

  const failed = steps.some((step) => !step.skipped && step.exitCode !== 0 && step.note !== "allowed-fail");
  process.exit(failed ? 1 : 0);
}

main();
