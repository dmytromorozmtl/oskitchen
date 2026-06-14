import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPublicPagesErrorTsxP243,
  collectPublicPagePaths,
  formatPublicPagesErrorTsxP243AuditLines,
} from "@/lib/frontend/public-pages-error-tsx-p2-43-audit";
import {
  PUBLIC_LAYOUT_ERROR_SEGMENTS,
  PUBLIC_PAGES_ERROR_TSX_P2_43_ARTIFACT,
  PUBLIC_PAGES_ERROR_TSX_P2_43_CHECK_NPM_SCRIPT,
  PUBLIC_PAGES_ERROR_TSX_P2_43_CI_NPM_SCRIPT,
  PUBLIC_PAGES_ERROR_TSX_P2_43_CI_WORKFLOW,
  PUBLIC_PAGES_ERROR_TSX_P2_43_COMPONENT,
  PUBLIC_PAGES_ERROR_TSX_P2_43_DOC,
  PUBLIC_PAGES_ERROR_TSX_P2_43_PAGE_COUNT,
  PUBLIC_PAGES_ERROR_TSX_P2_43_POLICY_ID,
  PUBLIC_PAGES_ERROR_TSX_P2_43_TEMPLATE_MARKER,
  PUBLIC_PAGES_ERROR_TSX_P2_43_WIRING_PATHS,
  publicLayoutErrorUsesTemplate,
  publicPageHasErrorAncestor,
} from "@/lib/frontend/public-pages-error-tsx-p2-43-policy";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Public pages error.tsx — layout catch-all (P2-43)", () => {
  it("locks P2-43 policy with 251 public pages and 10 layout segments", () => {
    expect(PUBLIC_PAGES_ERROR_TSX_P2_43_POLICY_ID).toBe("public-pages-error-tsx-p2-43-v1");
    expect(PUBLIC_PAGES_ERROR_TSX_P2_43_PAGE_COUNT).toBe(251);
    expect(PUBLIC_LAYOUT_ERROR_SEGMENTS).toHaveLength(10);
    expect(collectPublicPagePaths(ROOT)).toHaveLength(251);
  });

  it.each(PUBLIC_LAYOUT_ERROR_SEGMENTS)(
    "$id layout error uses PublicLayoutError with segment home CTA",
    (segment) => {
      expect(existsSync(join(ROOT, segment.errorPath))).toBe(true);
      const source = readSource(segment.errorPath);
      expect(publicLayoutErrorUsesTemplate(source)).toBe(true);
      expect(source).toContain(segment.homeHref);
      expect(source).toContain(segment.homeLabel);
    },
  );

  it("251/251 public pages have an error.tsx ancestor", () => {
    const pages = collectPublicPagePaths(ROOT);
    expect(pages).toHaveLength(251);
    for (const pagePath of pages) {
      expect(publicPageHasErrorAncestor(pagePath, ROOT), pagePath).toBe(true);
    }
  });

  it("passes full P2-43 audit", () => {
    const summary = auditPublicPagesErrorTsxP243(ROOT);
    expect(summary.publicPageCount).toBe(251);
    expect(summary.pagesWithErrorAncestor).toBe(251);
    expect(summary.uncoveredPages).toEqual([]);
    expect(summary.passed).toBe(true);
  });

  it("P2-43 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of PUBLIC_PAGES_ERROR_TSX_P2_43_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${PUBLIC_PAGES_ERROR_TSX_P2_43_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${PUBLIC_PAGES_ERROR_TSX_P2_43_CI_NPM_SCRIPT}"`);

    const ci = readSource(PUBLIC_PAGES_ERROR_TSX_P2_43_CI_WORKFLOW);
    expect(ci).toContain(PUBLIC_PAGES_ERROR_TSX_P2_43_CHECK_NPM_SCRIPT);

    const doc = readSource(PUBLIC_PAGES_ERROR_TSX_P2_43_DOC);
    expect(doc).toContain(PUBLIC_PAGES_ERROR_TSX_P2_43_POLICY_ID);

    const component = readSource(PUBLIC_PAGES_ERROR_TSX_P2_43_COMPONENT);
    expect(component).toContain(PUBLIC_PAGES_ERROR_TSX_P2_43_TEMPLATE_MARKER);

    const artifact = JSON.parse(readSource(PUBLIC_PAGES_ERROR_TSX_P2_43_ARTIFACT));
    expect(artifact.policyId).toBe(PUBLIC_PAGES_ERROR_TSX_P2_43_POLICY_ID);
    expect(artifact.publicPageCount).toBe(251);
  });

  it("formats audit lines", () => {
    const summary = auditPublicPagesErrorTsxP243(ROOT);
    const lines = formatPublicPagesErrorTsxP243AuditLines(summary);
    expect(lines.some((line) => line.includes(PUBLIC_PAGES_ERROR_TSX_P2_43_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
