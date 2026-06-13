import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  VISUAL_QA_P3_55_DOC,
  VISUAL_QA_P3_55_FLOW_HELPER,
  VISUAL_QA_P3_55_FLOW_STEPS,
  VISUAL_QA_P3_55_POLICY_ID,
  VISUAL_QA_P3_55_READY_HELPER,
  VISUAL_QA_P3_55_SPEC,
  VISUAL_QA_P3_55_SURFACE_COUNT,
  VISUAL_QA_P3_55_SURFACES,
  VISUAL_QA_P3_55_VISUAL_SPEC,
  VISUAL_QA_P3_55_WIRING_PATHS,
} from "@/lib/qa/visual-qa-p3-55-policy";
import { validateVisualQaContract } from "@/lib/qa/visual-qa-p3-55-measurement";

export type VisualQaP3_55AuditSummary = {
  policyId: typeof VISUAL_QA_P3_55_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  specWired: boolean;
  visualSpecWired: boolean;
  flowWired: boolean;
  contractValid: boolean;
  threeSurfacesPresent: boolean;
  passed: boolean;
};

export function auditVisualQaP3_55(root = process.cwd()): VisualQaP3_55AuditSummary {
  const wiringComplete = VISUAL_QA_P3_55_WIRING_PATHS.every((rel) => existsSync(join(root, rel)));

  let docWired = false;
  if (existsSync(join(root, VISUAL_QA_P3_55_DOC))) {
    const source = readFileSync(join(root, VISUAL_QA_P3_55_DOC), "utf8").toLowerCase();
    docWired =
      source.includes("pos tablet") &&
      source.includes("kds") &&
      source.includes("mobile today") &&
      source.includes("viewport");
  }

  let specWired = false;
  if (existsSync(join(root, VISUAL_QA_P3_55_SPEC))) {
    const source = readFileSync(join(root, VISUAL_QA_P3_55_SPEC), "utf8");
    specWired =
      source.includes("visual-qa-p3-55-v1") &&
      source.includes("runVisualQaContractStep") &&
      source.includes("pos_tablet");
  }

  let visualSpecWired = false;
  if (existsSync(join(root, VISUAL_QA_P3_55_VISUAL_SPEC))) {
    const source = readFileSync(join(root, VISUAL_QA_P3_55_VISUAL_SPEC), "utf8");
    visualSpecWired =
      source.includes("VISUAL_QA_P3_55_SURFACES") &&
      source.includes("setViewportSize") &&
      source.includes("toHaveScreenshot");
  }

  let flowWired = false;
  if (existsSync(join(root, VISUAL_QA_P3_55_FLOW_HELPER))) {
    const source = readFileSync(join(root, VISUAL_QA_P3_55_FLOW_HELPER), "utf8");
    flowWired =
      source.includes("runVisualQaContractStep") &&
      source.includes("listVisualQaSurfaces") &&
      existsSync(join(root, VISUAL_QA_P3_55_READY_HELPER));
  }

  const contract = validateVisualQaContract(root);
  const threeSurfacesPresent =
    VISUAL_QA_P3_55_SURFACES.length === VISUAL_QA_P3_55_SURFACE_COUNT;

  const passed =
    wiringComplete &&
    docWired &&
    specWired &&
    visualSpecWired &&
    flowWired &&
    contract.passed &&
    threeSurfacesPresent &&
    VISUAL_QA_P3_55_FLOW_STEPS.length === 4;

  return {
    policyId: VISUAL_QA_P3_55_POLICY_ID,
    wiringComplete,
    docWired,
    specWired,
    visualSpecWired,
    flowWired,
    contractValid: contract.passed,
    threeSurfacesPresent,
    passed,
  };
}

export function formatVisualQaP3_55AuditLines(summary: VisualQaP3_55AuditSummary): string[] {
  return [
    `Visual QA audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${VISUAL_QA_P3_55_DOC})`,
    `Spec wired: ${summary.specWired ? "yes" : "no"} (${VISUAL_QA_P3_55_SPEC})`,
    `Visual spec wired: ${summary.visualSpecWired ? "yes" : "no"} (${VISUAL_QA_P3_55_VISUAL_SPEC})`,
    `Flow helper: ${summary.flowWired ? "yes" : "no"}`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Three surfaces: ${summary.threeSurfacesPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
