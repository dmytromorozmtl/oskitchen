import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  COMPETITOR_ALTERNATIVE_HONESTY_MARKERS,
  COMPETITOR_ALTERNATIVE_PAGES,
  COMPETITOR_ALTERNATIVE_PAGES_DOC,
  COMPETITOR_ALTERNATIVE_PAGES_POLICY_ID,
  COMPETITOR_ALTERNATIVE_PAGES_WIRING_PATHS,
} from "@/lib/marketing/competitor-alternative-pages-policy";

export type CompetitorAlternativePagesAuditSummary = {
  policyId: typeof COMPETITOR_ALTERNATIVE_PAGES_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  routesWired: boolean;
  contentWired: boolean;
  componentWired: boolean;
  sitemapWired: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditCompetitorAlternativePages(
  root = process.cwd(),
): CompetitorAlternativePagesAuditSummary {
  const wiringComplete = COMPETITOR_ALTERNATIVE_PAGES_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let routesWired = false;
  let contentWired = false;
  let componentWired = false;
  let sitemapWired = false;

  if (existsSync(join(root, COMPETITOR_ALTERNATIVE_PAGES_DOC))) {
    const source = readFileSync(join(root, COMPETITOR_ALTERNATIVE_PAGES_DOC), "utf8");
    docWired = COMPETITOR_ALTERNATIVE_PAGES.every((entry) => source.includes(entry.path));
  }

  routesWired = COMPETITOR_ALTERNATIVE_PAGES.every((entry) => {
    if (!existsSync(join(root, entry.pagePath))) return false;
    const source = readFileSync(join(root, entry.pagePath), "utf8");
    return (
      source.includes("CompetitorAlternativeLanding") && source.includes(entry.slug)
    );
  });

  const contentPath = "lib/marketing/competitor-alternative-pages-content.ts";
  if (existsSync(join(root, contentPath))) {
    const source = readFileSync(join(root, contentPath), "utf8");
    contentWired = COMPETITOR_ALTERNATIVE_PAGES.every(
      (entry) => source.includes(entry.path) && source.includes(entry.compareSlug),
    );
  }

  const componentPath = "components/marketing/competitor-alternative-landing.tsx";
  if (existsSync(join(root, componentPath))) {
    const source = readFileSync(join(root, componentPath), "utf8");
    componentWired =
      source.includes("CompetitorAlternativeLanding") &&
      COMPETITOR_ALTERNATIVE_PAGES.filter((e) => e.positioningSection).every((entry) =>
        source.includes(entry.positioningSection!),
      );
  }

  const sitemapPath = "lib/marketing/sitemap-urls.ts";
  if (existsSync(join(root, sitemapPath))) {
    const source = readFileSync(join(root, sitemapPath), "utf8");
    sitemapWired = COMPETITOR_ALTERNATIVE_PAGES.every((entry) => source.includes(entry.path));
  }

  const combinedSources = [
    COMPETITOR_ALTERNATIVE_PAGES_DOC,
    contentPath,
    componentPath,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = COMPETITOR_ALTERNATIVE_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    routesWired &&
    contentWired &&
    componentWired &&
    sitemapWired &&
    honestyMarkersPresent;

  return {
    policyId: COMPETITOR_ALTERNATIVE_PAGES_POLICY_ID,
    wiringComplete,
    docWired,
    routesWired,
    contentWired,
    componentWired,
    sitemapWired,
    honestyMarkersPresent,
    passed,
  };
}

export function formatCompetitorAlternativePagesAuditLines(
  summary: CompetitorAlternativePagesAuditSummary,
): string[] {
  return [
    `Competitor alternative pages audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${COMPETITOR_ALTERNATIVE_PAGES_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Routes wired: ${summary.routesWired ? "yes" : "no"}`,
    `Content: ${summary.contentWired ? "yes" : "no"}`,
    `Component: ${summary.componentWired ? "yes" : "no"}`,
    `Sitemap: ${summary.sitemapWired ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
