/**
 * Era 20 Tier 2 staging golden path — Woo → Order Hub → KDS → Packing.
 *
 * Prerequisite: artifacts/p0-staging-proof-unblock-summary.json → proof_passed.
 * Missing manual phase env → SKIPPED WITH REASON (exit 0). Real failures → exit 1.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

import { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import {
  TIER2_STAGING_GOLDEN_PATH_ERA20_CHILD_SMOKES,
  TIER2_STAGING_GOLDEN_PATH_ERA20_NPM_SCRIPT,
  TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC,
  TIER2_STAGING_GOLDEN_PATH_ERA20_POLICY_ID,
  TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT,
} from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import {
import { logger } from "@/lib/logger";
  buildTier2StagingGoldenPathSummary,
  formatTier2StagingGoldenPathReportLines,
  type Tier2StagingGoldenPathStep,
} from "@/lib/commercial/tier2-staging-golden-path-summary";

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function runNpmScript(script: string): number {
  const result = spawnSync("npm", ["run", script], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

function readP0Artifact(): { p0ProofStatus: string | null; overall: string | null } {
  const path = join(process.cwd(), P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT);
  if (!existsSync(path)) {
    return { p0ProofStatus: null, overall: null };
  }
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as {
      p0ProofStatus?: string;
      overall?: string;
    };
    return {
      p0ProofStatus: parsed.p0ProofStatus ?? null,
      overall: parsed.overall ?? null,
    };
  } catch {
    return { p0ProofStatus: null, overall: null };
  }
}

function readCommitSha(): string | null {
  return (
    process.env.PILOT_GOLDEN_PATH_COMMIT_SHA?.trim() ??
    process.env.GITHUB_SHA?.trim() ??
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ??
    null
  );
}

function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    logger.cli(`
Era 20 Tier 2 staging golden path

  (default)       Check P0 gate + run child smokes + write summary
  --checklist-only  Print playbook path and manual phase env vars
  --dry-run         Write summary without running child smokes

Prerequisite: ${P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT} → p0ProofStatus: proof_passed

Manual phase sign-off (after staging execution):
  TIER2_CHANNEL_WEBHOOK_MANUAL=PASSED
  TIER2_KDS_BUMP_MANUAL=PASSED
  TIER2_PACKING_COMPLETE_MANUAL=PASSED
  GITHUB_KDS_STAGING_RUN_URL + GITHUB_KDS_STAGING_RUN_OUTCOME=PASSED

Playbook: ${TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC}
`);
    process.exit(0);
  }

  if (hasFlag("--checklist-only")) {
    logger.cli(`\nTier 2 staging golden path (${TIER2_STAGING_GOLDEN_PATH_ERA20_POLICY_ID})\n`);
    logger.cli(`Playbook: ${TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC}\n`);
    logger.cli("Child smokes (after P0 PASS):");
    for (const script of TIER2_STAGING_GOLDEN_PATH_ERA20_CHILD_SMOKES) {
      logger.cli(`  npm run ${script}`);
    }
    logger.cli("\nManual phases:");
    logger.cli("  TIER2_CHANNEL_WEBHOOK_MANUAL=PASSED  — Woo/Shopify order in Order Hub");
    logger.cli("  TIER2_KDS_BUMP_MANUAL=PASSED         — KDS bump on staging");
    logger.cli("  TIER2_PACKING_COMPLETE_MANUAL=PASSED — Packing terminal state");
    logger.cli("  GITHUB_KDS_STAGING_RUN_URL + OUTCOME — Playwright KDS green URL\n");
    process.exit(0);
  }

  logger.cli(`\n[${TIER2_STAGING_GOLDEN_PATH_ERA20_NPM_SCRIPT}] ${TIER2_STAGING_GOLDEN_PATH_ERA20_POLICY_ID}\n`);

  const p0 = readP0Artifact();
  const p0Passed = p0.p0ProofStatus === "proof_passed";

  const p0GateStep: Tier2StagingGoldenPathStep = {
    id: "p0_proof_gate",
    label: "P0 staging proof unblock",
    kind: "p0_gate",
    status: p0Passed ? "PASSED" : "SKIPPED",
    reason: p0Passed
      ? `${P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT} → proof_passed`
      : `Blocked — p0ProofStatus=${p0.p0ProofStatus ?? "missing artifact"}. Run npm run smoke:p0-staging-proof-unblock after ops vault.`,
  };

  const childSteps: Tier2StagingGoldenPathStep[] = [];
  const dryRun = hasFlag("--dry-run");

  if (p0Passed && !dryRun) {
    for (const script of TIER2_STAGING_GOLDEN_PATH_ERA20_CHILD_SMOKES) {
      logger.cli(`\n→ npm run ${script}\n`);
      const code = runNpmScript(script);
      childSteps.push({
        id: script.replace("smoke:", ""),
        label: script,
        kind: "child_smoke",
        status: code === 0 ? "PASSED" : "FAILED",
        reason: code === 0 ? "exit 0" : `exit ${code}`,
      });
    }
  } else if (!p0Passed) {
    for (const script of TIER2_STAGING_GOLDEN_PATH_ERA20_CHILD_SMOKES) {
      childSteps.push({
        id: script.replace("smoke:", ""),
        label: script,
        kind: "child_smoke",
        status: "SKIPPED",
        reason: "P0 gate not passed",
      });
    }
  } else {
    for (const script of TIER2_STAGING_GOLDEN_PATH_ERA20_CHILD_SMOKES) {
      childSteps.push({
        id: script.replace("smoke:", ""),
        label: script,
        kind: "child_smoke",
        status: "SKIPPED",
        reason: "--dry-run",
      });
    }
  }

  const summary = buildTier2StagingGoldenPathSummary({
    commitSha: readCommitSha(),
    p0ProofStatus: p0.p0ProofStatus,
    p0GateStep,
    childSteps,
  });

  const artifactPath = join(process.cwd(), TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT);
  mkdirSync(dirname(artifactPath), { recursive: true });
  writeFileSync(artifactPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  logger.cli(`\nTier 2 staging golden path (${TIER2_STAGING_GOLDEN_PATH_ERA20_POLICY_ID})\n`);
  for (const line of formatTier2StagingGoldenPathReportLines(summary)) {
    logger.cli(line);
  }
  logger.cli(`\nSummary artifact: ${TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT}\n`);
  logger.cli(`Playbook: ${TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC}\n`);

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

main();
