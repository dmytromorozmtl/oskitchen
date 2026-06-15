import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { AI_APPROVAL_WORKFLOW_P2_109_STAGES } from "@/lib/ai/ai-approval-workflow-p2-109-content";
import {
  AI_APPROVAL_WORKFLOW_P2_109_COMPONENT,
  AI_APPROVAL_WORKFLOW_P2_109_DOC,
  AI_APPROVAL_WORKFLOW_P2_109_HONESTY_MARKERS,
  AI_APPROVAL_WORKFLOW_P2_109_LEGACY_ACTIONS,
  AI_APPROVAL_WORKFLOW_P2_109_LEGACY_COPILOT,
  AI_APPROVAL_WORKFLOW_P2_109_LEGACY_CO_PILOT,
  AI_APPROVAL_WORKFLOW_P2_109_LEGACY_DRAFTS,
  AI_APPROVAL_WORKFLOW_P2_109_OPERATIONS_PATH,
  AI_APPROVAL_WORKFLOW_P2_109_PAGE,
  AI_APPROVAL_WORKFLOW_P2_109_POLICY_ID,
  AI_APPROVAL_WORKFLOW_P2_109_ROUTE,
  AI_APPROVAL_WORKFLOW_P2_109_SERVICE_PATH,
  AI_APPROVAL_WORKFLOW_P2_109_STAGE_COUNT,
  AI_APPROVAL_WORKFLOW_P2_109_WIRING_PATHS,
} from "@/lib/ai/ai-approval-workflow-p2-109-policy";

export type AiApprovalWorkflowP2_109AuditSummary = {
  policyId: typeof AI_APPROVAL_WORKFLOW_P2_109_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  operationsWired: boolean;
  serviceWired: boolean;
  legacyCopilotLinked: boolean;
  legacyCoPilotLinked: boolean;
  legacyActionsLinked: boolean;
  legacyDraftsLinked: boolean;
  stageCountCorrect: boolean;
  allTestIdsPresent: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditAiApprovalWorkflowP2_109(
  root = process.cwd(),
): AiApprovalWorkflowP2_109AuditSummary {
  const wiringComplete = AI_APPROVAL_WORKFLOW_P2_109_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let componentWired = false;
  let pageWired = false;
  let operationsWired = false;
  let serviceWired = false;
  let legacyCopilotLinked = false;
  let legacyCoPilotLinked = false;
  let legacyActionsLinked = false;
  let legacyDraftsLinked = false;
  let allTestIdsPresent = false;

  if (existsSync(join(root, AI_APPROVAL_WORKFLOW_P2_109_DOC))) {
    const source = readFileSync(join(root, AI_APPROVAL_WORKFLOW_P2_109_DOC), "utf8");
    docWired =
      source.includes(AI_APPROVAL_WORKFLOW_P2_109_ROUTE) &&
      source.includes(String(AI_APPROVAL_WORKFLOW_P2_109_STAGE_COUNT));
  }

  if (existsSync(join(root, AI_APPROVAL_WORKFLOW_P2_109_COMPONENT))) {
    const source = readFileSync(join(root, AI_APPROVAL_WORKFLOW_P2_109_COMPONENT), "utf8");
    componentWired =
      source.includes("AiApprovalWorkflowPanel") &&
      source.includes("AI_APPROVAL_WORKFLOW_P2_109_STAGES");
    allTestIdsPresent =
      source.includes("AI_APPROVAL_WORKFLOW_P2_109_TEST_IDS[0]") &&
      source.includes("AI_APPROVAL_WORKFLOW_P2_109_TEST_IDS[index + 1]");
  }

  if (existsSync(join(root, AI_APPROVAL_WORKFLOW_P2_109_PAGE))) {
    const source = readFileSync(join(root, AI_APPROVAL_WORKFLOW_P2_109_PAGE), "utf8");
    pageWired =
      source.includes("AiApprovalWorkflowPanel") &&
      source.includes("AI_APPROVAL_WORKFLOW_P2_109_POLICY_ID");
  }

  if (existsSync(join(root, AI_APPROVAL_WORKFLOW_P2_109_OPERATIONS_PATH))) {
    const source = readFileSync(join(root, AI_APPROVAL_WORKFLOW_P2_109_OPERATIONS_PATH), "utf8");
    operationsWired =
      source.includes("buildApprovalWorkflowStep") &&
      source.includes("validateApprovalTransition") &&
      source.includes("buildApprovalWorkflowReport") &&
      source.includes("buildApprovalWorkflowDemoReport");
  }

  if (existsSync(join(root, AI_APPROVAL_WORKFLOW_P2_109_SERVICE_PATH))) {
    const source = readFileSync(join(root, AI_APPROVAL_WORKFLOW_P2_109_SERVICE_PATH), "utf8");
    serviceWired =
      source.includes("loadAiApprovalWorkflowSnapshot") &&
      source.includes("AI_APPROVAL_WORKFLOW_P2_109_POLICY_ID");
  }

  if (existsSync(join(root, AI_APPROVAL_WORKFLOW_P2_109_LEGACY_COPILOT))) {
    const source = readFileSync(join(root, AI_APPROVAL_WORKFLOW_P2_109_LEGACY_COPILOT), "utf8");
    legacyCopilotLinked =
      source.includes("createCopilotActionDraft") &&
      source.includes("executeApprovedAction") &&
      source.includes("recordCopilotAudit");
  }

  if (existsSync(join(root, AI_APPROVAL_WORKFLOW_P2_109_LEGACY_CO_PILOT))) {
    const source = readFileSync(join(root, AI_APPROVAL_WORKFLOW_P2_109_LEGACY_CO_PILOT), "utf8");
    legacyCoPilotLinked =
      source.includes("approveCoPilotDraft") && source.includes("executeCoPilotDraft");
  }

  if (existsSync(join(root, AI_APPROVAL_WORKFLOW_P2_109_LEGACY_ACTIONS))) {
    const source = readFileSync(join(root, AI_APPROVAL_WORKFLOW_P2_109_LEGACY_ACTIONS), "utf8");
    legacyActionsLinked =
      source.includes("approveActionDraftFormAction") &&
      source.includes("executeActionDraftFormAction");
  }

  if (existsSync(join(root, AI_APPROVAL_WORKFLOW_P2_109_LEGACY_DRAFTS))) {
    const source = readFileSync(join(root, AI_APPROVAL_WORKFLOW_P2_109_LEGACY_DRAFTS), "utf8");
    legacyDraftsLinked = source.includes("requiresApproval");
  }

  const combinedSources = [
    AI_APPROVAL_WORKFLOW_P2_109_DOC,
    "lib/ai/ai-approval-workflow-p2-109-content.ts",
    AI_APPROVAL_WORKFLOW_P2_109_OPERATIONS_PATH,
    AI_APPROVAL_WORKFLOW_P2_109_COMPONENT,
  ]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = AI_APPROVAL_WORKFLOW_P2_109_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const stageCountCorrect =
    AI_APPROVAL_WORKFLOW_P2_109_STAGES.length === AI_APPROVAL_WORKFLOW_P2_109_STAGE_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    operationsWired &&
    serviceWired &&
    legacyCopilotLinked &&
    legacyCoPilotLinked &&
    legacyActionsLinked &&
    legacyDraftsLinked &&
    stageCountCorrect &&
    allTestIdsPresent &&
    honestyMarkersPresent;

  return {
    policyId: AI_APPROVAL_WORKFLOW_P2_109_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    operationsWired,
    serviceWired,
    legacyCopilotLinked,
    legacyCoPilotLinked,
    legacyActionsLinked,
    legacyDraftsLinked,
    stageCountCorrect,
    allTestIdsPresent,
    honestyMarkersPresent,
    passed,
  };
}

export function formatAiApprovalWorkflowP2_109AuditLines(
  summary: AiApprovalWorkflowP2_109AuditSummary,
): string[] {
  return [
    `AI approval workflow audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${AI_APPROVAL_WORKFLOW_P2_109_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Component wired: ${summary.componentWired ? "yes" : "no"}`,
    `Page (${AI_APPROVAL_WORKFLOW_P2_109_ROUTE}): ${summary.pageWired ? "yes" : "no"}`,
    `Operations: ${summary.operationsWired ? "yes" : "no"}`,
    `Service: ${summary.serviceWired ? "yes" : "no"}`,
    `Legacy copilot linked: ${summary.legacyCopilotLinked ? "yes" : "no"}`,
    `Legacy co-pilot linked: ${summary.legacyCoPilotLinked ? "yes" : "no"}`,
    `Legacy actions linked: ${summary.legacyActionsLinked ? "yes" : "no"}`,
    `Legacy drafts linked: ${summary.legacyDraftsLinked ? "yes" : "no"}`,
    `Stages (${AI_APPROVAL_WORKFLOW_P2_109_STAGE_COUNT}): ${summary.stageCountCorrect ? "yes" : "no"}`,
    `Test ids: ${summary.allTestIdsPresent ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
