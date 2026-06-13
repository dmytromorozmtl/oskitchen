/**
 * Audit P1-28 SEO blog articles (6 keyword-targeted posts).
 *
 * Usage:
 *   npm run audit:seo-blog-articles
 */
import {
  auditSeoBlogArticlesP128,
  formatSeoBlogArticlesP128AuditLines,
} from "@/lib/marketing/seo-blog-articles-p1-28-audit";

function main(): void {
  const summary = auditSeoBlogArticlesP128();

  console.log("");
  for (const line of formatSeoBlogArticlesP128AuditLines(summary)) {
    console.log(line);
  }
  console.log("");

  if (!summary.passed) {
    process.exit(1);
  }

  console.log("✓ SEO blog articles audit OK");
}

main();
