/**
 * Audit KDS bump → expo E2E wiring.
 *
 * Usage:
 *   npm run audit:kds-bump-expo-e2e
 */
import {
  auditKdsBumpExpoE2E,
  formatKdsBumpExpoAuditLines,
} from "@/lib/kitchen/kds-bump-expo-e2e-audit";

function main(): void {
  const summary = auditKdsBumpExpoE2E();

  console.log("");
  for (const line of formatKdsBumpExpoAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ KDS bump → expo E2E audit OK");
}

main();
