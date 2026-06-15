import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  checkCaseStudyTemplateLivePrePilotAudit,
  loadCaseStudyTemplatePmRegistry,
  validateCaseStudyTemplatePmRegistry,
} from "@/lib/pm/case-study-template-p3-139-operations";
import {
  CASE_STUDY_TEMPLATE_P3_139_ARTIFACT,
  CASE_STUDY_TEMPLATE_P3_139_DOC,
  CASE_STUDY_TEMPLATE_P3_139_FOUNDER_SUBSECTIONS,
  CASE_STUDY_TEMPLATE_P3_139_HONESTY_MARKERS,
  CASE_STUDY_TEMPLATE_P3_139_IMPLEMENTATION_REF,
  CASE_STUDY_TEMPLATE_P3_139_POLICY_ID,
  CASE_STUDY_TEMPLATE_P3_139_RELATED_DOCS,
  CASE_STUDY_TEMPLATE_P3_139_SECTION_IDS,
  CASE_STUDY_TEMPLATE_P3_139_TEMPLATE_TYPE,
  CASE_STUDY_TEMPLATE_P3_139_WIRING_PATHS,
} from "@/lib/pm/case-study-template-p3-139-policy";

export type CaseStudyTemplateP3_139AuditSummary = {
  policyId: typeof CASE_STUDY_TEMPLATE_P3_139_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryValid: boolean;
  livePrePilotAuditPassed: boolean;
  relatedDocsReferenced: boolean;
  sectionsDocumented: boolean;
  founderStoryDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditCaseStudyTemplateP3_139(
  root = process.cwd(),
): CaseStudyTemplateP3_139AuditSummary {
  const wiringComplete = CASE_STUDY_TEMPLATE_P3_139_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;
  let sectionsDocumented = false;
  let founderStoryDocumented = false;

  if (existsSync(join(root, CASE_STUDY_TEMPLATE_P3_139_DOC))) {
    const source = readFileSync(join(root, CASE_STUDY_TEMPLATE_P3_139_DOC), "utf8");
    docWired =
      source.includes(CASE_STUDY_TEMPLATE_P3_139_IMPLEMENTATION_REF) &&
      source.includes(CASE_STUDY_TEMPLATE_P3_139_TEMPLATE_TYPE) &&
      source.includes("pre-pilot with founder story");
    relatedDocsReferenced = CASE_STUDY_TEMPLATE_P3_139_RELATED_DOCS.every((doc) => {
      const basename = doc.split("/").pop() ?? doc;
      return source.includes(basename);
    });
    sectionsDocumented = CASE_STUDY_TEMPLATE_P3_139_SECTION_IDS.every((sectionId) =>
      source.includes(sectionId),
    );
    founderStoryDocumented = CASE_STUDY_TEMPLATE_P3_139_FOUNDER_SUBSECTIONS.every((subsection) =>
      source.includes(subsection),
    );
  }

  let registryValid = false;
  if (existsSync(join(root, CASE_STUDY_TEMPLATE_P3_139_ARTIFACT))) {
    const registry = loadCaseStudyTemplatePmRegistry(root);
    registryValid = validateCaseStudyTemplatePmRegistry(registry).valid;
  }

  const livePrePilotAuditPassed = checkCaseStudyTemplateLivePrePilotAudit(root);

  const combinedSources = [CASE_STUDY_TEMPLATE_P3_139_DOC, CASE_STUDY_TEMPLATE_P3_139_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = CASE_STUDY_TEMPLATE_P3_139_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    registryValid &&
    livePrePilotAuditPassed &&
    relatedDocsReferenced &&
    sectionsDocumented &&
    founderStoryDocumented &&
    honestyMarkersPresent;

  return {
    policyId: CASE_STUDY_TEMPLATE_P3_139_POLICY_ID,
    wiringComplete,
    docWired,
    registryValid,
    livePrePilotAuditPassed,
    relatedDocsReferenced,
    sectionsDocumented,
    founderStoryDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatCaseStudyTemplateP3_139AuditLines(
  summary: CaseStudyTemplateP3_139AuditSummary,
): string[] {
  return [
    `Case study template PM audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${CASE_STUDY_TEMPLATE_P3_139_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Registry artifact: ${summary.registryValid ? "yes" : "no"}`,
    `Live pre-pilot audit: ${summary.livePrePilotAuditPassed ? "PASS" : "FAIL"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `Sections documented: ${summary.sectionsDocumented ? "yes" : "no"}`,
    `Founder story documented: ${summary.founderStoryDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
