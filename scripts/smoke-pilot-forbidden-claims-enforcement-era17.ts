/**
 * Era 17 pilot forbidden-claims enforcement orchestrator (P0 #5).
 *
 * Strict verify-claims + registry audit + claims/procurement cert wiring.
 * Real failures → FAILED (exit 1). Honest PASS records proof_passed artifact.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_CYCLE_RUNBOOK_STEPS,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_NPM_SCRIPT,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_POLICY_ID,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_STRICT_ENV,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_STRICT_ENV_VALUE,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_SUMMARY_ARTIFACT,
} from "../lib/commercial/pilot-forbidden-claims-enforcement-era17-policy";
import {
  buildPilotForbiddenClaimsEnforcementSummary,
  formatPilotForbiddenClaimsEnforcementReportLines,
  type PilotForbiddenClaimsEnforcementStep,
} from "../lib/commercial/pilot-forbidden-claims-enforcement-summary";

function runNpmScript(script: string, extraEnv?: Record<string, string>): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
  });
  return result.status ?? 1;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function readCommitSha(): string | null {
  const result = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
  if (result.status !== 0) return null;
  return result.stdout.trim() || null;
}

function writeSummaryArtifact(
  summary: ReturnType<typeof buildPilotForbiddenClaimsEnforcementSummary>,
): void {
  const path = join(process.cwd(), PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(
    `\nPilot forbidden-claims enforcement (${PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_POLICY_ID})\n`,
  );
  for (const [index, step] of PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/commercial-pilot-runbook.md § Forbidden claims\n");
}

function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
Era 17 pilot forbidden-claims enforcement (P0 #5)

  (default)         Strict verify-claims + audit + claims/procurement certs
  --checklist-only  Print runbook steps
  --certs-only      Skip live verify-claims + audit (cert wiring only)
`);
    process.exit(0);
  }

  if (hasFlag("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(
    `\n[${PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_NPM_SCRIPT}] ${PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_POLICY_ID}\n`,
  );

  const steps: PilotForbiddenClaimsEnforcementStep[] = [];
  const certsOnly = hasFlag("--certs-only");
  const strictEnv = {
    [PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_STRICT_ENV]:
      PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_STRICT_ENV_VALUE,
  };

  if (certsOnly) {
    steps.push({
      id: "verify_claims_strict",
      label: "Marketing claims strict verify",
      status: "SKIPPED",
      reason: "--certs-only — run full smoke before pilot contract signature",
    });
    steps.push({
      id: "audit_marketing_claims",
      label: "Marketing claims registry audit",
      status: "SKIPPED",
      reason: "--certs-only",
    });
  } else {
    console.log(
      `\n→ ${PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_STRICT_ENV}=${PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_STRICT_ENV_VALUE} npm run verify-claims\n`,
    );
    const claimsCode = runNpmScript("verify-claims", strictEnv);
    steps.push({
      id: "verify_claims_strict",
      label: "Marketing claims strict verify",
      status: claimsCode === 0 ? "PASSED" : "FAILED",
      reason: claimsCode === 0 ? undefined : `exit ${claimsCode}`,
    });

    console.log("\n→ npm run audit:marketing-claims\n");
    const auditCode = runNpmScript("audit:marketing-claims");
    steps.push({
      id: "audit_marketing_claims",
      label: "Marketing claims registry audit",
      status: auditCode === 0 ? "PASSED" : "FAILED",
      reason: auditCode === 0 ? undefined : `exit ${auditCode}`,
    });
  }

  const certScripts = [
    { id: "pilot_preflight_claims_cert", script: "test:ci:pilot-preflight-claims:cert", label: "Pilot preflight claims cert wiring" },
    { id: "marketing_claims_governance_cert", script: "test:ci:marketing-claims-governance:cert", label: "Marketing claims governance cert" },
    { id: "claims_registry_cert", script: "test:ci:claims-registry:cert", label: "Claims registry cert" },
    { id: "enterprise_procurement_cert", script: "test:ci:enterprise-procurement:cert", label: "Enterprise procurement honesty cert" },
  ] as const;

  for (const entry of certScripts) {
    console.log(`\n→ npm run ${entry.script}\n`);
    const code = runNpmScript(entry.script);
    steps.push({
      id: entry.id,
      label: entry.label,
      status: code === 0 ? "PASSED" : "FAILED",
      reason: code === 0 ? undefined : `exit ${code}`,
    });
  }

  const summary = buildPilotForbiddenClaimsEnforcementSummary(steps, {
    commitSha: readCommitSha(),
    marketingClaimsStrict: true,
  });
  writeSummaryArtifact(summary);

  for (const line of formatPilotForbiddenClaimsEnforcementReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
