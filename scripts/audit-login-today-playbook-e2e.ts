/**
 * Audit Login → Today → Playbook E2E wiring.
 *
 * Usage:
 *   npm run audit:login-today-playbook-e2e
 */
import {
  auditLoginTodayPlaybookE2E,
  formatLoginTodayPlaybookAuditLines,
} from "@/lib/qa/login-today-playbook-e2e-audit";

function main(): void {
  const summary = auditLoginTodayPlaybookE2E();

  console.log("");
  for (const line of formatLoginTodayPlaybookAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Login → Today → Playbook E2E audit OK");
}

main();
