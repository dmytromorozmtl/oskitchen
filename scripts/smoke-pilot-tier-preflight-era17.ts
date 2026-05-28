/**
 * Era 17 pilot Tier 0/1 preflight orchestrator (Cycle 16).
 *
 * Tier 0: governance bundles + scorecard + cron validation.
 * Tier 1: claims strict + marketing audit + staging env + claims cert.
 * Missing staging env → SKIPPED WITH REASON (exit 0). Real failures → FAILED (exit 1).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import {
  PILOT_TIER_PREFLIGHT_ERA17_CYCLE_RUNBOOK_STEPS,
  PILOT_TIER_PREFLIGHT_ERA17_NPM_SCRIPT,
  PILOT_TIER_PREFLIGHT_ERA17_POLICY_ID,
  PILOT_TIER_PREFLIGHT_ERA17_SUMMARY_ARTIFACT,
  PILOT_TIER_PREFLIGHT_ERA17_TIER0_COMMANDS,
} from "../lib/commercial/pilot-tier-preflight-era17-policy";
import {
  buildPilotTierPreflightSummary,
  formatPilotTierPreflightReportLines,
  type PilotTierPreflightStep,
} from "../lib/commercial/pilot-tier-preflight-summary";

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

function stagingEnvConfigured(): boolean {
  return Boolean(
    process.env.DATABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.CRON_SECRET?.trim(),
  );
}

function writeSummaryArtifact(summary: ReturnType<typeof buildPilotTierPreflightSummary>): void {
  const path = join(process.cwd(), PILOT_TIER_PREFLIGHT_ERA17_SUMMARY_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function printRunbook(): void {
  console.log(`\nPilot Tier 0/1 preflight (${PILOT_TIER_PREFLIGHT_ERA17_POLICY_ID})\n`);
  for (const [index, step] of PILOT_TIER_PREFLIGHT_ERA17_CYCLE_RUNBOOK_STEPS.entries()) {
    console.log(`${index + 1}. ${step}`);
  }
  console.log("\nSee docs/commercial-pilot-runbook.md Tier 0–1\n");
}

async function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(`
Era 17 pilot Tier 0/1 preflight

  (default)                 Full Tier 0 + Tier 1 (includes governance bundles)
  --tier0-only              Tier 0 engineering gate only
  --tier1-only              Tier 1 staging readiness only
  --skip-governance-bundles Skip test:ci:governance-bundles (local dev)
  --skip-staging-env        Skip verify:staging-env with explicit reason
  --checklist-only          Print runbook steps
`);
    process.exit(0);
  }

  if (hasFlag("--checklist-only")) {
    printRunbook();
    process.exit(0);
  }

  console.log(`\n[${PILOT_TIER_PREFLIGHT_ERA17_NPM_SCRIPT}] ${PILOT_TIER_PREFLIGHT_ERA17_POLICY_ID}\n`);

  const steps: PilotTierPreflightStep[] = [];
  const runTier0 = !hasFlag("--tier1-only");
  const runTier1 = !hasFlag("--tier0-only");
  const skipGovernance = hasFlag("--skip-governance-bundles");
  const skipStagingEnv = hasFlag("--skip-staging-env");
  const marketingClaimsStrict = true;

  if (runTier0) {
    for (const script of PILOT_TIER_PREFLIGHT_ERA17_TIER0_COMMANDS) {
      if (script === "test:ci:governance-bundles" && skipGovernance) {
        steps.push({
          id: "tier0_governance_bundles",
          tier: "tier0",
          label: "Governance bundles (Tier 0)",
          status: "SKIPPED",
          reason: "--skip-governance-bundles — run on release branch before paid pilot GO",
        });
        continue;
      }
      console.log(`\n→ npm run ${script}\n`);
      const code = runNpmScript(script);
      steps.push({
        id: `tier0_${script.replace(/[:]/g, "_")}`,
        tier: "tier0",
        label: `Tier 0 — ${script}`,
        status: code === 0 ? "PASSED" : "FAILED",
        reason: code === 0 ? undefined : `exit ${code}`,
      });
    }
  }

  if (runTier1) {
    console.log("\n→ MARKETING_CLAIMS_STRICT=1 npm run verify-claims\n");
    const claimsCode = runNpmScript("verify-claims", { MARKETING_CLAIMS_STRICT: "1" });
    steps.push({
      id: "tier1_verify_claims_strict",
      tier: "tier1",
      label: "Marketing claims strict verify",
      status: claimsCode === 0 ? "PASSED" : "FAILED",
      reason: claimsCode === 0 ? undefined : `exit ${claimsCode}`,
    });

    console.log("\n→ npm run audit:marketing-claims\n");
    const auditCode = runNpmScript("audit:marketing-claims");
    steps.push({
      id: "tier1_audit_marketing_claims",
      tier: "tier1",
      label: "Marketing claims registry audit",
      status: auditCode === 0 ? "PASSED" : "FAILED",
      reason: auditCode === 0 ? undefined : `exit ${auditCode}`,
    });

    if (skipStagingEnv || !stagingEnvConfigured()) {
      steps.push({
        id: "tier1_staging_env",
        tier: "tier1",
        label: "Staging environment verify",
        status: "SKIPPED",
        reason: skipStagingEnv
          ? "--skip-staging-env — run verify:staging-env on staging deploy target"
          : "Missing DATABASE_URL / NEXT_PUBLIC_SUPABASE_URL / CRON_SECRET — configure staging env",
      });
    } else {
      console.log("\n→ npm run verify:staging-env\n");
      const stagingCode = runNpmScript("verify:staging-env");
      steps.push({
        id: "tier1_staging_env",
        tier: "tier1",
        label: "Staging environment verify",
        status: stagingCode === 0 ? "PASSED" : "FAILED",
        reason: stagingCode === 0 ? undefined : `exit ${stagingCode}`,
      });
    }

    console.log("\n→ npm run test:ci:pilot-preflight-claims:cert\n");
    const claimsCertCode = runNpmScript("test:ci:pilot-preflight-claims:cert");
    steps.push({
      id: "tier1_pilot_preflight_claims_cert",
      tier: "tier1",
      label: "Pilot preflight claims cert wiring",
      status: claimsCertCode === 0 ? "PASSED" : "FAILED",
      reason: claimsCertCode === 0 ? undefined : `exit ${claimsCertCode}`,
    });
  }

  const summary = buildPilotTierPreflightSummary(steps, {
    commitSha: readCommitSha(),
    marketingClaimsStrict,
  });
  writeSummaryArtifact(summary);

  for (const line of formatPilotTierPreflightReportLines(summary)) {
    console.log(line);
  }
  console.log(`\nSummary artifact: ${PILOT_TIER_PREFLIGHT_ERA17_SUMMARY_ARTIFACT}\n`);

  printRunbook();

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
