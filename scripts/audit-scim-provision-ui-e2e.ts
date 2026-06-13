/**
 * Audit P2-35 SCIM provision UI E2E wiring.
 *
 * Usage:
 *   npm run audit:scim-provision-ui-e2e
 */
import {
  auditScimProvisionUiE2E,
  formatScimProvisionUiE2EAuditLines,
} from "@/lib/qa/scim-provision-ui-e2e-audit";

function main(): void {
  const summary = auditScimProvisionUiE2E();

  console.log("");
  for (const line of formatScimProvisionUiE2EAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ SCIM provision UI E2E audit OK");
}

main();
