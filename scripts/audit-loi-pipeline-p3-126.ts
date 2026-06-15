/**
 * Audit design partner LOI pipeline (Blueprint P3-126).
 *
 * Usage:
 *   npm run audit:loi-pipeline-p3-126
 */
import {
  auditLoiPipeline,
  formatLoiPipelineAuditLines,
} from "@/lib/pm/loi-pipeline-p3-126-audit";

function main(): void {
  const summary = auditLoiPipeline();

  console.log("");
  for (const line of formatLoiPipelineAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ LOI pipeline audit OK");
}

main();
