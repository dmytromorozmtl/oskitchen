/**
 * Audit recipe costing engine (Blueprint P2-97).
 *
 * Usage:
 *   npm run audit:recipe-costing-engine-p2-97
 */
import {
  auditRecipeCostingEngineP2_97,
  formatRecipeCostingEngineP2_97AuditLines,
} from "@/lib/inventory/recipe-costing-engine-p2-97-audit";

function main(): void {
  const summary = auditRecipeCostingEngineP2_97();

  console.log("");
  for (const line of formatRecipeCostingEngineP2_97AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Recipe costing engine (P2-97) audit OK");
}

main();
