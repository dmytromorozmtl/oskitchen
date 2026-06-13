/**
 * Audit Lighthouse CI gate (Blueprint P3-60).
 *
 * Usage:
 *   npm run audit:lighthouse-ci-gate-p3-60
 */
import {
  auditLighthouseCiGateP3_60,
  formatLighthouseCiGateP3_60AuditLines,
} from "@/lib/qa/lighthouse-ci-gate-p3-60-audit";

function main(): void {
  const summary = auditLighthouseCiGateP3_60();

  console.log("");
  for (const line of formatLighthouseCiGateP3_60AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Lighthouse CI gate P3-60 OK");
}

main();
