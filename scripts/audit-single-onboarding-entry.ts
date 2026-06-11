/**
 * Audit single onboarding entry — Onboarding Hub consolidates 4 legacy paths.
 *
 * Usage:
 *   npm run audit:single-onboarding-entry
 */
import {
  auditSingleOnboardingEntry,
  formatSingleOnboardingEntryAuditLines,
} from "@/lib/design/single-onboarding-entry-audit";

function main(): void {
  const summary = auditSingleOnboardingEntry();

  console.log("");
  for (const line of formatSingleOnboardingEntryAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Single onboarding entry audit OK");
}

main();
