/**
 * CI gate: fail if workspaceId migration regresses (more models stuck on userId-only).
 *
 *   npm run workspace:audit:gate
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const BASELINE_PATH = join(process.cwd(), "scripts/workspace-migration-baseline.json");

type Baseline = { maxNeedsMigration: number };

function loadBaseline(): Baseline {
  const raw = readFileSync(BASELINE_PATH, "utf8");
  return JSON.parse(raw) as Baseline;
}

function main() {
  const baseline = loadBaseline();
  const out = execSync("npx tsx scripts/audit-workspace-id-migration.ts --json", {
    encoding: "utf8",
  });
  const report = JSON.parse(out) as { needsMigration: number; needsMigrationModels: string[] };

  console.log(
    `workspaceId audit: ${report.needsMigration} models need migration (baseline max ${baseline.maxNeedsMigration})`,
  );

  if (report.needsMigration > baseline.maxNeedsMigration) {
    console.error(
      `Regression: ${report.needsMigration} > ${baseline.maxNeedsMigration}. Add workspaceId before merging.`,
    );
    process.exit(1);
  }

  console.log("OK — no workspace migration regression.");
}

main();
