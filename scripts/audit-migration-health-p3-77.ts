/**
 * Audit migration health checker (Blueprint P3-77).
 *
 * Usage:
 *   npm run audit:migration-health-p3-77
 */
import { auditMigrationHealthWiring } from "@/lib/devops/migration-health-audit";
import {
  auditMigrationHealthP3_77,
  formatMigrationHealthP3_77AuditLines,
} from "@/lib/devops/migration-health-p3-77-audit";

function main(): void {
  const upstream = auditMigrationHealthWiring();

  console.log("");
  console.log(`Migration health wiring (${upstream.policyId})`);
  console.log(`Script: ${upstream.scriptPresent ? "yes" : "no"}`);
  console.log(`require-db: ${upstream.scriptHasRequireDb ? "yes" : "no"}`);
  console.log(`migrate diff: ${upstream.scriptHasMigrateDiff ? "yes" : "no"}`);
  console.log(`Deploy gate: ${upstream.deployGateWired ? "yes" : "no"}`);
  console.log(`Passed: ${upstream.passed ? "YES" : "NO"}`);
  console.log("");

  const summary = auditMigrationHealthP3_77();

  for (const line of formatMigrationHealthP3_77AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Migration health P3-77 OK");
}

main();
