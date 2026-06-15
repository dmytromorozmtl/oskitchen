/**
 * Audit inventory + reservations depth baseline (Blueprint P3-144).
 *
 * Usage:
 *   npm run audit:inventory-reservations-depth-p3-144
 */
import {
  auditInventoryReservationsDepthP3_144,
  formatInventoryReservationsDepthP3_144AuditLines,
} from "@/lib/inventory/inventory-reservations-depth-p3-144-audit";

function main(): void {
  const summary = auditInventoryReservationsDepthP3_144();

  console.log("");
  for (const line of formatInventoryReservationsDepthP3_144AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Inventory + reservations depth audit OK");
}

main();
