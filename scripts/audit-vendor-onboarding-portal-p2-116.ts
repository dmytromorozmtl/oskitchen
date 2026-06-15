/**
 * Audit vendor onboarding portal (Blueprint P2-116).
 *
 * Usage:
 *   npm run audit:vendor-onboarding-portal-p2-116
 */
import {
  auditVendorOnboardingPortalP2_116,
  formatVendorOnboardingPortalP2_116AuditLines,
} from "@/lib/marketplace/vendor-onboarding-portal-p2-116-audit";

function main(): void {
  const summary = auditVendorOnboardingPortalP2_116();

  console.log("");
  for (const line of formatVendorOnboardingPortalP2_116AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Vendor onboarding portal (P2-116) audit OK");
}

main();
