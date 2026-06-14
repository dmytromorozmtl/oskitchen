/**
 * Reports `where: { userId` patterns in services/ that should use owner scope helpers.
 *
 *   npx tsx scripts/audit-service-userid-scope.ts
 *   npx tsx scripts/audit-service-userid-scope.ts --fail
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { auditServiceUserIdScope } from "@/lib/security/cross-tenant-service-scope-audit";

const FAIL = process.argv.includes("--fail");

function main() {
  const hits = auditServiceUserIdScope(process.cwd());
  const baselinePath = join(process.cwd(), "scripts/service-userid-scope-baseline.json");
  let baseline = 0;
  try {
    const raw = JSON.parse(readFileSync(baselinePath, "utf8")) as { maxHits: number };
    baseline = raw.maxHits;
  } catch {
    // no baseline yet
  }

  console.log("OS Kitchen — service userId where audit\n");
  console.log(`Suspicious \`where: { userId\` hits: ${hits.length} (baseline max ${baseline})\n`);

  for (const h of hits.slice(0, 40)) {
    console.log(`  ${h.file}:${h.line}`);
    console.log(`    ${h.text}\n`);
  }
  if (hits.length > 40) {
    console.log(`  … and ${hits.length - 40} more\n`);
  }

  if (hits.length > baseline) {
    console.error(
      `FAIL — ${hits.length} hits exceed baseline ${baseline}. Scope services or update scripts/service-userid-scope-baseline.json after review.`,
    );
    process.exit(1);
  }

  if (FAIL && hits.length > 0) {
    console.error("FAIL — --fail with remaining hits");
    process.exit(1);
  }

  console.log(
    hits.length === 0
      ? "OK — no suspicious patterns."
      : `OK — within baseline (${hits.length} ≤ ${baseline}).`,
  );
}

main();
