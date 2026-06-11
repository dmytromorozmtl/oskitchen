/**
 * Audit forbidden claims on /, /pricing, /demo, /trust, /shopify (Blueprint P1-71).
 *
 * Usage:
 *   npm run audit:forbidden-claims-marketing-pages
 */
import {
  auditForbiddenClaimsMarketingPages,
  formatForbiddenClaimsAuditLines,
} from "@/lib/marketing/forbidden-claims-audit";

function main(): void {
  const summary = auditForbiddenClaimsMarketingPages();

  console.log("");
  for (const line of formatForbiddenClaimsAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Forbidden claims marketing pages audit OK");
}

main();
