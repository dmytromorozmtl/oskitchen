import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DEMO_PAGE_IMPROVEMENT_COMPONENT,
  DEMO_PAGE_IMPROVEMENT_CONTENT_PATH,
  DEMO_PAGE_IMPROVEMENT_DOC,
  DEMO_PAGE_IMPROVEMENT_HEADLINE,
  DEMO_PAGE_IMPROVEMENT_HONESTY_MARKERS,
  DEMO_PAGE_IMPROVEMENT_PAGE,
  DEMO_PAGE_IMPROVEMENT_POLICY_ID,
  DEMO_PAGE_IMPROVEMENT_SANDBOX_STOP_COUNT,
  DEMO_PAGE_IMPROVEMENT_SANDBOX_TEST_ID,
  DEMO_PAGE_IMPROVEMENT_VIDEO_SEGMENT_COUNT,
  DEMO_PAGE_IMPROVEMENT_VIDEO_TOUR_TEST_ID,
  DEMO_PAGE_IMPROVEMENT_WIRING_PATHS,
} from "@/lib/marketing/demo-page-improvement-policy";

export type DemoPageImprovementAuditSummary = {
  policyId: typeof DEMO_PAGE_IMPROVEMENT_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  sandboxStopCountCorrect: boolean;
  videoSegmentCountCorrect: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditDemoPageImprovement(
  root = process.cwd(),
): DemoPageImprovementAuditSummary {
  const wiringComplete = DEMO_PAGE_IMPROVEMENT_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let sandboxStopCountCorrect = false;
  let videoSegmentCountCorrect = false;

  if (existsSync(join(root, DEMO_PAGE_IMPROVEMENT_DOC))) {
    const source = readFileSync(join(root, DEMO_PAGE_IMPROVEMENT_DOC), "utf8");
    docWired =
      source.includes(DEMO_PAGE_IMPROVEMENT_HEADLINE) &&
      source.includes(DEMO_PAGE_IMPROVEMENT_SANDBOX_TEST_ID) &&
      source.includes(DEMO_PAGE_IMPROVEMENT_VIDEO_TOUR_TEST_ID);
  }

  if (existsSync(join(root, DEMO_PAGE_IMPROVEMENT_COMPONENT))) {
    const source = readFileSync(join(root, DEMO_PAGE_IMPROVEMENT_COMPONENT), "utf8");
    componentWired =
      source.includes("DemoGuidedTourSection") &&
      source.includes("DEMO_PAGE_IMPROVEMENT_SANDBOX_STOPS") &&
      source.includes("DEMO_PAGE_IMPROVEMENT_VIDEO_TOUR_SEGMENTS") &&
      source.includes("DEMO_PAGE_IMPROVEMENT_SANDBOX_TEST_ID") &&
      source.includes("DEMO_PAGE_IMPROVEMENT_VIDEO_TOUR_TEST_ID");
    sandboxStopCountCorrect = source.includes(
      `DEMO_PAGE_IMPROVEMENT_SANDBOX_STOP_COUNT`,
    );
    videoSegmentCountCorrect = source.includes(
      `DEMO_PAGE_IMPROVEMENT_VIDEO_SEGMENT_COUNT`,
    );
  }

  if (existsSync(join(root, DEMO_PAGE_IMPROVEMENT_PAGE))) {
    const source = readFileSync(join(root, DEMO_PAGE_IMPROVEMENT_PAGE), "utf8");
    pageWired = source.includes("DemoGuidedTourSection");
  }

  const combinedSources = [
    DEMO_PAGE_IMPROVEMENT_DOC,
    DEMO_PAGE_IMPROVEMENT_COMPONENT,
    DEMO_PAGE_IMPROVEMENT_CONTENT_PATH,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = DEMO_PAGE_IMPROVEMENT_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    sandboxStopCountCorrect &&
    videoSegmentCountCorrect &&
    honestyMarkersPresent;

  return {
    policyId: DEMO_PAGE_IMPROVEMENT_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    sandboxStopCountCorrect,
    videoSegmentCountCorrect,
    honestyMarkersPresent,
    passed,
  };
}

export function formatDemoPageImprovementAuditLines(
  summary: DemoPageImprovementAuditSummary,
): string[] {
  return [
    `Demo page improvement audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${DEMO_PAGE_IMPROVEMENT_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component (${DEMO_PAGE_IMPROVEMENT_SANDBOX_TEST_ID}): ${summary.componentWired ? "yes" : "no"}`,
    `Demo page wired: ${summary.pageWired ? "yes" : "no"}`,
    `Sandbox stops (${DEMO_PAGE_IMPROVEMENT_SANDBOX_STOP_COUNT}): ${summary.sandboxStopCountCorrect ? "yes" : "no"}`,
    `Video segments (${DEMO_PAGE_IMPROVEMENT_VIDEO_SEGMENT_COUNT}): ${summary.videoSegmentCountCorrect ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
