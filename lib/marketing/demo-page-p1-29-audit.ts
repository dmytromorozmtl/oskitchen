import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DEMO_PAGE_P1_29_CHANNEL_COUNT,
  DEMO_PAGE_P1_29_COMPONENT,
  DEMO_PAGE_P1_29_CONTENT_PATH,
  DEMO_PAGE_P1_29_DOC,
  DEMO_PAGE_P1_29_HEADLINE,
  DEMO_PAGE_P1_29_HONESTY_MARKERS,
  DEMO_PAGE_P1_29_INTEGRATION_HEALTH_TEST_ID,
  DEMO_PAGE_P1_29_PAGE,
  DEMO_PAGE_P1_29_POLICY_ID,
  DEMO_PAGE_P1_29_SANDBOX_TEST_ID,
  DEMO_PAGE_P1_29_WORKSPACE_STOP_COUNT,
  DEMO_PAGE_P1_29_WIRING_PATHS,
} from "@/lib/marketing/demo-page-p1-29-policy";
import {
  DEMO_PAGE_P1_29_INTEGRATION_CHANNELS,
  DEMO_PAGE_P1_29_WORKSPACE_STOPS,
} from "@/lib/marketing/demo-page-p1-29-content";

export type DemoPageP129AuditSummary = {
  policyId: typeof DEMO_PAGE_P1_29_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  channelCountCorrect: boolean;
  workspaceStopCountCorrect: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditDemoPageP129(root = process.cwd()): DemoPageP129AuditSummary {
  const wiringComplete = DEMO_PAGE_P1_29_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;

  if (existsSync(join(root, DEMO_PAGE_P1_29_DOC))) {
    const source = readFileSync(join(root, DEMO_PAGE_P1_29_DOC), "utf8");
    docWired =
      source.includes(DEMO_PAGE_P1_29_POLICY_ID) &&
      source.includes(DEMO_PAGE_P1_29_SANDBOX_TEST_ID) &&
      source.includes(DEMO_PAGE_P1_29_INTEGRATION_HEALTH_TEST_ID);
  }

  if (existsSync(join(root, DEMO_PAGE_P1_29_COMPONENT))) {
    const source = readFileSync(join(root, DEMO_PAGE_P1_29_COMPONENT), "utf8");
    componentWired =
      source.includes("DemoInteractiveSandboxWorkspace") &&
      source.includes("DEMO_PAGE_P1_29_INTEGRATION_CHANNELS") &&
      source.includes("DEMO_PAGE_P1_29_SANDBOX_TEST_ID") &&
      source.includes("DEMO_PAGE_P1_29_INTEGRATION_HEALTH_TEST_ID");
  }

  if (existsSync(join(root, DEMO_PAGE_P1_29_PAGE))) {
    const source = readFileSync(join(root, DEMO_PAGE_P1_29_PAGE), "utf8");
    pageWired = source.includes("DemoInteractiveSandboxWorkspace");
  }

  const channelCountCorrect =
    DEMO_PAGE_P1_29_INTEGRATION_CHANNELS.length === DEMO_PAGE_P1_29_CHANNEL_COUNT;
  const workspaceStopCountCorrect =
    DEMO_PAGE_P1_29_WORKSPACE_STOPS.length === DEMO_PAGE_P1_29_WORKSPACE_STOP_COUNT;

  const combinedSources = [
    DEMO_PAGE_P1_29_DOC,
    DEMO_PAGE_P1_29_COMPONENT,
    DEMO_PAGE_P1_29_CONTENT_PATH,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = DEMO_PAGE_P1_29_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    channelCountCorrect &&
    workspaceStopCountCorrect &&
    honestyMarkersPresent;

  return {
    policyId: DEMO_PAGE_P1_29_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    channelCountCorrect,
    workspaceStopCountCorrect,
    honestyMarkersPresent,
    passed,
  };
}

export function formatDemoPageP129AuditLines(summary: DemoPageP129AuditSummary): string[] {
  return [
    `Demo page P1-29 audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${DEMO_PAGE_P1_29_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component (${DEMO_PAGE_P1_29_SANDBOX_TEST_ID}): ${summary.componentWired ? "yes" : "no"}`,
    `Demo page wired: ${summary.pageWired ? "yes" : "no"}`,
    `Integration channels (${DEMO_PAGE_P1_29_CHANNEL_COUNT}): ${summary.channelCountCorrect ? "yes" : "no"}`,
    `Workspace stops (${DEMO_PAGE_P1_29_WORKSPACE_STOP_COUNT}): ${summary.workspaceStopCountCorrect ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
