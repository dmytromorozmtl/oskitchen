import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MARKETPLACE_SEO_HONESTY_MARKERS,
  MARKETPLACE_SEO_LEGACY_COMPARE_ROUTE,
  MARKETPLACE_SEO_LEGACY_MARKETPLACE_ROUTE,
  MARKETPLACE_SEO_PAGE_ENTRIES,
  MARKETPLACE_SEO_PAGES_DOC,
  MARKETPLACE_SEO_PAGES_POLICY_ID,
  MARKETPLACE_SEO_PAGES_WIRING_PATHS,
} from "@/lib/marketing/marketplace-seo-pages-policy";

export type MarketplaceSeoPagesAuditSummary = {
  policyId: typeof MARKETPLACE_SEO_PAGES_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  routesWired: boolean;
  contentWired: boolean;
  componentWired: boolean;
  sitemapWired: boolean;
  legacyRoutesLinked: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditMarketplaceSeoPages(root = process.cwd()): MarketplaceSeoPagesAuditSummary {
  const wiringComplete = MARKETPLACE_SEO_PAGES_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let routesWired = false;
  let contentWired = false;
  let componentWired = false;
  let sitemapWired = false;
  let legacyRoutesLinked = false;

  if (existsSync(join(root, MARKETPLACE_SEO_PAGES_DOC))) {
    const source = readFileSync(join(root, MARKETPLACE_SEO_PAGES_DOC), "utf8");
    docWired = MARKETPLACE_SEO_PAGE_ENTRIES.every((entry) => source.includes(entry.path));
  }

  routesWired = MARKETPLACE_SEO_PAGE_ENTRIES.every((entry) => {
    if (!existsSync(join(root, entry.pagePath))) return false;
    const source = readFileSync(join(root, entry.pagePath), "utf8");
    return source.includes("MarketplaceSeoLanding") && source.includes(entry.slug);
  });

  const contentPath = "lib/marketing/marketplace-seo-pages-content.ts";
  if (existsSync(join(root, contentPath))) {
    const source = readFileSync(join(root, contentPath), "utf8");
    contentWired = MARKETPLACE_SEO_PAGE_ENTRIES.every((entry) => source.includes(entry.path));
  }

  const componentPath = "components/marketing/marketplace-seo-landing.tsx";
  if (existsSync(join(root, componentPath))) {
    const source = readFileSync(join(root, componentPath), "utf8");
    componentWired =
      source.includes("MarketplaceSeoLanding") &&
      MARKETPLACE_SEO_PAGE_ENTRIES.every((entry) => source.includes(entry.testId));
  }

  const sitemapPath = "lib/marketing/sitemap-urls.ts";
  if (existsSync(join(root, sitemapPath))) {
    const source = readFileSync(join(root, sitemapPath), "utf8");
    sitemapWired = MARKETPLACE_SEO_PAGE_ENTRIES.every((entry) => source.includes(entry.path));
  }

  if (existsSync(join(root, contentPath))) {
    const source = readFileSync(join(root, contentPath), "utf8");
    legacyRoutesLinked =
      source.includes(MARKETPLACE_SEO_LEGACY_MARKETPLACE_ROUTE) &&
      source.includes(MARKETPLACE_SEO_LEGACY_COMPARE_ROUTE);
  }

  const combinedSources = [MARKETPLACE_SEO_PAGES_DOC, contentPath, componentPath]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = MARKETPLACE_SEO_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    routesWired &&
    contentWired &&
    componentWired &&
    sitemapWired &&
    legacyRoutesLinked &&
    honestyMarkersPresent;

  return {
    policyId: MARKETPLACE_SEO_PAGES_POLICY_ID,
    wiringComplete,
    docWired,
    routesWired,
    contentWired,
    componentWired,
    sitemapWired,
    legacyRoutesLinked,
    honestyMarkersPresent,
    passed,
  };
}

export function formatMarketplaceSeoPagesAuditLines(
  summary: MarketplaceSeoPagesAuditSummary,
): string[] {
  return [
    `Marketplace SEO pages audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${MARKETPLACE_SEO_PAGES_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Routes wired: ${summary.routesWired ? "yes" : "no"}`,
    `Content: ${summary.contentWired ? "yes" : "no"}`,
    `Component: ${summary.componentWired ? "yes" : "no"}`,
    `Sitemap: ${summary.sitemapWired ? "yes" : "no"}`,
    `Legacy marketplace routes: ${summary.legacyRoutesLinked ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
