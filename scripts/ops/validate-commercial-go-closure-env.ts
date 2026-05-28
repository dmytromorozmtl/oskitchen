#!/usr/bin/env npx tsx
/**
 * Validates commercial GO closure env + artifact gates (Step 3).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { resolveCommercialGoClosureMilestone } from "@/lib/commercial/commercial-go-closure-post-tier2-orchestrator-era21";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import {
  buildCommercialGoClosurePhaseStatuses,
  COMMERCIAL_GO_CLOSURE_TRACKED_ENV_KEYS,
  P0_STAGING_PROOF_ARTIFACT_PATH,
  PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH,
  resolveCommercialGoClosurePrerequisites,
} from "@/lib/commercial/commercial-go-closure-phases-era21";

function readJson<T>(path: string): T | null {
  const full = join(process.cwd(), path);
  if (!existsSync(full)) return null;
  try {
    return JSON.parse(readFileSync(full, "utf8")) as T;
  } catch {
    return null;
  }
}

export function readCommercialGoClosureArtifacts(): {
  p0ProofStatus: string | null;
  tier2ProofStatus: string | null;
  goNoGoSummary: PilotGoNoGoSummary | null;
} {
  const p0 = readJson<{ p0ProofStatus?: string }>(P0_STAGING_PROOF_ARTIFACT_PATH);
  const tier2 = readJson<{ tier2ProofStatus?: string }>(TIER2_STAGING_GOLDEN_PATH_ARTIFACT_PATH);
  const goNoGo = readJson<PilotGoNoGoSummary>(PILOT_GONOGO_SUMMARY_ARTIFACT_PATH);

  return {
    p0ProofStatus: p0?.p0ProofStatus ?? null,
    tier2ProofStatus: tier2?.tier2ProofStatus ?? null,
    goNoGoSummary: goNoGo,
  };
}

export function evaluateCommercialGoClosureEnv(env: NodeJS.ProcessEnv = process.env): {
  prerequisites: ReturnType<typeof resolveCommercialGoClosurePrerequisites>;
  present: string[];
  missing: string[];
  phases: ReturnType<typeof buildCommercialGoClosurePhaseStatuses>;
  decision: string | null;
  readyForGoOrchestrator: boolean;
  goClosureMilestone: ReturnType<typeof resolveCommercialGoClosureMilestone>;
} {
  const artifacts = readCommercialGoClosureArtifacts();
  const prerequisites = resolveCommercialGoClosurePrerequisites({
    p0ProofStatus: artifacts.p0ProofStatus,
    tier2ProofStatus: artifacts.tier2ProofStatus,
  });
  const present = COMMERCIAL_GO_CLOSURE_TRACKED_ENV_KEYS.filter((key) => Boolean(env[key]?.trim()));
  const missing = COMMERCIAL_GO_CLOSURE_TRACKED_ENV_KEYS.filter((key) => !env[key]?.trim());
  const phases = buildCommercialGoClosurePhaseStatuses({
    prerequisites,
    goNoGoSummary: artifacts.goNoGoSummary,
    env,
  });
  const decision = artifacts.goNoGoSummary?.decision ?? null;
  const readyForGoOrchestrator =
    prerequisites.prerequisitesComplete &&
    phases.filter((p) => p.id !== "go_orchestrator").every((p) => p.complete);

  return {
    prerequisites,
    present,
    missing,
    phases,
    decision,
    readyForGoOrchestrator,
    goClosureMilestone: resolveCommercialGoClosureMilestone({
      prerequisitesComplete: prerequisites.prerequisitesComplete,
      decision,
      phases,
    }),
  };
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateCommercialGoClosureEnv();

  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          policyId: "era21-commercial-go-closure-v1",
          prerequisitesComplete: result.prerequisites.prerequisitesComplete,
          p0ProofStatus: result.prerequisites.p0ProofStatus,
          tier2ProofStatus: result.prerequisites.tier2ProofStatus,
          decision: result.decision,
          readyForGoOrchestrator: result.readyForGoOrchestrator,
          goClosureMilestone: result.goClosureMilestone,
          presentCount: result.present.length,
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
    process.exit(result.prerequisites.prerequisitesComplete ? 0 : 2);
  }

  console.log(`\nCommercial GO closure validation (era21-commercial-go-closure-v1)\n`);

  if (!result.prerequisites.prerequisitesComplete) {
    console.log("Blocked — complete P0 + Tier 2 proof_passed first:");
    console.log("  npm run ops:run-tier2-golden-path-post-p0-orchestrator -- --write");
    console.log("  npm run ops:validate-tier2-golden-path-env -- --json\n");
    process.exit(2);
  }

  console.log(`GO closure milestone: ${result.goClosureMilestone}\n`);

  for (const phase of result.phases) {
    console.log(`${phase.complete ? "✓" : "○"} ${phase.label}`);
    console.log(`  ${phase.detail}\n`);
  }

  console.log(`Decision: ${result.decision ?? "not evaluated"}`);
  console.log(`Ready for smoke:pilot-gono-go: ${result.readyForGoOrchestrator ? "yes" : "no"}`);
  console.log("Orchestrator: npm run ops:run-commercial-go-closure-post-tier2-orchestrator -- --write\n");
  process.exit(0);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
