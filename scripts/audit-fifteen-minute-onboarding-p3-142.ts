/**
 * Audit 15-minute onboarding baseline (Blueprint P3-142).
 *
 * Usage:
 *   npm run audit:fifteen-minute-onboarding-p3-142
 */
import {
  auditFifteenMinuteOnboardingP3_142,
  formatFifteenMinuteOnboardingP3_142AuditLines,
} from "@/lib/onboarding/fifteen-minute-onboarding-p3-142-audit";

function main(): void {
  const summary = auditFifteenMinuteOnboardingP3_142();

  console.log("");
  for (const line of formatFifteenMinuteOnboardingP3_142AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ 15-minute onboarding audit OK");
}

main();
