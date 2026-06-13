/**
 * Audit restaurant integration health landing page (Blueprint P3-63).
 *
 * Usage:
 *   npm run audit:restaurant-integration-health-landing-p3-63
 */
import {
  auditRestaurantIntegrationHealthLandingP3_63,
  formatRestaurantIntegrationHealthLandingP3_63AuditLines,
} from "@/lib/marketing/restaurant-integration-health-landing-p3-63-audit";

function main(): void {
  const summary = auditRestaurantIntegrationHealthLandingP3_63();

  console.log("");
  for (const line of formatRestaurantIntegrationHealthLandingP3_63AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Restaurant integration health landing P3-63 OK");
}

main();
