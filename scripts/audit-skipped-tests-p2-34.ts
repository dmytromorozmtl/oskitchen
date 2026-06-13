/**
 * Audit P2-34 skipped tests registry and chromium-authed fixes.
 *
 * Usage:
 *   npm run audit:skipped-tests-p2-34
 */
import {
  auditSkippedTestsP2_34,
  formatSkippedTestsAuditP2_34Lines,
} from "@/lib/qa/skipped-tests-audit-p2-34-audit";

function main(): void {
  const summary = auditSkippedTestsP2_34();

  console.log("");
  for (const line of formatSkippedTestsAuditP2_34Lines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Skipped tests audit P2-34 OK");
}

main();
