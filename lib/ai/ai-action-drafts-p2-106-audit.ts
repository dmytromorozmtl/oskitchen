import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { AI_ACTION_DRAFTS_P2_106_CAPABILITIES } from "@/lib/ai/ai-action-drafts-p2-106-content";
import {
  AI_ACTION_DRAFTS_P2_106_CAPABILITY_COUNT,
  AI_ACTION_DRAFTS_P2_106_COMPONENT,
  AI_ACTION_DRAFTS_P2_106_DOC,
  AI_ACTION_DRAFTS_P2_106_DRAFT_TYPE_COUNT,
  AI_ACTION_DRAFTS_P2_106_HONESTY_MARKERS,
  AI_ACTION_DRAFTS_P2_106_LEGACY_CO_PILOT,
  AI_ACTION_DRAFTS_P2_106_LEGACY_COPILOT,
  AI_ACTION_DRAFTS_P2_106_LEGACY_DRAFTS_PAGE,
  AI_ACTION_DRAFTS_P2_106_OPERATIONS_PATH,
  AI_ACTION_DRAFTS_P2_106_PAGE,
  AI_ACTION_DRAFTS_P2_106_POLICY_ID,
  AI_ACTION_DRAFTS_P2_106_ROUTE,
  AI_ACTION_DRAFTS_P2_106_SERVICE_PATH,
  AI_ACTION_DRAFTS_P2_106_WIRING_PATHS,
} from "@/lib/ai/ai-action-drafts-p2-106-policy";

export type AiActionDraftsP2_106AuditSummary = {
  policyId: typeof AI_ACTION_DRAFTS_P2_106_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyCopilotLinked: boolean;
  legacyDraftsPageLinked: boolean;
  legacyCoPilotLinked: boolean;
  draftTypeCountCorrect: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditAiActionDraftsP2_106(root = process.cwd()): AiActionDraftsP2_106AuditSummary {
  const wiringComplete = AI_ACTION_DRAFTS_P2_106_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyCopilotLinked = false;
  let legacyDraftsPageLinked = false;
  let legacyCoPilotLinked = false;
  let allTestIdsPresent = false;
  let draftTypeCountCorrect = false;

  if (existsSync(join(root, AI_ACTION_DRAFTS_P2_106_DOC))) {
    const source = readFileSync(join(root, AI_ACTION_DRAFTS_P2_106_DOC), "utf8");
    docWired =
      source.includes(AI_ACTION_DRAFTS_P2_106_ROUTE) &&
      source.includes(String(AI_ACTION_DRAFTS_P2_106_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, AI_ACTION_DRAFTS_P2_106_COMPONENT))) {
    const source = readFileSync(join(root, AI_ACTION_DRAFTS_P2_106_COMPONENT), "utf8");
    componentWired =
      source.includes("AiActionDraftsPanel") &&
      source.includes("AI_ACTION_DRAFTS_P2_106_CAPABILITIES");
    allTestIdsPresent =
      source.includes("AI_ACTION_DRAFTS_P2_106_TEST_IDS[0]") &&
      source.includes("AI_ACTION_DRAFTS_P2_106_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, AI_ACTION_DRAFTS_P2_106_PAGE))) {
    const source = readFileSync(join(root, AI_ACTION_DRAFTS_P2_106_PAGE), "utf8");
    pageWired =
      source.includes("AiActionDraftsPanel") &&
      source.includes("AI_ACTION_DRAFTS_P2_106_POLICY_ID");
  }

  if (existsSync(join(root, AI_ACTION_DRAFTS_P2_106_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, AI_ACTION_DRAFTS_P2_106_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("buildAiActionDraftTemplates") &&
      source.includes("buildAiActionDraftRows") &&
      source.includes("splitDraftsByCategory") &&
      source.includes("buildAiActionDraftsReport");
    draftTypeCountCorrect =
      source.includes("create_po") &&
      source.includes("flag_low_margin") &&
      source.includes("draft_schedule") &&
      source.includes("daily_briefing") &&
      source.includes("commission_spike");
  }

  if (existsSync(join(root, AI_ACTION_DRAFTS_P2_106_SERVICE_PATH))) {
    const source = readFileSync(join(root, AI_ACTION_DRAFTS_P2_106_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadAiActionDraftsSnapshot") &&
      source.includes("AI_ACTION_DRAFTS_P2_106_POLICY_ID");
  }

  if (existsSync(join(root, AI_ACTION_DRAFTS_P2_106_LEGACY_COPILOT))) {
    const source = readFileSync(join(root, AI_ACTION_DRAFTS_P2_106_LEGACY_COPILOT), "utf8");
    legacyCopilotLinked =
      source.includes("createCopilotActionDraft") && source.includes("listActionDrafts");
  }

  if (existsSync(join(root, AI_ACTION_DRAFTS_P2_106_LEGACY_DRAFTS_PAGE))) {
    const source = readFileSync(join(root, AI_ACTION_DRAFTS_P2_106_LEGACY_DRAFTS_PAGE), "utf8");
    legacyDraftsPageLinked =
      source.includes("listActionDrafts") && source.includes("Action drafts");
  }

  if (existsSync(join(root, AI_ACTION_DRAFTS_P2_106_LEGACY_CO_PILOT))) {
    const source = readFileSync(join(root, AI_ACTION_DRAFTS_P2_106_LEGACY_CO_PILOT), "utf8");
    legacyCoPilotLinked =
      source.includes("createCopilotActionDraft") &&
      source.includes("getRestaurantCoPilotDashboard");
  }

  const combinedSources = [
    AI_ACTION_DRAFTS_P2_106_DOC,
    "lib/ai/ai-action-drafts-p2-106-content.ts",
    AI_ACTION_DRAFTS_P2_106_OPERATIONS_PATH,
    AI_ACTION_DRAFTS_P2_106_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = AI_ACTION_DRAFTS_P2_106_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    AI_ACTION_DRAFTS_P2_106_CAPABILITIES.length === AI_ACTION_DRAFTS_P2_106_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyCopilotLinked &&
    legacyDraftsPageLinked &&
    legacyCoPilotLinked &&
    draftTypeCountCorrect &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: AI_ACTION_DRAFTS_P2_106_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyCopilotLinked,
    legacyDraftsPageLinked,
    legacyCoPilotLinked,
    draftTypeCountCorrect,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatAiActionDraftsP2_106AuditLines(
  summary: AiActionDraftsP2_106AuditSummary,
): string[] {
  return [
    `AI action drafts audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${AI_ACTION_DRAFTS_P2_106_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${AI_ACTION_DRAFTS_P2_106_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy copilot service linked: ${summary.legacyCopilotLinked ? "yes" : "no"}`,
    `Legacy drafts page linked: ${summary.legacyDraftsPageLinked ? "yes" : "no"}`,
    `Legacy co-pilot service linked: ${summary.legacyCoPilotLinked ? "yes" : "no"}`,
    `Draft types (${AI_ACTION_DRAFTS_P2_106_DRAFT_TYPE_COUNT}): ${summary.draftTypeCountCorrect ? "yes" : "no"}`,
    `Capabilities (${AI_ACTION_DRAFTS_P2_106_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
