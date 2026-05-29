#!/usr/bin/env npx tsx
/**
 * Commercial inflection readiness — honest P0 blocker matrix (never fakes PASS).
 */
import {
  COMMERCIAL_INFLECTION_BLOCKED_MILESTONES,
  COMMERCIAL_INFLECTION_MASTER_MATRIX_DOC,
  COMMERCIAL_INFLECTION_READINESS_POLICY_ID,
  evaluateCommercialInflectionReadiness,
} from "@/lib/commercial/commercial-inflection-readiness-era28";

export { evaluateCommercialInflectionReadiness };

function main() {
  const jsonOutput = process.argv.includes("--json");
  const result = evaluateCommercialInflectionReadiness();

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(
      COMMERCIAL_INFLECTION_BLOCKED_MILESTONES.includes(result.milestone) ? 2 : 0,
    );
    return;
  }

  console.log(`\nCommercial inflection readiness (${COMMERCIAL_INFLECTION_READINESS_POLICY_ID})\n`);
  console.log(`Milestone: ${result.milestone}`);
  console.log(
    `Scores: pilot executable ${result.pilotExecutableScore}/100 · governance ${result.governanceScore}/100 (governance ≠ market ready)`,
  );
  console.log(`P0 proof: ${result.p0ProofStatus} · GO: ${result.goDecision ?? "missing"}`);
  console.log(
    `Registries LIVE: integrations ${result.integrationRegistryLiveCount} · channels ${result.channelRegistryLiveCount}`,
  );
  console.log(`P0 vault missing: ${result.p0VaultMissingCount}/11\n`);

  for (const row of result.blockers) {
    console.log(`[${row.priority}] [${row.status}] ${row.title}`);
    console.log(`  ${row.detail}`);
  }

  console.log(`\nMatrix doc: ${COMMERCIAL_INFLECTION_MASTER_MATRIX_DOC}\n`);
  console.log("Recommended:");
  for (const command of result.recommendedCommands) {
    console.log(`  ${command}`);
  }
  console.log("");
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
