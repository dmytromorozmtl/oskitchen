/**
 * Audit AI benchmark suite (Blueprint P2-108).
 *
 * Usage:
 *   npm run audit:ai-benchmark-suite-p2-108
 */
import {
  auditAiBenchmarkSuiteP2_108,
  formatAiBenchmarkSuiteP2_108AuditLines,
} from "@/lib/ai/ai-benchmark-suite-p2-108-audit";

function main(): void {
  const summary = auditAiBenchmarkSuiteP2_108();

  console.log("");
  for (const line of formatAiBenchmarkSuiteP2_108AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ AI benchmark suite (P2-108) audit OK");
}

main();
