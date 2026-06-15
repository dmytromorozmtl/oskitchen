import { readFileSync } from "node:fs";
import { join } from "node:path";

import { auditCaseStudyTemplatePrePilotFromRoot } from "@/lib/marketing/case-study-template-pre-pilot-policy";
import {
  CASE_STUDY_TEMPLATE_P3_139_IMPLEMENTATION_REF,
  CASE_STUDY_TEMPLATE_P3_139_POLICY_ID,
  CASE_STUDY_TEMPLATE_P3_139_SECTION_IDS,
  CASE_STUDY_TEMPLATE_P3_139_TEMPLATE_TYPE,
} from "@/lib/pm/case-study-template-p3-139-policy";

export type CaseStudyTemplateSectionRecord = {
  id: string;
  label: string;
  required: boolean;
  status: string;
};

export type CaseStudyTemplatePmRegistry = {
  version: string;
  policyId: typeof CASE_STUDY_TEMPLATE_P3_139_POLICY_ID;
  updatedAt: string;
  honestyNote: string;
  implementationRef: string;
  templateType: string;
  publishedCaseStudyCount: number;
  draftCount: number;
  sections: CaseStudyTemplateSectionRecord[];
};

export function loadCaseStudyTemplatePmRegistry(
  root = process.cwd(),
  artifactPath = "artifacts/case-study-template-pm-registry.json",
): CaseStudyTemplatePmRegistry {
  const raw = readFileSync(join(root, artifactPath), "utf8");
  return JSON.parse(raw) as CaseStudyTemplatePmRegistry;
}

export function validateCaseStudyTemplatePmRegistry(
  registry: CaseStudyTemplatePmRegistry,
): {
  valid: boolean;
  policyIdMatches: boolean;
  sectionsComplete: boolean;
  zeroPublished: boolean;
} {
  const policyIdMatches = registry.policyId === CASE_STUDY_TEMPLATE_P3_139_POLICY_ID;

  const sectionsComplete =
    registry.sections.length === CASE_STUDY_TEMPLATE_P3_139_SECTION_IDS.length &&
    CASE_STUDY_TEMPLATE_P3_139_SECTION_IDS.every((sectionId, index) => {
      const section = registry.sections[index];
      return (
        section?.id === sectionId &&
        section.required === true &&
        section.status === "template_only"
      );
    });

  const zeroPublished =
    registry.publishedCaseStudyCount === 0 &&
    registry.draftCount === 0 &&
    registry.implementationRef === CASE_STUDY_TEMPLATE_P3_139_IMPLEMENTATION_REF &&
    registry.templateType === CASE_STUDY_TEMPLATE_P3_139_TEMPLATE_TYPE;

  const valid = policyIdMatches && sectionsComplete && zeroPublished;

  return {
    valid,
    policyIdMatches,
    sectionsComplete,
    zeroPublished,
  };
}

export function checkCaseStudyTemplateLivePrePilotAudit(root = process.cwd()): boolean {
  const summary = auditCaseStudyTemplatePrePilotFromRoot(root);
  return summary.passed;
}
