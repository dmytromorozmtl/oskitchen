/**
 * Audit founder story blog post (Blueprint P3-68).
 *
 * Usage:
 *   npm run audit:founder-story-blog-p3-68
 */
import {
  auditFounderStoryBlogP3_68,
  formatFounderStoryBlogP3_68AuditLines,
} from "@/lib/marketing/founder-story-blog-p3-68-audit";

function main(): void {
  const summary = auditFounderStoryBlogP3_68();

  console.log("");
  for (const line of formatFounderStoryBlogP3_68AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ Founder story blog P3-68 OK");
}

main();
