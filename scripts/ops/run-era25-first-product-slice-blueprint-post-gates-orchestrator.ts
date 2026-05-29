#!/usr/bin/env npx tsx
/**
 * Post-gates era25 first product slice blueprint orchestrator — sync blueprint report.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  buildEra25FirstProductSliceBlueprintPostGatesOrchestratorSummary,
  ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_POST_GATES_ORCHESTRATOR_ERA24_POLICY_ID,
} from "@/lib/commercial/era25-first-product-slice-blueprint-post-gates-orchestrator-era24";
import { ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_REPORT_PATH } from "@/lib/commercial/era25-first-product-slice-blueprint-phases-era24";
import { evaluateEra25FirstProductSliceBlueprint } from "@/lib/commercial/evaluate-era25-first-product-slice-blueprint";

export function runEra25FirstProductSliceBlueprintPostGatesOrchestrator(options: {
  writeArtifacts?: boolean;
} = {}): ReturnType<typeof buildEra25FirstProductSliceBlueprintPostGatesOrchestratorSummary> {
  const evaluation = evaluateEra25FirstProductSliceBlueprint();

  if (options.writeArtifacts) {
    execSync("npm run ops:sync-era25-first-product-slice-blueprint-report -- --write", {
      stdio: "inherit",
    });
    execSync("npm run ops:sync-era25-engineering-gates-require-signed-charter-report -- --write", {
      stdio: "inherit",
    });
  }

  return buildEra25FirstProductSliceBlueprintPostGatesOrchestratorSummary({
    evaluation,
    artifacts: {
      blueprintReportPresent: existsSync(
        join(process.cwd(), ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_REPORT_PATH),
      ),
    },
  });
}

function main() {
  const jsonOutput = process.argv.includes("--json");
  const write = process.argv.includes("--write");

  const summary = runEra25FirstProductSliceBlueprintPostGatesOrchestrator({
    writeArtifacts: write,
  });

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.milestone === "engineering_gates_blocked" ? 2 : 0);
    return;
  }

  console.log(
    `\nera25 first product slice blueprint post-gates orchestrator (${ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_POST_GATES_ORCHESTRATOR_ERA24_POLICY_ID})\n`,
  );
  console.log(`Milestone: ${summary.milestone}`);
  console.log(`Canonical slice: ${summary.canonicalSliceName}`);
  console.log(`Blueprint blocked: ${summary.blueprintBlocked ? "yes" : "no"}`);
  console.log(`Gates milestone: ${summary.era25EngineeringGatesMilestone}`);
  console.log("\nRecommended:");
  for (const command of summary.recommendedCommands) {
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
