import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  loadWorkflowFreezeRegistry,
  validateWorkflowFreezeRegistry,
} from "@/lib/pm/workflow-freeze-p3-128-operations";
import {
  WORKFLOW_FREEZE_APPROVAL_STEPS,
  WORKFLOW_FREEZE_DOC,
  WORKFLOW_FREEZE_EXEMPT_CATEGORIES,
  WORKFLOW_FREEZE_FROZEN_SURFACES,
  WORKFLOW_FREEZE_HONESTY_MARKERS,
  WORKFLOW_FREEZE_POLICY_ID,
  WORKFLOW_FREEZE_REGISTRY_ARTIFACT,
  WORKFLOW_FREEZE_RELATED_PATHS,
  WORKFLOW_FREEZE_WIRING_PATHS,
} from "@/lib/pm/workflow-freeze-p3-128-policy";

export type WorkflowFreezeAuditSummary = {
  policyId: typeof WORKFLOW_FREEZE_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryValid: boolean;
  relatedPathsReferenced: boolean;
  approvalStepsDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditWorkflowFreeze(root = process.cwd()): WorkflowFreezeAuditSummary {
  const wiringComplete = WORKFLOW_FREEZE_WIRING_PATHS.every((rel) => existsSync(join(root, rel)));

  let docWired = false;
  let relatedPathsReferenced = false;
  let approvalStepsDocumented = false;

  if (existsSync(join(root, WORKFLOW_FREEZE_DOC))) {
    const source = readFileSync(join(root, WORKFLOW_FREEZE_DOC), "utf8");
    docWired =
      WORKFLOW_FREEZE_FROZEN_SURFACES.every((surface) => source.includes(surface)) &&
      WORKFLOW_FREEZE_EXEMPT_CATEGORIES.every((category) => source.includes(category));
    relatedPathsReferenced = WORKFLOW_FREEZE_RELATED_PATHS.every((path) => source.includes(path));
    approvalStepsDocumented = WORKFLOW_FREEZE_APPROVAL_STEPS.every((step) =>
      source.includes(step),
    );
  }

  let registryValid = false;
  if (existsSync(join(root, WORKFLOW_FREEZE_REGISTRY_ARTIFACT))) {
    const registry = loadWorkflowFreezeRegistry(root);
    registryValid = validateWorkflowFreezeRegistry(registry, root).valid;
  }

  const combinedSources = [WORKFLOW_FREEZE_DOC, WORKFLOW_FREEZE_REGISTRY_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = WORKFLOW_FREEZE_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    registryValid &&
    relatedPathsReferenced &&
    approvalStepsDocumented &&
    honestyMarkersPresent;

  return {
    policyId: WORKFLOW_FREEZE_POLICY_ID,
    wiringComplete,
    docWired,
    registryValid,
    relatedPathsReferenced,
    approvalStepsDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatWorkflowFreezeAuditLines(summary: WorkflowFreezeAuditSummary): string[] {
  return [
    `Workflow freeze audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${WORKFLOW_FREEZE_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Registry valid: ${summary.registryValid ? "yes" : "no"}`,
    `Related paths referenced: ${summary.relatedPathsReferenced ? "yes" : "no"}`,
    `Approval steps documented: ${summary.approvalStepsDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
