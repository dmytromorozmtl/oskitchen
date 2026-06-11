/**
 * Audit Command Center brand alignment with Today page.
 *
 * Usage:
 *   npm run audit:command-center-brand
 */
import {
  auditCommandCenterBrand,
  formatCommandCenterBrandAuditLines,
} from "@/lib/design/command-center-brand-audit";

function main(): void {
  const summary = auditCommandCenterBrand();

  console.log("");
  for (const line of formatCommandCenterBrandAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Command Center brand audit OK");
}

main();
