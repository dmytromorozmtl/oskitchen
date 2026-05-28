/**
 * Validates config/marketing/claims-registry.json.
 * Run: npm run audit:marketing-claims
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CLAIMS_REGISTRY_PATH,
  CLAIMS_REGISTRY_POLICY_ID,
  type ClaimsRegistryRow,
  countClaimsByStatus,
  validateClaimsRegistryRows,
} from "@/lib/governance/claims-registry-policy";

const ROOT = process.cwd();

function main(): void {
  const rows = JSON.parse(
    readFileSync(join(ROOT, CLAIMS_REGISTRY_PATH), "utf8"),
  ) as ClaimsRegistryRow[];

  const errors = validateClaimsRegistryRows(rows);
  const counts = countClaimsByStatus(rows);

  console.log(`KitchenOS marketing claims registry audit (${CLAIMS_REGISTRY_POLICY_ID})\n`);
  console.log(`Claims tracked: ${rows.length}`);
  for (const [status, count] of Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`  ${status}: ${count}`);
  }

  if (errors.length > 0) {
    console.error("\nRegistry errors:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  const deprecated = rows.filter((row) => row.status === "deprecated");
  if (deprecated.length > 0) {
    console.warn("\nDeprecated claim rows (do not sell):");
    for (const row of deprecated) {
      console.warn(`- ${row.page} :: ${row.claim}`);
    }
  }

  console.log("\nOK — registry valid; no forbidden needs-evidence rows.");
}

main();
