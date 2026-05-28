#!/usr/bin/env npx tsx
/**
 * Validates Tier 2 golden path env vars without faking proof_passed.
 */
import { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT } from "@/lib/commercial/tier2-staging-golden-path-era20-policy";
import { resolveTier2GoldenPathMilestone } from "@/lib/commercial/tier2-golden-path-post-p0-orchestrator-era21";
import {
  TIER2_GOLDEN_PATH_ALL_TRACKED_ENV_KEYS,
  buildTier2GoldenPathPhaseStatuses,
} from "@/lib/commercial/tier2-staging-golden-path-phases-era21";
import { TIER2_STAGING_GOLDEN_PATH_ERA21_POLICY_ID } from "@/lib/commercial/tier2-staging-golden-path-era21-policy";
import type { Tier2StagingGoldenPathSummary } from "@/lib/commercial/tier2-staging-golden-path-summary";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function readTier2GoldenPathArtifacts(): {
  p0ProofStatus: string | null;
  tier2Summary: Tier2StagingGoldenPathSummary | null;
} {
  let p0ProofStatus: string | null = null;
  const p0Path = join(process.cwd(), P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT);
  if (existsSync(p0Path)) {
    try {
      const parsed = JSON.parse(readFileSync(p0Path, "utf8")) as { p0ProofStatus?: string };
      p0ProofStatus = parsed.p0ProofStatus ?? null;
    } catch {
      p0ProofStatus = null;
    }
  }

  let tier2Summary: Tier2StagingGoldenPathSummary | null = null;
  const tier2Path = join(process.cwd(), TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT);
  if (existsSync(tier2Path)) {
    try {
      tier2Summary = JSON.parse(readFileSync(tier2Path, "utf8")) as Tier2StagingGoldenPathSummary;
    } catch {
      tier2Summary = null;
    }
  }

  return { p0ProofStatus, tier2Summary };
}

export function evaluateTier2GoldenPathEnv(env: NodeJS.ProcessEnv = process.env): {
  p0ProofStatus: string | null;
  tier2ProofStatus: string | null;
  present: string[];
  missing: string[];
  phases: ReturnType<typeof buildTier2GoldenPathPhaseStatuses>;
  p0GatePassed: boolean;
  tier2GatePassed: boolean;
  tier2Milestone: ReturnType<typeof resolveTier2GoldenPathMilestone>;
} {
  const artifacts = readTier2GoldenPathArtifacts();
  const present = TIER2_GOLDEN_PATH_ALL_TRACKED_ENV_KEYS.filter((key) =>
    Boolean(env[key]?.trim()),
  );
  const missing = TIER2_GOLDEN_PATH_ALL_TRACKED_ENV_KEYS.filter(
    (key) => !env[key]?.trim(),
  );
  const phases = buildTier2GoldenPathPhaseStatuses({
    tier2Summary: artifacts.tier2Summary,
    env,
  });
  const p0GatePassed = artifacts.p0ProofStatus === "proof_passed";
  const tier2GatePassed = artifacts.tier2Summary?.tier2ProofStatus === "proof_passed";

  return {
    p0ProofStatus: artifacts.p0ProofStatus,
    tier2ProofStatus: artifacts.tier2Summary?.tier2ProofStatus ?? null,
    present,
    missing,
    phases,
    p0GatePassed,
    tier2GatePassed,
    tier2Milestone: resolveTier2GoldenPathMilestone({
      p0GatePassed,
      tier2GatePassed,
      phases,
    }),
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateTier2GoldenPathEnv();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: TIER2_STAGING_GOLDEN_PATH_ERA21_POLICY_ID,
          p0ProofStatus: result.p0ProofStatus,
          tier2ProofStatus: result.tier2ProofStatus,
          p0GatePassed: result.p0GatePassed,
          tier2GatePassed: result.tier2GatePassed,
          tier2Milestone: result.tier2Milestone,
          presentCount: result.present.length,
          totalTrackedEnvKeys: TIER2_GOLDEN_PATH_ALL_TRACKED_ENV_KEYS.length,
          missing: result.missing,
          phases: result.phases.map((phase) => ({
            id: phase.id,
            label: phase.label,
            complete: phase.complete,
            detail: phase.detail,
          })),
        },
        null,
        2,
      ),
    );
    process.exit(result.p0GatePassed ? 0 : 2);
  }

  console.log(`\nTier 2 golden path env validation (${TIER2_STAGING_GOLDEN_PATH_ERA21_POLICY_ID})\n`);
  console.log(`P0 gate: ${result.p0ProofStatus ?? "missing artifact"}`);
  console.log(`Tier 2 artifact: ${result.tier2ProofStatus ?? "no artifact"}`);
  console.log(`Tier 2 milestone: ${result.tier2Milestone}\n`);

  if (!result.p0GatePassed) {
    console.log("Blocked — configure P0 ops vault first:");
    console.log("  npm run ops:run-p0-vault-day0-orchestrator -- --write");
    console.log("  npm run ops:validate-p0-vault-env\n");
    process.exit(2);
  }

  for (const phase of result.phases) {
    console.log(`${phase.complete ? "✓" : "○"} ${phase.label}`);
    console.log(`  ${phase.detail}\n`);
  }

  console.log(`Env vars present: ${result.present.length}/${TIER2_GOLDEN_PATH_ALL_TRACKED_ENV_KEYS.length}`);
  if (result.missing.length > 0) {
    console.log(`Missing: ${result.missing.join(", ")}`);
  }
  console.log("\nOrchestrator: npm run ops:run-tier2-golden-path-post-p0-orchestrator -- --write");
  console.log("Smoke: npm run smoke:tier2-staging-golden-path\n");
  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
