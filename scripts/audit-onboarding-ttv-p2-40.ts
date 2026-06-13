/**
 * Audit onboarding TTV measurement (Blueprint P2-40).
 *
 * Usage:
 *   npm run audit:onboarding-ttv-p2-40
 */
import {
  auditOnboardingTtvP2_40,
  formatOnboardingTtvP2_40AuditLines,
} from "@/lib/onboarding/onboarding-ttv-p2-40-audit";

function main(): void {
  const summary = auditOnboardingTtvP2_40();

  console.log("");
  for (const line of formatOnboardingTtvP2_40AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Onboarding TTV P2-40 OK");
}

main();
