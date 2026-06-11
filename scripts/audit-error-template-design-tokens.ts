/**
 * Audit error template design tokens (illustration + title + description + actions + dark mode).
 *
 * Usage:
 *   npm run audit:error-template-design-tokens
 */
import {
  auditErrorTemplateDesignTokens,
  formatErrorTemplateDesignTokensAuditLines,
} from "@/lib/design/error-template-design-tokens-audit";

function main(): void {
  const summary = auditErrorTemplateDesignTokens();

  console.log("");
  for (const line of formatErrorTemplateDesignTokensAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Error template design tokens audit OK");
}

main();
