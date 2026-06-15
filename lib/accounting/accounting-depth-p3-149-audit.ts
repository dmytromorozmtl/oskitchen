import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  checkAccountingDepthApAudit,
  checkAccountingDepthCoaAudit,
  checkAccountingDepthJournalAudit,
  checkAccountingDepthLegacyGlWiring,
  checkAccountingDepthLiveWiring,
  checkAccountingDepthPortalAudit,
  checkAccountingDepthReconciliationAudit,
  loadAccountingDepthR365Registry,
  validateAccountingDepthR365Registry,
} from "@/lib/accounting/accounting-depth-p3-149-operations";
import {
  ACCOUNTING_DEPTH_P3_149_ARTIFACT,
  ACCOUNTING_DEPTH_P3_149_CAPABILITY_COUNT,
  ACCOUNTING_DEPTH_P3_149_CAPABILITY_IDS,
  ACCOUNTING_DEPTH_P3_149_COMPETITOR,
  ACCOUNTING_DEPTH_P3_149_DOC,
  ACCOUNTING_DEPTH_P3_149_HEADLINE,
  ACCOUNTING_DEPTH_P3_149_HONESTY_MARKERS,
  ACCOUNTING_DEPTH_P3_149_IMPLEMENTATION_REF,
  ACCOUNTING_DEPTH_P3_149_POLICY_ID,
  ACCOUNTING_DEPTH_P3_149_POSITIONING_LINE,
  ACCOUNTING_DEPTH_P3_149_RELATED_DOCS,
  ACCOUNTING_DEPTH_P3_149_ROUTE,
  ACCOUNTING_DEPTH_P3_149_WIRING_PATHS,
} from "@/lib/accounting/accounting-depth-p3-149-policy";

export type AccountingDepthP3_149AuditSummary = {
  policyId: typeof ACCOUNTING_DEPTH_P3_149_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  registryValid: boolean;
  coaAuditPassed: boolean;
  journalAuditPassed: boolean;
  portalAuditPassed: boolean;
  reconciliationAuditPassed: boolean;
  apAuditPassed: boolean;
  legacyGlWiringPassed: boolean;
  liveDepthWiringPassed: boolean;
  relatedDocsReferenced: boolean;
  capabilitiesDocumented: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditAccountingDepthP3_149(
  root = process.cwd(),
): AccountingDepthP3_149AuditSummary {
  const wiringComplete = ACCOUNTING_DEPTH_P3_149_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;
  let capabilitiesDocumented = false;

  if (existsSync(join(root, ACCOUNTING_DEPTH_P3_149_DOC))) {
    const source = readFileSync(join(root, ACCOUNTING_DEPTH_P3_149_DOC), "utf8");
    docWired =
      source.includes(ACCOUNTING_DEPTH_P3_149_HEADLINE) &&
      source.includes(ACCOUNTING_DEPTH_P3_149_POSITIONING_LINE) &&
      source.includes(ACCOUNTING_DEPTH_P3_149_COMPETITOR) &&
      source.includes(ACCOUNTING_DEPTH_P3_149_IMPLEMENTATION_REF) &&
      source.includes(String(ACCOUNTING_DEPTH_P3_149_CAPABILITY_COUNT)) &&
      source.includes(ACCOUNTING_DEPTH_P3_149_ROUTE);
    relatedDocsReferenced = ACCOUNTING_DEPTH_P3_149_RELATED_DOCS.every((doc) => {
      const basename = doc.split("/").pop() ?? doc;
      return source.includes(basename);
    });
    capabilitiesDocumented = ACCOUNTING_DEPTH_P3_149_CAPABILITY_IDS.every((capabilityId) =>
      source.includes(capabilityId),
    );
  }

  let registryValid = false;
  if (existsSync(join(root, ACCOUNTING_DEPTH_P3_149_ARTIFACT))) {
    const registry = loadAccountingDepthR365Registry(root);
    registryValid = validateAccountingDepthR365Registry(registry).valid;
  }

  const coaAuditPassed = checkAccountingDepthCoaAudit(root);
  const journalAuditPassed = checkAccountingDepthJournalAudit(root);
  const portalAuditPassed = checkAccountingDepthPortalAudit(root);
  const reconciliationAuditPassed = checkAccountingDepthReconciliationAudit(root);
  const apAuditPassed = checkAccountingDepthApAudit(root);
  const legacyGlWiringPassed = checkAccountingDepthLegacyGlWiring(root);
  const liveDepthWiringPassed = checkAccountingDepthLiveWiring(root);

  const combinedSources = [ACCOUNTING_DEPTH_P3_149_DOC, ACCOUNTING_DEPTH_P3_149_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = ACCOUNTING_DEPTH_P3_149_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    registryValid &&
    coaAuditPassed &&
    journalAuditPassed &&
    portalAuditPassed &&
    reconciliationAuditPassed &&
    apAuditPassed &&
    legacyGlWiringPassed &&
    liveDepthWiringPassed &&
    relatedDocsReferenced &&
    capabilitiesDocumented &&
    honestyMarkersPresent;

  return {
    policyId: ACCOUNTING_DEPTH_P3_149_POLICY_ID,
    wiringComplete,
    docWired,
    registryValid,
    coaAuditPassed,
    journalAuditPassed,
    portalAuditPassed,
    reconciliationAuditPassed,
    apAuditPassed,
    legacyGlWiringPassed,
    liveDepthWiringPassed,
    relatedDocsReferenced,
    capabilitiesDocumented,
    honestyMarkersPresent,
    passed,
  };
}

export function formatAccountingDepthP3_149AuditLines(
  summary: AccountingDepthP3_149AuditSummary,
): string[] {
  return [
    `Accounting depth R365 audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${ACCOUNTING_DEPTH_P3_149_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Registry artifact: ${summary.registryValid ? "yes" : "no"}`,
    `COA mapping audit: ${summary.coaAuditPassed ? "PASS" : "FAIL"}`,
    `Journal export audit: ${summary.journalAuditPassed ? "PASS" : "FAIL"}`,
    `Accountant portal audit: ${summary.portalAuditPassed ? "PASS" : "FAIL"}`,
    `P&L reconciliation audit: ${summary.reconciliationAuditPassed ? "PASS" : "FAIL"}`,
    `AP automation audit: ${summary.apAuditPassed ? "PASS" : "FAIL"}`,
    `Legacy GL wiring: ${summary.legacyGlWiringPassed ? "PASS" : "FAIL"}`,
    `Live accounting depth hub: ${summary.liveDepthWiringPassed ? "PASS" : "FAIL"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `6 accounting capabilities documented: ${summary.capabilitiesDocumented ? "yes" : "no"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
