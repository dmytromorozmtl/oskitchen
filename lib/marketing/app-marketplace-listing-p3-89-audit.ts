import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  APP_MARKETPLACE_LISTING_P3_89_DOC,
  APP_MARKETPLACE_LISTING_P3_89_FALLBACK_HREF,
  APP_MARKETPLACE_LISTING_P3_89_NAV_BANNED_PATTERNS,
  APP_MARKETPLACE_LISTING_P3_89_NAV_SCAN_PATHS,
  APP_MARKETPLACE_LISTING_P3_89_POLICY_ID,
  APP_MARKETPLACE_LISTING_P3_89_ROUTE,
  APP_MARKETPLACE_LISTING_P3_89_WIRING_PATHS,
} from "@/lib/marketing/app-marketplace-listing-p3-89-policy";

export type AppMarketplaceListingP389AuditSummary = {
  policyId: typeof APP_MARKETPLACE_LISTING_P3_89_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  navClean: boolean;
  stripUsesFallback: boolean;
  pageStillPublished: boolean;
  passed: boolean;
  failures: string[];
};

export function auditAppMarketplaceListingP389(
  root = process.cwd(),
): AppMarketplaceListingP389AuditSummary {
  const failures: string[] = [];

  const wiringComplete = APP_MARKETPLACE_LISTING_P3_89_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );
  if (!wiringComplete) {
    failures.push("missing P3-89 wiring paths");
  }

  let docWired = false;
  if (existsSync(join(root, APP_MARKETPLACE_LISTING_P3_89_DOC))) {
    const doc = readFileSync(join(root, APP_MARKETPLACE_LISTING_P3_89_DOC), "utf8");
    docWired =
      doc.includes(APP_MARKETPLACE_LISTING_P3_89_POLICY_ID) &&
      doc.includes("remove from nav") &&
      doc.includes(APP_MARKETPLACE_LISTING_P3_89_FALLBACK_HREF);
  } else {
    failures.push(`missing doc: ${APP_MARKETPLACE_LISTING_P3_89_DOC}`);
  }

  let navClean = true;
  for (const rel of APP_MARKETPLACE_LISTING_P3_89_NAV_SCAN_PATHS) {
    const fullPath = join(root, rel);
    if (!existsSync(fullPath)) {
      navClean = false;
      failures.push(`missing nav scan path: ${rel}`);
      continue;
    }
    const source = readFileSync(fullPath, "utf8");
    for (const pattern of APP_MARKETPLACE_LISTING_P3_89_NAV_BANNED_PATTERNS) {
      if (source.includes(pattern)) {
        navClean = false;
        failures.push(`${rel} still contains banned nav pattern: ${pattern}`);
      }
    }
  }

  let stripUsesFallback = false;
  const stripPath = join(
    root,
    "components/dashboard/extensions/app-marketplace-third-party-strip.tsx",
  );
  if (existsSync(stripPath)) {
    const strip = readFileSync(stripPath, "utf8");
    stripUsesFallback =
      strip.includes("APP_MARKETPLACE_LISTING_P3_89_FALLBACK_HREF") ||
      strip.includes(APP_MARKETPLACE_LISTING_P3_89_FALLBACK_HREF);
    if (!stripUsesFallback) {
      failures.push("marketplace strip must link to partner program fallback");
    }
  }

  let pageStillPublished = false;
  const pagePath = join(root, "app/app-marketplace/page.tsx");
  if (existsSync(pagePath)) {
    const page = readFileSync(pagePath, "utf8");
    pageStillPublished =
      page.includes("AppMarketplaceThirdParty") &&
      (page.includes(APP_MARKETPLACE_LISTING_P3_89_ROUTE) ||
        page.includes("APP_MARKETPLACE_THIRD_PARTY_PATH"));
    if (!pageStillPublished) {
      failures.push("/app-marketplace page must remain published for direct URL access");
    }
  }

  const passed =
    failures.length === 0 &&
    wiringComplete &&
    docWired &&
    navClean &&
    stripUsesFallback &&
    pageStillPublished;

  return {
    policyId: APP_MARKETPLACE_LISTING_P3_89_POLICY_ID,
    wiringComplete,
    docWired,
    navClean,
    stripUsesFallback,
    pageStillPublished,
    passed,
    failures,
  };
}

export function formatAppMarketplaceListingP389AuditLines(
  summary: AppMarketplaceListingP389AuditSummary,
): string[] {
  return [
    `App marketplace nav removal (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Nav clean (no /app-marketplace links): ${summary.navClean ? "yes" : "no"}`,
    `Strip → ${APP_MARKETPLACE_LISTING_P3_89_FALLBACK_HREF}: ${summary.stripUsesFallback ? "yes" : "no"}`,
    `Page still published: ${summary.pageStillPublished ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
    ...(summary.failures.length > 0 ? [`Failures: ${summary.failures.join("; ")}`] : []),
  ];
}
