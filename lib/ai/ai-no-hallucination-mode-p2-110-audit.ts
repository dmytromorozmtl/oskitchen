import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { AI_NO_HALLUCINATION_MODE_P2_110_CAPABILITIES } from "@/lib/ai/ai-no-hallucination-mode-p2-110-content";
import {
  AI_NO_HALLUCINATION_MODE_P2_110_CAPABILITY_COUNT,
  AI_NO_HALLUCINATION_MODE_P2_110_COMPONENT,
  AI_NO_HALLUCINATION_MODE_P2_110_DOC,
  AI_NO_HALLUCINATION_MODE_P2_110_HONESTY_MARKERS,
  AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_CONFIDENCE,
  AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_COPILOT,
  AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_GUARDRAILS,
  AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_HONESTY,
  AI_NO_HALLUCINATION_MODE_P2_110_OPERATIONS_PATH,
  AI_NO_HALLUCINATION_MODE_P2_110_PAGE,
  AI_NO_HALLUCINATION_MODE_P2_110_POLICY_ID,
  AI_NO_HALLUCINATION_MODE_P2_110_ROUTE,
  AI_NO_HALLUCINATION_MODE_P2_110_SERVICE_PATH,
  AI_NO_HALLUCINATION_MODE_P2_110_WIRING_PATHS,
} from "@/lib/ai/ai-no-hallucination-mode-p2-110-policy";

export type AiNoHallucinationModeP2_110AuditSummary = {
  policyId: typeof AI_NO_HALLUCINATION_MODE_P2_110_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyHonestyLinked: boolean;
  legacyGuardrailsLinked: boolean;
  legacyCopilotLinked: boolean;
  legacyConfidenceLinked: boolean;
  capabilityCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditAiNoHallucinationModeP2_110(
  root = process.cwd(),
): AiNoHallucinationModeP2_110AuditSummary {
  const wiringComplete = AI_NO_HALLUCINATION_MODE_P2_110_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyHonestyLinked = false;
  let legacyGuardrailsLinked = false;
  let legacyCopilotLinked = false;
  let legacyConfidenceLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, AI_NO_HALLUCINATION_MODE_P2_110_DOC))) {
    const source = readFileSync(join(root, AI_NO_HALLUCINATION_MODE_P2_110_DOC), "utf8");
    docWired =
      source.includes(AI_NO_HALLUCINATION_MODE_P2_110_ROUTE) &&
      source.includes(String(AI_NO_HALLUCINATION_MODE_P2_110_CAPABILITY_COUNT));
  }

  if (existsSync(join(root, AI_NO_HALLUCINATION_MODE_P2_110_COMPONENT))) {
    const source = readFileSync(join(root, AI_NO_HALLUCINATION_MODE_P2_110_COMPONENT), "utf8");
    componentWired =
      source.includes("AiNoHallucinationModePanel") &&
      source.includes("AI_NO_HALLUCINATION_MODE_P2_110_CAPABILITIES");
    allTestIdsPresent =
      source.includes("AI_NO_HALLUCINATION_MODE_P2_110_TEST_IDS[0]") &&
      source.includes("AI_NO_HALLUCINATION_MODE_P2_110_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, AI_NO_HALLUCINATION_MODE_P2_110_PAGE))) {
    const source = readFileSync(join(root, AI_NO_HALLUCINATION_MODE_P2_110_PAGE), "utf8");
    pageWired =
      source.includes("AiNoHallucinationModePanel") &&
      source.includes("AI_NO_HALLUCINATION_MODE_P2_110_POLICY_ID");
  }

  if (existsSync(join(root, AI_NO_HALLUCINATION_MODE_P2_110_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, AI_NO_HALLUCINATION_MODE_P2_110_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("detectUnsupportedClaim") &&
      source.includes("validateTenantDataScope") &&
      source.includes("validateSourceBackedClaim") &&
      source.includes("evaluateNoHallucinationClaim") &&
      source.includes("buildNoHallucinationModeDemoReport");
  }

  if (existsSync(join(root, AI_NO_HALLUCINATION_MODE_P2_110_SERVICE_PATH))) {
    const source = readFileSync(join(root, AI_NO_HALLUCINATION_MODE_P2_110_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadAiNoHallucinationModeSnapshot") &&
      source.includes("AI_NO_HALLUCINATION_MODE_P2_110_POLICY_ID");
  }

  if (existsSync(join(root, AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_HONESTY))) {
    const source = readFileSync(join(root, AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_HONESTY), "utf8");
    legacyHonestyLinked =
      source.includes("AI_HONESTY_LABELS") && source.includes("disclaimer");
  }

  if (existsSync(join(root, AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_GUARDRAILS))) {
    const source = readFileSync(join(root, AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_GUARDRAILS), "utf8");
    legacyGuardrailsLinked = source.includes("runOutboundGuardrail");
  }

  if (existsSync(join(root, AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_COPILOT))) {
    const source = readFileSync(join(root, AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_COPILOT), "utf8");
    legacyCopilotLinked = source.includes("deterministicOnly");
  }

  if (existsSync(join(root, AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_CONFIDENCE))) {
    const source = readFileSync(join(root, AI_NO_HALLUCINATION_MODE_P2_110_LEGACY_CONFIDENCE), "utf8");
    legacyConfidenceLinked = source.includes("buildSourceReference");
  }

  const combinedSources = [
    AI_NO_HALLUCINATION_MODE_P2_110_DOC,
    "lib/ai/ai-no-hallucination-mode-p2-110-content.ts",
    AI_NO_HALLUCINATION_MODE_P2_110_OPERATIONS_PATH,
    AI_NO_HALLUCINATION_MODE_P2_110_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = AI_NO_HALLUCINATION_MODE_P2_110_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const capabilityCountCorrect =
    AI_NO_HALLUCINATION_MODE_P2_110_CAPABILITIES.length ===
    AI_NO_HALLUCINATION_MODE_P2_110_CAPABILITY_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyHonestyLinked &&
    legacyGuardrailsLinked &&
    legacyCopilotLinked &&
    legacyConfidenceLinked &&
    capabilityCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: AI_NO_HALLUCINATION_MODE_P2_110_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyHonestyLinked,
    legacyGuardrailsLinked,
    legacyCopilotLinked,
    legacyConfidenceLinked,
    capabilityCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatAiNoHallucinationModeP2_110AuditLines(
  summary: AiNoHallucinationModeP2_110AuditSummary,
): string[] {
  return [
    `AI no hallucination mode audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${AI_NO_HALLUCINATION_MODE_P2_110_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${AI_NO_HALLUCINATION_MODE_P2_110_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy honesty linked: ${summary.legacyHonestyLinked ? "yes" : "no"}`,
    `Legacy guardrails linked: ${summary.legacyGuardrailsLinked ? "yes" : "no"}`,
    `Legacy copilot linked: ${summary.legacyCopilotLinked ? "yes" : "no"}`,
    `Legacy confidence linked: ${summary.legacyConfidenceLinked ? "yes" : "no"}`,
    `Capabilities (${AI_NO_HALLUCINATION_MODE_P2_110_CAPABILITY_COUNT}): ${summary.capabilityCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
