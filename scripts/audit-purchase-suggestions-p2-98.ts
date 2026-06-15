/**
 * Audit purchase suggestions AI (Blueprint P2-98).
 *
 * Usage:
 *   npm run audit:purchase-suggestions-p2-98
 */
import {
  auditPurchaseSuggestionsP2_98,
  formatPurchaseSuggestionsP2_98AuditLines,
} from "@/lib/inventory/purchase-suggestions-p2-98-audit";

function main(): void {
  const summary = auditPurchaseSuggestionsP2_98();

  console.log("");
  for (const line of formatPurchaseSuggestionsP2_98AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Purchase suggestions AI (P2-98) audit OK");
}

main();
