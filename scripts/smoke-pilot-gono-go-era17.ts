/**
 * Era 17 paid pilot GO/NO-GO smoke orchestrator (Cycle 18).
 *
 * Reads Era 17 evidence artifacts + env vars; writes pilot-gono-go-summary.json.
 * Exit 0 when decision is honest (including NO-GO). Exit 1 only on orchestrator error.
 */
import { readFileSync } from "node:fs";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  PILOT_GONOGO_ERA17_CYCLE_RUNBOOK_STEPS,
  PILOT_GONOGO_ERA17_INPUT_ARTIFACTS,
  PILOT_GONOGO_ERA17_NPM_SCRIPT,
  PILOT_GONOGO_ERA17_POLICY_ID,
  PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT,
} from "../lib/commercial/pilot-gono-go-era17-policy";
import type {
  PilotMetricsBaselineGoNoGoArtifact,
  PilotRollbackDrillGoNoGoArtifact,
} from "../lib/commercial/era20-pilot-execution-readiness";
import {
  buildPilotGoNoGoSummary,
  formatPilotGoNoGoReportLines,
  parseEnvBoolean,
  parsePilotIcpInputFromJson,
  type PilotForbiddenClaimsEnforcementArtifact,
  type PilotGoldenPathArtifact,
  type PilotP0StagingProofArtifact,
  type PilotSsoPilotReadyGateArtifact,
  type PilotTierPreflightArtifact,
} from "../lib/commercial/pilot-gono-go-summary";

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function loadArtifact<T>(relativePath: string): T | null {
  try {
    const raw = readFileSync(join(process.cwd(), relativePath), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function printRunbook(): void {
  console.log(`\nPilot GO/NO-GO (${PILOT_GONOGO_ERA17_POLICY_ID})\n`);
  for (const [index, step] of PILOT_GONOGO_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/commercial-pilot-runbook.md § Pilot GO/NO-GO\n");
}

function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
Era 17 paid pilot GO/NO-GO evaluator

  (default)       Read evidence artifacts + env; write pilot-gono-go-summary.json
  --checklist-only  Print runbook steps

Env:
  PILOT_GONOGO_CUSTOMER_NAME
  PILOT_GONOGO_LOI_SIGNED_DATE
  PILOT_GONOGO_PROSPECT_NAME  (era20 — prospect only; does NOT satisfy customer gate)
  PILOT_GONOGO_ICP_INPUT_JSON
  PILOT_GONOGO_PROSPECT_NAME  (era20 — prospect only; does NOT satisfy customer gate)
  PILOT_GONOGO_ROLE_CHECKLISTS_COMPLETE=1
  PILOT_GONOGO_FORBIDDEN_CLAIMS_IN_CONTRACT=1
  PILOT_GONOGO_TIER3_PASS=1
  PILOT_GONOGO_SSO_PILOT_REQUIRED=1

Reads:
${PILOT_GONOGO_ERA17_INPUT_ARTIFACTS.map((path) => `  - ${path}`).join("\n")}
`);
    process.exit(0);
  }

  if (hasFlag("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${PILOT_GONOGO_ERA17_NPM_SCRIPT}] ${PILOT_GONOGO_ERA17_POLICY_ID}\n`);

  const preflight = loadArtifact<PilotTierPreflightArtifact>(
    "artifacts/pilot-tier-preflight-summary.json",
  );
  const goldenPath = loadArtifact<PilotGoldenPathArtifact>(
    "artifacts/pilot-operator-golden-path-summary.json",
  );
  const forbiddenClaimsEnforcement = loadArtifact<PilotForbiddenClaimsEnforcementArtifact>(
    "artifacts/pilot-forbidden-claims-enforcement-summary.json",
  );
  const p0StagingProof = loadArtifact<PilotP0StagingProofArtifact>(
    "artifacts/p0-staging-proof-unblock-summary.json",
  );
  const ssoPilotReadyGate = loadArtifact<PilotSsoPilotReadyGateArtifact>(
    "artifacts/enterprise-sso-pilot-ready-gate-summary.json",
  );
  const metricsBaseline = loadArtifact<PilotMetricsBaselineGoNoGoArtifact>(
    "artifacts/pilot-metrics-baseline-summary.json",
  );
  const rollbackDrill = loadArtifact<PilotRollbackDrillGoNoGoArtifact>(
    "artifacts/pilot-rollback-drill-summary.json",
  );

  const summary = buildPilotGoNoGoSummary({
    preflight,
    goldenPath,
    forbiddenClaimsEnforcement,
    p0StagingProof,
    ssoPilotReadyGate,
    metricsBaseline,
    rollbackDrill,
    icpInput: parsePilotIcpInputFromJson(process.env.PILOT_GONOGO_ICP_INPUT_JSON),
    customerName: process.env.PILOT_GONOGO_CUSTOMER_NAME ?? null,
    loiSignedDate: process.env.PILOT_GONOGO_LOI_SIGNED_DATE ?? null,
    prospectName: process.env.PILOT_GONOGO_PROSPECT_NAME ?? null,
    roleChecklistsComplete: parseEnvBoolean(process.env.PILOT_GONOGO_ROLE_CHECKLISTS_COMPLETE),
    forbiddenClaimsInContract: parseEnvBoolean(
      process.env.PILOT_GONOGO_FORBIDDEN_CLAIMS_IN_CONTRACT,
    ),
    tier3Pass: parseEnvBoolean(process.env.PILOT_GONOGO_TIER3_PASS),
    ssoPilotRequired: parseEnvBoolean(process.env.PILOT_GONOGO_SSO_PILOT_REQUIRED),
  });

  const artifactPath = join(process.cwd(), PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  for (const line of formatPilotGoNoGoReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.decision === "GO") {
    console.log("Decision GO — verify customer LOI and contract before production traffic.\n");
  } else if (summary.decision === "NO-GO") {
    console.log("Decision NO-GO — expected until tiers, ICP, and customer evidence are complete.\n");
  }
}

main();
