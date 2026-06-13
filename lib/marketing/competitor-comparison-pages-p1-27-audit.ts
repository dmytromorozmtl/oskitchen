import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { comparePageBySlug } from "@/lib/marketing/compare-content";
import {
  COMPETITOR_COMPARISON_P1_27_ENTRIES,
  COMPETITOR_COMPARISON_P1_27_HONESTY_MARKERS,
  COMPETITOR_COMPARISON_PAGES_P1_27_DOC,
  COMPETITOR_COMPARISON_PAGES_P1_27_POLICY_ID,
  COMPETITOR_COMPARISON_PAGES_P1_27_WIRING_PATHS,
} from "@/lib/marketing/competitor-comparison-pages-p1-27-policy";

export type CompetitorComparisonPagesP127AuditSummary = {
  policyId: typeof COMPETITOR_COMPARISON_PAGES_P1_27_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  compareContentWired: boolean;
  compareLandingWired: boolean;
  compareHubWired: boolean;
  positioningSectionsWired: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditCompetitorComparisonPagesP127(
  root = process.cwd(),
): CompetitorComparisonPagesP127AuditSummary {
  const wiringComplete = COMPETITOR_COMPARISON_PAGES_P1_27_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let compareContentWired = false;
  let compareLandingWired = false;
  let compareHubWired = false;
  let positioningSectionsWired = false;

  if (existsSync(join(root, COMPETITOR_COMPARISON_PAGES_P1_27_DOC))) {
    const source = readFileSync(join(root, COMPETITOR_COMPARISON_PAGES_P1_27_DOC), "utf8");
    docWired =
      COMPETITOR_COMPARISON_P1_27_ENTRIES.every((entry) => source.includes(entry.path)) &&
      source.includes(COMPETITOR_COMPARISON_PAGES_P1_27_POLICY_ID);
  }

  const compareContentPath = "lib/marketing/compare-content.ts";
  if (existsSync(join(root, compareContentPath))) {
    const source = readFileSync(join(root, compareContentPath), "utf8");
    compareContentWired = COMPETITOR_COMPARISON_P1_27_ENTRIES.every(
      (entry) =>
        source.includes(entry.path) &&
        source.includes(`slug: '${entry.slug}'`) &&
        comparePageBySlug(entry.slug) !== undefined,
    );
  }

  const compareLandingPath = "components/marketing/compare-landing.tsx";
  if (existsSync(join(root, compareLandingPath))) {
    const source = readFileSync(join(root, compareLandingPath), "utf8");
    compareLandingWired =
      source.includes("CompareLanding") &&
      source.includes("compare-landing-") &&
      COMPETITOR_COMPARISON_P1_27_ENTRIES.every((entry) =>
        source.includes(entry.positioningSection),
      );
  }

  const compareHubPath = "app/compare/page.tsx";
  if (existsSync(join(root, compareHubPath))) {
    const source = readFileSync(join(root, compareHubPath), "utf8");
    compareHubWired =
      source.includes("COMPARE_PAGES") &&
      source.includes("page.path") &&
      source.includes("/compare");
  }

  positioningSectionsWired = COMPETITOR_COMPARISON_P1_27_ENTRIES.every((entry) => {
    const resolved =
      entry.slug === "toast"
        ? "components/marketing/toast-positioning-section.tsx"
        : entry.slug === "square"
          ? "components/marketing/square-positioning-section.tsx"
          : "components/marketing/lightspeed-positioning-section.tsx";
    if (!existsSync(join(root, resolved))) return false;
    const source = readFileSync(join(root, resolved), "utf8");
    return source.includes(entry.competitorLabel);
  });

  const combinedSources = [
    COMPETITOR_COMPARISON_PAGES_P1_27_DOC,
    compareContentPath,
    compareLandingPath,
    "docs/competitor-comparison-honest.md",
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = COMPETITOR_COMPARISON_P1_27_HONESTY_MARKERS.every((marker) =>
    combinedSources.toLowerCase().includes(marker.toLowerCase()),
  );

  const passed =
    wiringComplete &&
    docWired &&
    compareContentWired &&
    compareLandingWired &&
    compareHubWired &&
    positioningSectionsWired &&
    honestyMarkersPresent;

  return {
    policyId: COMPETITOR_COMPARISON_PAGES_P1_27_POLICY_ID,
    wiringComplete,
    docWired,
    compareContentWired,
    compareLandingWired,
    compareHubWired,
    positioningSectionsWired,
    honestyMarkersPresent,
    passed,
  };
}

export function formatCompetitorComparisonPagesP127AuditLines(
  summary: CompetitorComparisonPagesP127AuditSummary,
): string[] {
  return [
    `Competitor comparison pages audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${COMPETITOR_COMPARISON_PAGES_P1_27_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Compare content (toast/square/lightspeed): ${summary.compareContentWired ? "yes" : "no"}`,
    `Compare landing wired: ${summary.compareLandingWired ? "yes" : "no"}`,
    `Compare hub wired: ${summary.compareHubWired ? "yes" : "no"}`,
    `Positioning sections: ${summary.positioningSectionsWired ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
