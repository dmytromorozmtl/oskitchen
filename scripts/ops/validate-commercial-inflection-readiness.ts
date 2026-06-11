#!/usr/bin/env npx tsx
/**
 * Commercial inflection readiness — honest P0 blocker matrix (never fakes PASS).
 */
import {
import { logger } from "@/lib/logger";
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
    logger.cli(JSON.stringify(result, null, 2));
    process.exit(
      COMMERCIAL_INFLECTION_BLOCKED_MILESTONES.includes(result.milestone) ? 2 : 0,
    );
    return;
  }

  logger.cli(`\nCommercial inflection readiness (${COMMERCIAL_INFLECTION_READINESS_POLICY_ID})\n`);
  logger.cli(`Milestone: ${result.milestone}`);
  logger.cli(
    `Scores: pilot executable ${result.pilotExecutableScore}/100 · governance ${result.governanceScore}/100 (governance ≠ market ready)`,
  );
  logger.cli(`P0 proof: ${result.p0ProofStatus} · GO: ${result.goDecision ?? "missing"}`);
  logger.cli(
    `Registries LIVE: integrations ${result.integrationRegistryLiveCount} · channels ${result.channelRegistryLiveCount}`,
  );
  logger.cli(`P0 vault missing: ${result.p0VaultMissingCount}/11\n`);

  for (const row of result.blockers) {
    logger.cli(`[${row.priority}] [${row.status}] ${row.title}`);
    logger.cli(`  ${row.detail}`);
  }

  logger.cli(`\nMatrix doc: ${COMMERCIAL_INFLECTION_MASTER_MATRIX_DOC}\n`);
  logger.cli("Recommended:");
  for (const command of result.recommendedCommands) {
    logger.cli(`  ${command}`);
  }
  logger.cli("");
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
