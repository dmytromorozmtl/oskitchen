/**
 * Era 17 pilot operator golden path orchestrator (Cycle 17).
 *
 * Tier 2 staging checklist: CI wiring smokes + manual phase recording via env vars.
 * Missing staging/operator env → SKIPPED WITH REASON (exit 0). Real failures → exit 1.
 */
import { readFileSync } from "node:fs";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_CYCLE_RUNBOOK_STEPS,
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_NPM_SCRIPT,
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_PHASES,
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_POLICY_ID,
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_SUMMARY_ARTIFACT,
} from "../lib/commercial/pilot-operator-golden-path-era17-policy";
import {
  buildPilotGoldenPathSignOffTemplate,
  buildPilotGoldenPathSummary,
  evaluatePilotGoldenPathManualPrerequisites,
  formatPilotGoldenPathReportLines,
  parsePhaseManualStatus,
  type PilotGoldenPathStep,
} from "../lib/commercial/pilot-operator-golden-path-summary";
import { PILOT_TIER_PREFLIGHT_ERA17_SUMMARY_ARTIFACT } from "../lib/commercial/pilot-tier-preflight-era17-policy";

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function readCommitSha(): string | null {
  const fromEnv = process.env.PILOT_GOLDEN_PATH_COMMIT_SHA?.trim();
  if (fromEnv) return fromEnv;
  const result = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
  if (result.status !== 0) return null;
  return result.stdout.trim() || null;
}

function readManualInput() {
  const durationRaw = process.env.PILOT_GOLDEN_PATH_DURATION_MINUTES?.trim();
  return {
    stagingUrl: process.env.PILOT_GOLDEN_PATH_STAGING_URL ?? null,
    operatorEmail: process.env.PILOT_GOLDEN_PATH_OPERATOR_EMAIL ?? null,
    commitSha: readCommitSha(),
    durationMinutes: durationRaw ? Number(durationRaw) : null,
    notes: process.env.PILOT_GOLDEN_PATH_NOTES ?? null,
  };
}

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function readTierPreflightGateStep(): PilotGoldenPathStep {
  const path = join(process.cwd(), PILOT_TIER_PREFLIGHT_ERA17_SUMMARY_ARTIFACT);
  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as {
      overall?: string;
      tier0ProofStatus?: string;
      tier1ProofStatus?: string;
    };
    if (parsed.overall === "PASSED" && parsed.tier0ProofStatus === "proof_passed") {
      return {
        id: "tier_preflight_gate",
        phaseId: "preflight",
        label: "Tier 0/1 preflight artifact",
        kind: "tier_preflight_gate",
        status: "PASSED",
        reason: `${PILOT_TIER_PREFLIGHT_ERA17_SUMMARY_ARTIFACT} overall PASSED`,
      };
    }
    return {
      id: "tier_preflight_gate",
      phaseId: "preflight",
      label: "Tier 0/1 preflight artifact",
      kind: "tier_preflight_gate",
      status: "SKIPPED",
      reason: `Review ${PILOT_TIER_PREFLIGHT_ERA17_SUMMARY_ARTIFACT} — tier0=${parsed.tier0ProofStatus ?? "unknown"} tier1=${parsed.tier1ProofStatus ?? "unknown"}`,
    };
  } catch {
    return {
      id: "tier_preflight_gate",
      phaseId: "preflight",
      label: "Tier 0/1 preflight artifact",
      kind: "tier_preflight_gate",
      status: "SKIPPED",
      reason: `${PILOT_TIER_PREFLIGHT_ERA17_SUMMARY_ARTIFACT} not found — run npm run smoke:pilot-tier-preflight first`,
    };
  }
}

function buildPhaseSteps(
  skipCi: boolean,
  skipPosCi: boolean,
  manualReady: boolean,
  manualSkipReason: string,
  smokeResults: Map<string, number>,
): PilotGoldenPathStep[] {
  const steps: PilotGoldenPathStep[] = [];

  for (const phase of PILOT_OPERATOR_GOLDEN_PATH_ERA17_PHASES) {
    if (phase.ciSmokeScript && !skipCi) {
      const skipThisCi = skipPosCi && phase.id === "pos";
      if (skipThisCi) {
        steps.push({
          id: `${phase.id}_ci_wiring`,
          phaseId: phase.id,
          label: `${phase.label} — CI wiring`,
          kind: "ci_wiring",
          status: "SKIPPED",
          reason: "--skip-pos-ci — run test:ci:pos-money-path:cert on release branch",
        });
      } else {
        const code = smokeResults.get(phase.ciSmokeScript);
        steps.push({
          id: `${phase.id}_ci_wiring`,
          phaseId: phase.id,
          label: `${phase.label} — CI wiring`,
          kind: "ci_wiring",
          status: code === 0 ? "PASSED" : "FAILED",
          reason: code === 0 ? phase.ciSmokeScript : `${phase.ciSmokeScript} exit ${code ?? "unknown"}`,
        });
      }
    } else if (phase.ciSmokeScript && skipCi) {
      steps.push({
        id: `${phase.id}_ci_wiring`,
        phaseId: phase.id,
        label: `${phase.label} — CI wiring`,
        kind: "ci_wiring",
        status: "SKIPPED",
        reason: "--skip-ci flag set",
      });
    }

    const manualRaw = process.env[phase.manualEnvKey];
    const manualStatus = parsePhaseManualStatus(manualRaw);
    if (manualStatus) {
      steps.push({
        id: `${phase.id}_manual_staging`,
        phaseId: phase.id,
        label: `${phase.label} — manual staging`,
        kind: "manual_staging",
        status: manualStatus,
        reason: `${phase.manualEnvKey}=${manualRaw?.trim()}`,
      });
    } else if (manualReady) {
      steps.push({
        id: `${phase.id}_manual_staging`,
        phaseId: phase.id,
        label: `${phase.label} — manual staging`,
        kind: "manual_staging",
        status: "SKIPPED",
        reason: `Set ${phase.manualEnvKey}=PASSED|FAILED after completing checklist`,
      });
    } else {
      steps.push({
        id: `${phase.id}_manual_staging`,
        phaseId: phase.id,
        label: `${phase.label} — manual staging`,
        kind: "manual_staging",
        status: "SKIPPED",
        reason: manualSkipReason,
      });
    }
  }

  return steps;
}

function printRunbook(): void {
  console.log(`\nPilot operator golden path (${PILOT_OPERATOR_GOLDEN_PATH_ERA17_POLICY_ID})\n`);
  for (const [index, step] of PILOT_OPERATOR_GOLDEN_PATH_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/pilot-operator-golden-path-era17.md\n");
}

function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
Era 17 pilot operator golden path (Tier 2)

  (default)     Run CI wiring smokes + write summary artifact
  --skip-ci     Skip CI wiring smokes
  --skip-pos-ci Skip test:ci:pos-money-path:cert (default skips POS CI — use --with-pos-ci)
  --with-pos-ci Include POS money-path cert
  --checklist-only  Print runbook steps
  --dry-run     Print planned summary without running smokes

Env (manual staging sign-off):
  PILOT_GOLDEN_PATH_STAGING_URL
  PILOT_GOLDEN_PATH_OPERATOR_EMAIL
  PILOT_GOLDEN_PATH_COMMIT_SHA
  PILOT_GOLDEN_PATH_DURATION_MINUTES
  PILOT_GOLDEN_PATH_<PHASE>_MANUAL=PASSED|FAILED  (e.g. ONBOARDING, ORDERS, STOREFRONT)
`);
    process.exit(0);
  }

  if (hasFlag("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(
    `\n[${PILOT_OPERATOR_GOLDEN_PATH_ERA17_NPM_SCRIPT}] ${PILOT_OPERATOR_GOLDEN_PATH_ERA17_POLICY_ID}\n`,
  );

  const manualInput = readManualInput();
  const manualCheck = evaluatePilotGoldenPathManualPrerequisites(manualInput);
  const manualReady = manualCheck.ok;
  const manualSkipReason = manualCheck.ok ? "" : manualCheck.reason;

  const skipCi = hasFlag("--skip-ci");
  const skipPosCi = !hasFlag("--with-pos-ci");
  const dryRun = hasFlag("--dry-run");

  const smokeResults = new Map<string, number>();
  if (!skipCi && !dryRun) {
    const scripts = new Set<string>();
    for (const phase of PILOT_OPERATOR_GOLDEN_PATH_ERA17_PHASES) {
      if (phase.ciSmokeScript) scripts.add(phase.ciSmokeScript);
    }
    for (const script of scripts) {
      if (skipPosCi && script === "test:ci:pos-money-path:cert") continue;
      console.log(`\n→ npm run ${script}\n`);
      smokeResults.set(script, runNpmScript(script));
    }
  }

  const steps: PilotGoldenPathStep[] = [
    readTierPreflightGateStep(),
    ...buildPhaseSteps(skipCi, skipPosCi, manualReady, manualSkipReason, smokeResults),
  ];
  const signOffTemplate = buildPilotGoldenPathSignOffTemplate(manualInput);
  const summary = buildPilotGoldenPathSummary(steps, signOffTemplate);

  if (dryRun) {
    for (const line of formatPilotGoldenPathReportLines(summary)) {
      console.log(line);
    }
    process.exit(0);
  }

  const artifactPath = join(process.cwd(), PILOT_OPERATOR_GOLDEN_PATH_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  for (const line of formatPilotGoldenPathReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${PILOT_OPERATOR_GOLDEN_PATH_ERA17_SUMMARY_ARTIFACT}\n`);
  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
