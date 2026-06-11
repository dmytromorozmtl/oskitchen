/**
 * Top-5 bundle chunk audit + code-split wiring gate.
 *
 * Usage:
 *   npm run audit:bundle-chunks
 *   ANALYZE=true npm run analyze && npm run audit:bundle-chunks
 */
import {
  auditBundleChunks,
  formatBundleChunkAuditLines,
} from "@/lib/performance/bundle-chunk-audit";

function main(): void {
  const summary = auditBundleChunks();

  console.log("");
  for (const line of formatBundleChunkAuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Bundle chunk audit OK");
}

main();
