import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  checkCateringCrmCateringOsAudit,
  checkCateringCrmDepositWiring,
  checkCateringCrmEventSheetsWiring,
  checkCateringCrmLiveWiring,
  checkCateringCrmQuotesWiring,
  loadCateringCrmTripleseatRegistry,
  validateCateringCrmTripleseatRegistry,
} from "@/lib/catering/catering-crm-p3-150-operations";
import {
  CATERING_CRM_P3_150_ARTIFACT,
  CATERING_CRM_P3_150_CAPABILITY_COUNT,
  CATERING_CRM_P3_150_CAPABILITY_IDS,
  CATERING_CRM_P3_150_COMPETITOR,
  CATERING_CRM_P3_150_DOC,
  CATERING_CRM_P3_150_HEADLINE,
  CATERING_CRM_P3_150_HONESTY_MARKERS,
  CATERING_CRM_P3_150_IMPLEMENTATION_REF,
  CATERING_CRM_P3_150_POLICY_ID,
  CATERING_CRM_P3_150_POSITIONING_LINE,
  CATERING_CRM_P3_150_RELATED_DOCS,
  CATERING_CRM_P3_150_ROUTE,
  CATERING_CRM_P3_150_WIRING_PATHS,
} from "@/lib/catering/catering-crm-p3-150-policy";

export type CateringCrmP3_150AuditSummary = {
  policyId: typeof CATERING_CRM_P3_150_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryValid: boolean;
  cateringOsAuditPassed: boolean;
  quotesWiringPassed: boolean;
  depositWiringPassed: boolean;
  eventSheetsWiringPassed: boolean;
  liveCrmWiringPassed: boolean;
  relatedDocsReferenced: boolean;
  capabilitiesDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditCateringCrmP3_150(root = process.cwd()): CateringCrmP3_150AuditSummary {
  const wiringComplete = CATERING_CRM_P3_150_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;
  let capabilitiesDocumented = false;

  if (existsSync(join(root, CATERING_CRM_P3_150_DOC))) {
    const source = readFileSync(join(root, CATERING_CRM_P3_150_DOC), "utf8");
    docWired =
      source.includes(CATERING_CRM_P3_150_HEADLINE) &&
      source.includes(CATERING_CRM_P3_150_POSITIONING_LINE) &&
      source.includes(CATERING_CRM_P3_150_COMPETITOR) &&
      source.includes(CATERING_CRM_P3_150_IMPLEMENTATION_REF) &&
      source.includes(String(CATERING_CRM_P3_150_CAPABILITY_COUNT)) &&
      source.includes(CATERING_CRM_P3_150_ROUTE);
    relatedDocsReferenced = CATERING_CRM_P3_150_RELATED_DOCS.every((doc) => {
      const basename = doc.split("/").pop() ?? doc;
      return source.includes(basename);
    });
    capabilitiesDocumented = CATERING_CRM_P3_150_CAPABILITY_IDS.every((capabilityId) =>
      source.includes(capabilityId),
    );
  }

  let registryValid = false;
  if (existsSync(join(root, CATERING_CRM_P3_150_ARTIFACT))) {
    const registry = loadCateringCrmTripleseatRegistry(root);
    registryValid = validateCateringCrmTripleseatRegistry(registry).valid;
  }

  const cateringOsAuditPassed = checkCateringCrmCateringOsAudit(root);
  const quotesWiringPassed = checkCateringCrmQuotesWiring(root);
  const depositWiringPassed = checkCateringCrmDepositWiring(root);
  const eventSheetsWiringPassed = checkCateringCrmEventSheetsWiring(root);
  const liveCrmWiringPassed = checkCateringCrmLiveWiring(root);

  const combinedSources = [CATERING_CRM_P3_150_DOC, CATERING_CRM_P3_150_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = CATERING_CRM_P3_150_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    registryValid &&
    cateringOsAuditPassed &&
    quotesWiringPassed &&
    depositWiringPassed &&
    eventSheetsWiringPassed &&
    liveCrmWiringPassed &&
    relatedDocsReferenced &&
    capabilitiesDocumented &&
    honestyMarkersPresent;

  return {
    policyId: CATERING_CRM_P3_150_POLICY_ID,
    wiringComplete,
    docWired,
    registryValid,
    cateringOsAuditPassed,
    quotesWiringPassed,
    depositWiringPassed,
    eventSheetsWiringPassed,
    liveCrmWiringPassed,
    relatedDocsReferenced,
    capabilitiesDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatCateringCrmP3_150AuditLines(summary: CateringCrmP3_150AuditSummary): string[] {
  return [
    `Catering CRM Tripleseat audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${CATERING_CRM_P3_150_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Registry artifact: ${summary.registryValid ? "yes" : "no"}`,
    `Catering OS audit: ${summary.cateringOsAuditPassed ? "PASS" : "FAIL"}`,
    `Quotes wiring: ${summary.quotesWiringPassed ? "PASS" : "FAIL"}`,
    `Deposit wiring: ${summary.depositWiringPassed ? "PASS" : "FAIL"}`,
    `Event sheets wiring: ${summary.eventSheetsWiringPassed ? "PASS" : "FAIL"}`,
    `Live catering CRM hub: ${summary.liveCrmWiringPassed ? "PASS" : "FAIL"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `6 CRM capabilities documented: ${summary.capabilitiesDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
