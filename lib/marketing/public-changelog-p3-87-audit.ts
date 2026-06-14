import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  publicChangelogHasAllMaturityLevels,
  publicChangelogMeetsMinimumReleases,
  PUBLIC_CHANGELOG_RELEASES,
} from "@/lib/marketing/public-changelog-p3-87-content";
import {
  PUBLIC_CHANGELOG_P3_87_COMPONENT,
  PUBLIC_CHANGELOG_P3_87_DOC,
  PUBLIC_CHANGELOG_P3_87_MATURITY_LEVELS,
  PUBLIC_CHANGELOG_P3_87_MIN_RELEASES,
  PUBLIC_CHANGELOG_P3_87_POLICY_ID,
  PUBLIC_CHANGELOG_P3_87_ROUTE,
  PUBLIC_CHANGELOG_P3_87_WIRING_PATHS,
} from "@/lib/marketing/public-changelog-p3-87-policy";

export type PublicChangelogP387AuditSummary = {
  policyId: typeof PUBLIC_CHANGELOG_P3_87_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  releasesDefined: boolean;
  allMaturityLevels: boolean;
  pageWired: boolean;
  componentWired: boolean;
  passed: boolean;
};

export function auditPublicChangelogP387(root = process.cwd()): PublicChangelogP387AuditSummary {
  const wiringComplete = PUBLIC_CHANGELOG_P3_87_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, PUBLIC_CHANGELOG_P3_87_DOC))) {
    const doc = readFileSync(join(root, PUBLIC_CHANGELOG_P3_87_DOC), "utf8");
    docWired =
      doc.includes(PUBLIC_CHANGELOG_P3_87_POLICY_ID) &&
      PUBLIC_CHANGELOG_P3_87_MATURITY_LEVELS.every((level) => doc.includes(level));
  }

  const releasesDefined =
    PUBLIC_CHANGELOG_RELEASES.length >= PUBLIC_CHANGELOG_P3_87_MIN_RELEASES &&
    publicChangelogMeetsMinimumReleases();

  const allMaturityLevels = publicChangelogHasAllMaturityLevels();

  let pageWired = false;
  if (existsSync(join(root, PUBLIC_CHANGELOG_P3_87_ROUTE))) {
    const page = readFileSync(join(root, PUBLIC_CHANGELOG_P3_87_ROUTE), "utf8");
    pageWired =
      page.includes("PublicChangelogEntries") &&
      page.includes("PUBLIC_CHANGELOG_P3_87_POLICY_ID");
  }

  let componentWired = false;
  if (existsSync(join(root, PUBLIC_CHANGELOG_P3_87_COMPONENT))) {
    const component = readFileSync(join(root, PUBLIC_CHANGELOG_P3_87_COMPONENT), "utf8");
    componentWired =
      component.includes("PUBLIC_CHANGELOG_RELEASES") &&
      component.includes("changelog-maturity") &&
      PUBLIC_CHANGELOG_P3_87_MATURITY_LEVELS.every((level) => component.includes(level));
  }

  const passed =
    wiringComplete &&
    docWired &&
    releasesDefined &&
    allMaturityLevels &&
    pageWired &&
    componentWired;

  return {
    policyId: PUBLIC_CHANGELOG_P3_87_POLICY_ID,
    wiringComplete,
    docWired,
    releasesDefined,
    allMaturityLevels,
    pageWired,
    componentWired,
    passed,
  };
}

export function formatPublicChangelogP387AuditLines(
  summary: PublicChangelogP387AuditSummary,
): string[] {
  return [
    `Public changelog updates (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Releases (${PUBLIC_CHANGELOG_P3_87_MIN_RELEASES}+): ${summary.releasesDefined ? "yes" : "no"}`,
    `LIVE/BETA/PREVIEW: ${summary.allMaturityLevels ? "yes" : "no"}`,
    `Page wired: ${summary.pageWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
