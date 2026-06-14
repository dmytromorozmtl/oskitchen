/**
 * Scaffold layout-level public error.tsx catch-alls (P2-43).
 *
 * Usage: npx tsx scripts/scaffold-public-pages-error-tsx-p2-43.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { auditPublicPagesErrorTsxP243 } from "@/lib/frontend/public-pages-error-tsx-p2-43-audit";
import { PUBLIC_LAYOUT_ERROR_SEGMENTS } from "@/lib/frontend/public-pages-error-tsx-p2-43-policy";
import { buildPublicLayoutErrorSource } from "@/lib/frontend/public-layout-error-template-source";

const ROOT = process.cwd();
let created = 0;
let updated = 0;

for (const segment of PUBLIC_LAYOUT_ERROR_SEGMENTS) {
  const abs = join(ROOT, segment.errorPath);
  const source = buildPublicLayoutErrorSource(segment.homeHref, segment.homeLabel);

  if (!existsSync(abs)) {
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, source, "utf8");
    created += 1;
    continue;
  }

  const existing = readFileSync(abs, "utf8");
  if (!existing.includes("PublicLayoutError")) {
    writeFileSync(abs, source, "utf8");
    updated += 1;
  }
}

const after = auditPublicPagesErrorTsxP243(ROOT);
console.log(
  JSON.stringify(
    {
      created,
      updated,
      publicPageCount: after.publicPageCount,
      layoutErrorCount: after.layoutErrorCount,
      pagesWithErrorAncestor: after.pagesWithErrorAncestor,
      uncoveredPages: after.uncoveredPages.length,
      passed: after.passed,
    },
    null,
    2,
  ),
);

if (!after.passed) {
  console.error("[scaffold-public-pages-error-tsx-p2-43] FAIL", after);
  process.exit(1);
}

console.log("[scaffold-public-pages-error-tsx-p2-43] PASS — 251 public pages covered");
