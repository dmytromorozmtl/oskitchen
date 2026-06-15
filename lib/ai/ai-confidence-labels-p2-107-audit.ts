import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { AI_CONFIDENCE_LABELS_P2_107_CAPABILITIES } from "@/lib/ai/ai-confidence-labels-p2-107-content";
import {
  AI_CONFIDENCE_LABELS_P2_107_CAPABILITY_COUNT,
  AI_CONFIDENCE_LABELS_P2_107_COMPONENT,
  AI_CONFIDENCE_LABELS_P2_107_DOC,
  AI_CONFIDENCE_LABELS_P2_107_HONESTY_MARKERS,
  AI_CONFIDENCE_LABELS_P2_107_LEGACY_COPILOT,
  AI_CONFIDENCE_LABELS_P2_107_LEGACY_HONESTY,
  AI_CONFIDENCE_LABELS_P2_107_LEGACY_SCANNER,
  AI_CONFIDENCE_LABELS_P2_107_OPERATIONS_PATH,
  AI_CONFIDENCE_LABELS_P2_107_PAGE,
  AI_CONFIDENCE_LABELS_P2_107_POLICY_ID,
  AI_CONFIDENCE_LABELS_P2_107_ROUTE,
  AI_CONFIDENCE_LABELS_P2_107_SERVICE_PATH,
  AI_CONFIDENCE_LABELS_P2_107_WIRING_PATHS,
} from "@/lib/ai/ai-confidence-labels-p2-107-policy";

export type AiConfidenceLabelsP2_107AuditSummary = {
  policyId: typeof AI_CONFIDENCE_LABELS_P2_107_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyScannerLinked: boolean;
  legacyHonestyLinked: boolean;
  legacyCopilotLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditAiConfidenceLabelsP2_107(
  root = process.cwd(),
): AiConfidenceLabelsP2_107AuditSummary {
  const wiringComplete = AI_CONFIDENCE_LABELS_P2_107_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyScannerLinked = false;
  let legacyHonestyLinked = false;
  let legacyCopilotLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, AI_CONFIDENCE_LABELS_P2_107_DOC))) {
    const source = readFileSync(join(root, AI_CONFIDENCE_LABELS_P2_107_DOC), "utf8");
    docWired =
      source.includes(AI_CONFIDENCE_LABELS_P2_107_ROUTE) &&
      source.includes(String(AI_CONFIDENCE_LABELS_P2_107_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, AI_CONFIDENCE_LABELS_P2_107_COMPONENT))) {
    const source = readFileSync(join(root, AI_CONFIDENCE_LABELS_P2_107_COMPONENT), "utf8");
    componentWired =
      source.includes("AiConfidenceLabelsPanel") &&
      source.includes("AI_CONFIDENCE_LABELS_P2_107_CAPABILITIES");
    allTestIdsPresent =
      source.includes("AI_CONFIDENCE_LABELS_P2_107_TEST_IDS[0]") &&
      source.includes("AI_CONFIDENCE_LABELS_P2_107_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, AI_CONFIDENCE_LABELS_P2_107_PAGE))) {
    const source = readFileSync(join(root, AI_CONFIDENCE_LABELS_P2_107_PAGE), "utf8");
    pageWired =
      source.includes("AiConfidenceLabelsPanel") &&
      source.includes("AI_CONFIDENCE_LABELS_P2_107_POLICY_ID");
  }

  if (existsSync(join(root, AI_CONFIDENCE_LABELS_P2_107_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, AI_CONFIDENCE_LABELS_P2_107_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("classifyConfidenceTier") &&
      source.includes("buildNeedsApprovalLabel") &&
      source.includes("buildSourceReference") &&
      source.includes("buildAiConfidenceLabelRow") &&
      source.includes("buildAiConfidenceLabelsReport");
  }

  if (existsSync(join(root, AI_CONFIDENCE_LABELS_P2_107_SERVICE_PATH))) {
    const source = readFileSync(join(root, AI_CONFIDENCE_LABELS_P2_107_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadAiConfidenceLabelsSnapshot") &&
      source.includes("AI_CONFIDENCE_LABELS_P2_107_POLICY_ID");
  }

  if (existsSync(join(root, AI_CONFIDENCE_LABELS_P2_107_LEGACY_SCANNER))) {
    const source = readFileSync(join(root, AI_CONFIDENCE_LABELS_P2_107_LEGACY_SCANNER), "utf8");
    legacyScannerLinked = source.includes("confidenceBadgeVariant");
  }

  if (existsSync(join(root, AI_CONFIDENCE_LABELS_P2_107_LEGACY_HONESTY))) {
    const source = readFileSync(join(root, AI_CONFIDENCE_LABELS_P2_107_LEGACY_HONESTY), "utf8");
    legacyHonestyLinked =
      source.includes("AI_HONESTY_LABELS") && source.includes("disclaimer");
  }

  if (existsSync(join(root, AI_CONFIDENCE_LABELS_P2_107_LEGACY_COPILOT))) {
    const source = readFileSync(join(root, AI_CONFIDENCE_LABELS_P2_107_LEGACY_COPILOT), "utf8");
    legacyCopilotLinked =
      source.includes("NEEDS_APPROVAL") && source.includes("createCopilotActionDraft");
  }

  const combinedSources = [
    AI_CONFIDENCE_LABELS_P2_107_DOC,
    "lib/ai/ai-confidence-labels-p2-107-content.ts",
    AI_CONFIDENCE_LABELS_P2_107_OPERATIONS_PATH,
    AI_CONFIDENCE_LABELS_P2_107_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = AI_CONFIDENCE_LABELS_P2_107_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    AI_CONFIDENCE_LABELS_P2_107_CAPABILITIES.length ===
    AI_CONFIDENCE_LABELS_P2_107_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyScannerLinked &&
    legacyHonestyLinked &&
    legacyCopilotLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: AI_CONFIDENCE_LABELS_P2_107_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyScannerLinked,
    legacyHonestyLinked,
    legacyCopilotLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatAiConfidenceLabelsP2_107AuditLines(
  summary: AiConfidenceLabelsP2_107AuditSummary,
): string[] {
  return [
    `AI confidence labels audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${AI_CONFIDENCE_LABELS_P2_107_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${AI_CONFIDENCE_LABELS_P2_107_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy scanner linked: ${summary.legacyScannerLinked ? "yes" : "no"}`,
    `Legacy honesty labels linked: ${summary.legacyHonestyLinked ? "yes" : "no"}`,
    `Legacy copilot linked: ${summary.legacyCopilotLinked ? "yes" : "no"}`,
    `Capabilities (${AI_CONFIDENCE_LABELS_P2_107_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
