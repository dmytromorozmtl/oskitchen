/**
 * Audit content marketing pipeline (Blueprint P1-81).
 *
 * Usage:
 *   npm run audit:content-marketing-pipeline
 */
import {
  auditContentMarketingPipeline,
  formatContentMarketingPipelineAuditLines,
} from "@/lib/marketing/content-marketing-pipeline-audit";

function main(): void {
  const summary = auditContentMarketingPipeline();

  console.log("");
  for (const line of formatContentMarketingPipelineAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Content marketing pipeline audit OK");
}

main();
