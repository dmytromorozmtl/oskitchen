/**
 * Audit rate limit E2E wiring.
 *
 * Usage:
 *   npm run audit:rate-limit-e2e
 */
import {
  auditRateLimitE2E,
  formatRateLimitE2EAuditLines,
} from "@/lib/qa/rate-limit-e2e-audit";

function main(): void {
  const summary = auditRateLimitE2E();

  console.log("");
  for (const line of formatRateLimitE2EAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Rate limit E2E audit OK");
}

main();
