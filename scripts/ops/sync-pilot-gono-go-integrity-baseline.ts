#!/usr/bin/env npx tsx
/**
 * Records pilot GO integrity baseline when decision GO — CI regression guard.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-gono-go-era17-policy";
import {
  PILOT_GONOGO_INTEGRITY_BASELINE_ARTIFACT,
  type PilotGoNoGoIntegrityBaseline,
} from "@/lib/commercial/pilot-gono-go-integrity-era28";

function readGoNoGoArtifact() {
  const path = join(process.cwd(), PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as {
    decision?: string;
    evaluatorInput?: { commitSha?: string | null };
  };
}

function main() {
  const write = process.argv.includes("--write");
  const artifact = readGoNoGoArtifact();

  if (!artifact) {
    console.error(`Missing ${PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT}`);
    process.exit(1);
  }

  if (artifact.decision !== "GO") {
    console.error(
      `Cannot record baseline — decision is ${artifact.decision ?? "missing"}, not GO.`,
    );
    process.exit(2);
  }

  const baseline: PilotGoNoGoIntegrityBaseline = {
    decision: "GO",
    recordedAt: new Date().toISOString(),
    commitSha: artifact.evaluatorInput?.commitSha ?? null,
  };

  if (!write) {
    console.log(JSON.stringify(baseline, null, 2));
    console.log("\nPass --write to persist baseline artifact.\n");
    return;
  }

  const path = join(process.cwd(), PILOT_GONOGO_INTEGRITY_BASELINE_ARTIFACT);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
  console.log(`Wrote ${PILOT_GONOGO_INTEGRITY_BASELINE_ARTIFACT}`);
}

const isDirectRun =
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module;

if (isDirectRun) {
  main();
}
