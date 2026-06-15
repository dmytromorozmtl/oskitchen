/**
 * Audit allergen tracking (Blueprint P2-101).
 *
 * Usage:
 *   npm run audit:allergen-tracking-p2-101
 */
import {
  auditAllergenTrackingP2_101,
  formatAllergenTrackingP2_101AuditLines,
} from "@/lib/inventory/allergen-tracking-p2-101-audit";

function main(): void {
  const summary = auditAllergenTrackingP2_101();

  console.log("");
  for (const line of formatAllergenTrackingP2_101AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Allergen tracking (P2-101) audit OK");
}

main();
