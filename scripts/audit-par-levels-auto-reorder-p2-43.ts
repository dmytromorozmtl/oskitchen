/**
 * Audit par levels + auto-reorder (Blueprint P2-43).
 *
 * Usage:
 *   npm run audit:par-levels-auto-reorder-p2-43
 */
import {
  auditParLevelsAutoReorderP2_43,
  formatParLevelsAutoReorderP2_43AuditLines,
} from "@/lib/inventory/par-levels-auto-reorder-p2-43-audit";

function main(): void {
  const summary = auditParLevelsAutoReorderP2_43();

  console.log("");
  for (const line of formatParLevelsAutoReorderP2_43AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Par levels auto-reorder P2-43 OK");
}

main();
