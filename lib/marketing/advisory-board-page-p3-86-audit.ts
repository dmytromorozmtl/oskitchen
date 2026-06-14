import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { advisoryBoardHonestyMarkersPresent } from "@/lib/marketing/advisory-board-page-p3-86-content";
import {
  ADVISORY_BOARD_PAGE_P3_86_CONTENT_MODULE,
  ADVISORY_BOARD_PAGE_P3_86_DOC,
  ADVISORY_BOARD_PAGE_P3_86_FORBIDDEN_PATTERNS,
  ADVISORY_BOARD_PAGE_P3_86_PAGE_MODE,
  ADVISORY_BOARD_PAGE_P3_86_PLAYBOOK_DOC,
  ADVISORY_BOARD_PAGE_P3_86_POLICY_ID,
  ADVISORY_BOARD_PAGE_P3_86_PUBLISHED_MEMBER_COUNT,
  ADVISORY_BOARD_PAGE_P3_86_ROUTE,
  ADVISORY_BOARD_PAGE_P3_86_WIRING_PATHS,
} from "@/lib/marketing/advisory-board-page-p3-86-policy";

export type AdvisoryBoardPageP386AuditSummary = {
  policyId: typeof ADVISORY_BOARD_PAGE_P3_86_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  pageModeHonest: boolean;
  applicationFormPresent: boolean;
  honestyMarkersPresent: boolean;
  forbiddenPatternsAbsent: boolean;
  noPublishedMemberGrid: boolean;
  playbookLinked: boolean;
  passed: boolean;
};

export function auditAdvisoryBoardPageP386(
  root = process.cwd(),
): AdvisoryBoardPageP386AuditSummary {
  const wiringComplete = ADVISORY_BOARD_PAGE_P3_86_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let playbookLinked = false;
  if (existsSync(join(root, ADVISORY_BOARD_PAGE_P3_86_DOC))) {
    const doc = readFileSync(join(root, ADVISORY_BOARD_PAGE_P3_86_DOC), "utf8");
    docWired =
      doc.includes(ADVISORY_BOARD_PAGE_P3_86_POLICY_ID) &&
      doc.includes(ADVISORY_BOARD_PAGE_P3_86_PAGE_MODE) &&
      doc.includes("Published members");
    playbookLinked = doc.includes("CUSTOMER_ADVISORY_BOARD.md");
  }

  const pagePath = join(root, ADVISORY_BOARD_PAGE_P3_86_ROUTE);
  const pageSource = existsSync(pagePath) ? readFileSync(pagePath, "utf8") : "";
  const contentPath = join(root, ADVISORY_BOARD_PAGE_P3_86_CONTENT_MODULE);
  const contentSource = existsSync(contentPath) ? readFileSync(contentPath, "utf8") : "";
  const combinedHonestySource = `${pageSource}\n${contentSource}`;

  const pageModeHonest =
    pageSource.includes("ADVISORY_BOARD_PAGE_P3_86_PAGE_MODE") ||
    pageSource.includes("recruiting_application_only");

  const applicationFormPresent =
    pageSource.includes("submitAdvisoryBoardApplicationFormAction") &&
    pageSource.includes('name="fullName"') &&
    pageSource.includes('data-testid="advisory-board-apply"');

  const honestyMarkersPresent = advisoryBoardHonestyMarkersPresent(combinedHonestySource);

  const pageLower = pageSource.toLowerCase();
  const forbiddenPatternsAbsent = ADVISORY_BOARD_PAGE_P3_86_FORBIDDEN_PATTERNS.every(
    (pattern) => !pageLower.includes(pattern.toLowerCase()),
  );

  const noPublishedMemberGrid =
    !pageSource.includes("advisory-board-member") &&
    !pageSource.includes("advisor-card") &&
    (pageSource.includes("Published board members:") ||
      pageSource.includes("ADVISORY_BOARD_PAGE_P3_86_PUBLISHED_MEMBER_COUNT"));

  if (existsSync(join(root, ADVISORY_BOARD_PAGE_P3_86_PLAYBOOK_DOC))) {
    const playbook = readFileSync(join(root, ADVISORY_BOARD_PAGE_P3_86_PLAYBOOK_DOC), "utf8");
    playbookLinked = playbookLinked || playbook.includes("/advisory-board");
  }

  const passed =
    wiringComplete &&
    docWired &&
    pageModeHonest &&
    applicationFormPresent &&
    honestyMarkersPresent &&
    forbiddenPatternsAbsent &&
    noPublishedMemberGrid &&
    playbookLinked;

  return {
    policyId: ADVISORY_BOARD_PAGE_P3_86_POLICY_ID,
    wiringComplete,
    docWired,
    pageModeHonest,
    applicationFormPresent,
    honestyMarkersPresent,
    forbiddenPatternsAbsent,
    noPublishedMemberGrid,
    playbookLinked,
    passed,
  };
}

export function formatAdvisoryBoardPageP386AuditLines(
  summary: AdvisoryBoardPageP386AuditSummary,
): string[] {
  return [
    `Advisory board page (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Page mode honest: ${summary.pageModeHonest ? "yes" : "no"}`,
    `Application form: ${summary.applicationFormPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Forbidden patterns absent: ${summary.forbiddenPatternsAbsent ? "yes" : "no"}`,
    `No member grid: ${summary.noPublishedMemberGrid ? "yes" : "no"}`,
    `Playbook linked: ${summary.playbookLinked ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
