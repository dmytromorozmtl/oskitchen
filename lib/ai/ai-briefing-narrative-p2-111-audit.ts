import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { AI_BRIEFING_NARRATIVE_P2_111_SECTIONS } from "@/lib/ai/ai-briefing-narrative-p2-111-content";
import {
  AI_BRIEFING_NARRATIVE_P2_111_COMPONENT,
  AI_BRIEFING_NARRATIVE_P2_111_DOC,
  AI_BRIEFING_NARRATIVE_P2_111_HONESTY_MARKERS,
  AI_BRIEFING_NARRATIVE_P2_111_LEGACY_BRIEFING,
  AI_BRIEFING_NARRATIVE_P2_111_LEGACY_BRIEFING_LIB,
  AI_BRIEFING_NARRATIVE_P2_111_LEGACY_COPILOT,
  AI_BRIEFING_NARRATIVE_P2_111_LEGACY_DRAFTS,
  AI_BRIEFING_NARRATIVE_P2_111_OPERATIONS_PATH,
  AI_BRIEFING_NARRATIVE_P2_111_PAGE,
  AI_BRIEFING_NARRATIVE_P2_111_POLICY_ID,
  AI_BRIEFING_NARRATIVE_P2_111_ROUTE,
  AI_BRIEFING_NARRATIVE_P2_111_SECTION_COUNT,
  AI_BRIEFING_NARRATIVE_P2_111_SERVICE_PATH,
  AI_BRIEFING_NARRATIVE_P2_111_WIRING_PATHS,
} from "@/lib/ai/ai-briefing-narrative-p2-111-policy";

export type AiBriefingNarrativeP2_111AuditSummary = {
  policyId: typeof AI_BRIEFING_NARRATIVE_P2_111_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyBriefingLinked: boolean;
  legacyBriefingLibLinked: boolean;
  legacyDraftsLinked: boolean;
  legacyCopilotLinked: boolean;
  sectionCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditAiBriefingNarrativeP2_111(
  root = process.cwd(),
): AiBriefingNarrativeP2_111AuditSummary {
  const wiringComplete = AI_BRIEFING_NARRATIVE_P2_111_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyBriefingLinked = false;
  let legacyBriefingLibLinked = false;
  let legacyDraftsLinked = false;
  let legacyCopilotLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, AI_BRIEFING_NARRATIVE_P2_111_DOC))) {
    const source = readFileSync(join(root, AI_BRIEFING_NARRATIVE_P2_111_DOC), "utf8");
    docWired =
      source.includes(AI_BRIEFING_NARRATIVE_P2_111_ROUTE) &&
      source.includes(String(AI_BRIEFING_NARRATIVE_P2_111_SECTION_COUNT));
  }

  if (existsSync(join(root, AI_BRIEFING_NARRATIVE_P2_111_COMPONENT))) {
    const source = readFileSync(join(root, AI_BRIEFING_NARRATIVE_P2_111_COMPONENT), "utf8");
    componentWired =
      source.includes("AiBriefingNarrativePanel") &&
      source.includes("AI_BRIEFING_NARRATIVE_P2_111_SECTIONS");
    allTestIdsPresent =
      source.includes("AI_BRIEFING_NARRATIVE_P2_111_TEST_IDS[0]") &&
      source.includes("AI_BRIEFING_NARRATIVE_P2_111_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, AI_BRIEFING_NARRATIVE_P2_111_PAGE))) {
    const source = readFileSync(join(root, AI_BRIEFING_NARRATIVE_P2_111_PAGE), "utf8");
    pageWired =
      source.includes("AiBriefingNarrativePanel") &&
      source.includes("AI_BRIEFING_NARRATIVE_P2_111_POLICY_ID");
  }

  if (existsSync(join(root, AI_BRIEFING_NARRATIVE_P2_111_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, AI_BRIEFING_NARRATIVE_P2_111_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("buildYesterdaySection") &&
      source.includes("buildChannelMixSection") &&
      source.includes("buildNextStepSection") &&
      source.includes("composeBriefingNarrative") &&
      source.includes("buildAiBriefingNarrativeDemoReport");
  }

  if (existsSync(join(root, AI_BRIEFING_NARRATIVE_P2_111_SERVICE_PATH))) {
    const source = readFileSync(join(root, AI_BRIEFING_NARRATIVE_P2_111_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadAiBriefingNarrativeSnapshot") &&
      source.includes("AI_BRIEFING_NARRATIVE_P2_111_POLICY_ID");
  }

  if (existsSync(join(root, AI_BRIEFING_NARRATIVE_P2_111_LEGACY_BRIEFING))) {
    const source = readFileSync(join(root, AI_BRIEFING_NARRATIVE_P2_111_LEGACY_BRIEFING), "utf8");
    legacyBriefingLinked = source.includes("buildOwnerDailyBriefingTiles");
  }

  if (existsSync(join(root, AI_BRIEFING_NARRATIVE_P2_111_LEGACY_BRIEFING_LIB))) {
    const source = readFileSync(join(root, AI_BRIEFING_NARRATIVE_P2_111_LEGACY_BRIEFING_LIB), "utf8");
    legacyBriefingLibLinked = source.includes("pickOwnerDailyBriefingNextAction");
  }

  if (existsSync(join(root, AI_BRIEFING_NARRATIVE_P2_111_LEGACY_DRAFTS))) {
    const source = readFileSync(join(root, AI_BRIEFING_NARRATIVE_P2_111_LEGACY_DRAFTS), "utf8");
    legacyDraftsLinked = source.includes("daily_briefing");
  }

  if (existsSync(join(root, AI_BRIEFING_NARRATIVE_P2_111_LEGACY_COPILOT))) {
    const source = readFileSync(join(root, AI_BRIEFING_NARRATIVE_P2_111_LEGACY_COPILOT), "utf8");
    legacyCopilotLinked = source.includes("buildNarrativePrompt");
  }

  const combinedSources = [
    AI_BRIEFING_NARRATIVE_P2_111_DOC,
    "lib/ai/ai-briefing-narrative-p2-111-content.ts",
    AI_BRIEFING_NARRATIVE_P2_111_OPERATIONS_PATH,
    AI_BRIEFING_NARRATIVE_P2_111_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = AI_BRIEFING_NARRATIVE_P2_111_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const sectionCountCorrect =
    AI_BRIEFING_NARRATIVE_P2_111_SECTIONS.length === AI_BRIEFING_NARRATIVE_P2_111_SECTION_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyBriefingLinked &&
    legacyBriefingLibLinked &&
    legacyDraftsLinked &&
    legacyCopilotLinked &&
    sectionCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: AI_BRIEFING_NARRATIVE_P2_111_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyBriefingLinked,
    legacyBriefingLibLinked,
    legacyDraftsLinked,
    legacyCopilotLinked,
    sectionCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatAiBriefingNarrativeP2_111AuditLines(
  summary: AiBriefingNarrativeP2_111AuditSummary,
): string[] {
  return [
    `AI briefing narrative audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${AI_BRIEFING_NARRATIVE_P2_111_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${AI_BRIEFING_NARRATIVE_P2_111_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy briefing linked: ${summary.legacyBriefingLinked ? "yes" : "no"}`,
    `Legacy briefing lib linked: ${summary.legacyBriefingLibLinked ? "yes" : "no"}`,
    `Legacy drafts linked: ${summary.legacyDraftsLinked ? "yes" : "no"}`,
    `Legacy copilot linked: ${summary.legacyCopilotLinked ? "yes" : "no"}`,
    `Sections (${AI_BRIEFING_NARRATIVE_P2_111_SECTION_COUNT}): ${summary.sectionCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
