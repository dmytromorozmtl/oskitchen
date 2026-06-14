import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  isPublicPagePath,
  PUBLIC_LAYOUT_ERROR_SEGMENTS,
  PUBLIC_PAGES_ERROR_TSX_P2_43_PAGE_COUNT,
  PUBLIC_PAGES_ERROR_TSX_P2_43_POLICY_ID,
  publicLayoutErrorUsesTemplate,
  publicPageHasErrorAncestor,
} from "@/lib/frontend/public-pages-error-tsx-p2-43-policy";

export type PublicPagesErrorTsxP243AuditSummary = {
  policyId: typeof PUBLIC_PAGES_ERROR_TSX_P2_43_POLICY_ID;
  publicPageCount: number;
  layoutErrorCount: number;
  pagesWithErrorAncestor: number;
  missingLayoutErrors: string[];
  nonTemplateLayoutErrors: string[];
  uncoveredPages: string[];
  passed: boolean;
};

function isPageFile(name: string): boolean {
  return name === "page.tsx" || name === "page.ts";
}

export function collectPublicPagePaths(root = process.cwd()): string[] {
  const appRoot = join(root, "app");
  const routes: string[] = [];

  function walk(dir: string) {
    const rel = dir.slice(root.length + 1).replace(/\\/g, "/");
    if (rel === "app/dashboard" || rel.startsWith("app/dashboard/")) {
      return;
    }

    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const absolutePath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath);
        continue;
      }
      if (isPageFile(entry.name)) {
        const pageRel = absolutePath.slice(root.length + 1).replace(/\\/g, "/");
        if (isPublicPagePath(pageRel)) routes.push(pageRel);
      }
    }
  }

  walk(appRoot);
  return routes.sort();
}

export function auditPublicPagesErrorTsxP243(
  root = process.cwd(),
): PublicPagesErrorTsxP243AuditSummary {
  const missingLayoutErrors: string[] = [];
  const nonTemplateLayoutErrors: string[] = [];

  for (const segment of PUBLIC_LAYOUT_ERROR_SEGMENTS) {
    const errorPath = join(root, segment.errorPath);
    if (!existsSync(errorPath)) {
      missingLayoutErrors.push(segment.errorPath);
      continue;
    }
    const source = readFileSync(errorPath, "utf8");
    if (!publicLayoutErrorUsesTemplate(source)) {
      nonTemplateLayoutErrors.push(segment.errorPath);
    }
  }

  const publicPages = collectPublicPagePaths(root);
  const uncoveredPages = publicPages.filter(
    (pagePath) => !publicPageHasErrorAncestor(pagePath, root),
  );

  const layoutErrorCount =
    PUBLIC_LAYOUT_ERROR_SEGMENTS.length - missingLayoutErrors.length;
  const pagesWithErrorAncestor = publicPages.length - uncoveredPages.length;

  const passed =
    missingLayoutErrors.length === 0 &&
    nonTemplateLayoutErrors.length === 0 &&
    uncoveredPages.length === 0 &&
    publicPages.length === PUBLIC_PAGES_ERROR_TSX_P2_43_PAGE_COUNT;

  return {
    policyId: PUBLIC_PAGES_ERROR_TSX_P2_43_POLICY_ID,
    publicPageCount: publicPages.length,
    layoutErrorCount,
    pagesWithErrorAncestor,
    missingLayoutErrors,
    nonTemplateLayoutErrors,
    uncoveredPages,
    passed,
  };
}

export function formatPublicPagesErrorTsxP243AuditLines(
  summary: PublicPagesErrorTsxP243AuditSummary,
): string[] {
  return [
    `Public pages error.tsx audit (${summary.policyId})`,
    `Public pages: ${summary.publicPageCount}`,
    `Layout error boundaries: ${summary.layoutErrorCount}/${PUBLIC_LAYOUT_ERROR_SEGMENTS.length}`,
    `Pages with error ancestor: ${summary.pagesWithErrorAncestor}/${summary.publicPageCount}`,
    `Missing layout errors: ${summary.missingLayoutErrors.length}`,
    `Non-template layout errors: ${summary.nonTemplateLayoutErrors.length}`,
    `Uncovered pages: ${summary.uncoveredPages.length}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
