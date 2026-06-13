import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ICP_LANDING_LEGACY_REDIRECTS,
  ICP_LANDING_PAGE_ENTRIES,
  ICP_LANDING_PAGES_DOC,
  ICP_LANDING_PAGES_POLICY_ID,
  ICP_LANDING_PAGES_WIRING_PATHS,
  ICP_PILOT_HIGHLIGHTS_LANDING_IDS,
  ICP_PILOT_HIGHLIGHTS_POLICY_ID,
} from "@/lib/marketing/icp-landing-pages-policy";
import {
  ICP_PILOT_HIGHLIGHTS,
  ICP_PILOT_HIGHLIGHTS_SECTION_TEST_ID,
  ICP_PILOT_LIVE_INTEGRATION_COUNT,
} from "@/lib/marketing/icp-pilot-highlights-content";

export type IcpLandingPagesAuditSummary = {
  policyId: typeof ICP_LANDING_PAGES_POLICY_ID;
  pilotHighlightsPolicyId: typeof ICP_PILOT_HIGHLIGHTS_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  routesWired: boolean;
  contentPathsWired: boolean;
  legacyRedirectsWired: boolean;
  sitemapWired: boolean;
  pilotHighlightsWired: boolean;
  passed: boolean;
};

export function auditIcpLandingPages(root = process.cwd()): IcpLandingPagesAuditSummary {
  const wiringComplete = ICP_LANDING_PAGES_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let routesWired = false;
  let contentPathsWired = false;
  let legacyRedirectsWired = false;
  let sitemapWired = false;

  if (existsSync(join(root, ICP_LANDING_PAGES_DOC))) {
    const source = readFileSync(join(root, ICP_LANDING_PAGES_DOC), "utf8");
    docWired = ICP_LANDING_PAGE_ENTRIES.every((entry) => source.includes(entry.path));
  }

  routesWired = ICP_LANDING_PAGE_ENTRIES.every((entry) => {
    if (!existsSync(join(root, entry.pagePath))) return false;
    const source = readFileSync(join(root, entry.pagePath), "utf8");
    const componentModule = entry.componentPath.replace(/^components\//, "@/components/").replace(/\.tsx$/, "");
    return source.includes(componentModule);
  });

  contentPathsWired = ICP_LANDING_PAGE_ENTRIES.every((entry) => {
    if (!existsSync(join(root, entry.contentPath))) return false;
    const source = readFileSync(join(root, entry.contentPath), "utf8");
    return source.includes(entry.path) && source.includes(entry.pathConstant);
  });

  legacyRedirectsWired = ICP_LANDING_LEGACY_REDIRECTS.every((redirect) => {
    const legacyPage =
      redirect.from === "/landing/ghost-kitchen"
        ? "app/landing/ghost-kitchen/page.tsx"
        : "app/commissary-kitchen-software/page.tsx";
    if (!existsSync(join(root, legacyPage))) return false;
    const source = readFileSync(join(root, legacyPage), "utf8");
    return (
      (source.includes("redirect") || source.includes("Redirect")) &&
      source.includes(redirect.to)
    );
  });

  const sitemapPath = "lib/marketing/sitemap-urls.ts";
  if (existsSync(join(root, sitemapPath))) {
    const source = readFileSync(join(root, sitemapPath), "utf8");
    sitemapWired = ICP_LANDING_PAGE_ENTRIES.every((entry) => source.includes(entry.path));
  }

  const pilotHighlightEntries = ICP_LANDING_PAGE_ENTRIES.filter((entry) =>
    (ICP_PILOT_HIGHLIGHTS_LANDING_IDS as readonly string[]).includes(entry.id),
  );
  const pilotHighlightsWired = pilotHighlightEntries.every((entry) => {
    if (!existsSync(join(root, entry.componentPath))) return false;
    const source = readFileSync(join(root, entry.componentPath), "utf8");
    return (
      source.includes("IcpPilotHighlightsSection") &&
      source.includes(ICP_PILOT_HIGHLIGHTS_SECTION_TEST_ID)
    );
  });

  const highlightsContentPath = "lib/marketing/icp-pilot-highlights-content.ts";
  const highlightsContentWired =
    existsSync(join(root, highlightsContentPath)) &&
    ICP_PILOT_HIGHLIGHTS.every((highlight) =>
      readFileSync(join(root, highlightsContentPath), "utf8").includes(highlight.id),
    ) &&
    readFileSync(join(root, highlightsContentPath), "utf8").includes(
      String(ICP_PILOT_LIVE_INTEGRATION_COUNT),
    );

  const passed =
    wiringComplete &&
    docWired &&
    routesWired &&
    contentPathsWired &&
    legacyRedirectsWired &&
    sitemapWired &&
    pilotHighlightsWired &&
    highlightsContentWired;

  return {
    policyId: ICP_LANDING_PAGES_POLICY_ID,
    pilotHighlightsPolicyId: ICP_PILOT_HIGHLIGHTS_POLICY_ID,
    wiringComplete,
    docWired,
    routesWired,
    contentPathsWired,
    legacyRedirectsWired,
    sitemapWired,
    pilotHighlightsWired: pilotHighlightsWired && highlightsContentWired,
    passed,
  };
}

export function formatIcpLandingPagesAuditLines(summary: IcpLandingPagesAuditSummary): string[] {
  return [
    `ICP landing pages audit (${summary.policyId})`,
    `Pilot highlights (${summary.pilotHighlightsPolicyId}): ${summary.pilotHighlightsWired ? "yes" : "no"}`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${ICP_LANDING_PAGES_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Routes wired: ${summary.routesWired ? "yes" : "no"}`,
    `Content paths: ${summary.contentPathsWired ? "yes" : "no"}`,
    `Legacy redirects: ${summary.legacyRedirectsWired ? "yes" : "no"}`,
    `Sitemap: ${summary.sitemapWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
