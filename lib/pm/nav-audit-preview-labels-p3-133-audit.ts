import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  computeNavPreviewLabelSnapshot,
  loadNavAuditPreviewLabelsBaseline,
  validateNavAuditPreviewLabelsBaseline,
} from "@/lib/pm/nav-audit-preview-labels-p3-133-operations";
import {
  NAV_AUDIT_PREVIEW_LABELS_PM_ARTIFACT,
  NAV_AUDIT_PREVIEW_LABELS_PM_DOC,
  NAV_AUDIT_PREVIEW_LABELS_PM_HISTORICAL_PCT,
  NAV_AUDIT_PREVIEW_LABELS_PM_HONESTY_MARKERS,
  NAV_AUDIT_PREVIEW_LABELS_PM_IMPLEMENTATION_REFS,
  NAV_AUDIT_PREVIEW_LABELS_PM_POLICY_ID,
  NAV_AUDIT_PREVIEW_LABELS_PM_RELATED_DOCS,
  NAV_AUDIT_PREVIEW_LABELS_PM_WIRING_PATHS,
} from "@/lib/pm/nav-audit-preview-labels-p3-133-policy";

export type NavAuditPreviewLabelsPmAuditSummary = {
  policyId: typeof NAV_AUDIT_PREVIEW_LABELS_PM_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  baselineValid: boolean;
  relatedDocsReferenced: boolean;
  historicalDocumented: boolean;
  liveAuditPassed: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditNavAuditPreviewLabelsPm(
  root = process.cwd(),
): NavAuditPreviewLabelsPmAuditSummary {
  const wiringComplete = NAV_AUDIT_PREVIEW_LABELS_PM_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  let relatedDocsReferenced = false;
  let historicalDocumented = false;

  if (existsSync(join(root, NAV_AUDIT_PREVIEW_LABELS_PM_DOC))) {
    const source = readFileSync(join(root, NAV_AUDIT_PREVIEW_LABELS_PM_DOC), "utf8");
    docWired =
      source.includes(String(NAV_AUDIT_PREVIEW_LABELS_PM_HISTORICAL_PCT)) &&
      source.includes("0% unlabeled") &&
      source.includes(NAV_AUDIT_PREVIEW_LABELS_PM_IMPLEMENTATION_REFS.p1_24) &&
      source.includes(NAV_AUDIT_PREVIEW_LABELS_PM_IMPLEMENTATION_REFS.p1_56) &&
      source.includes('variant="preview"') &&
      source.includes('variant="beta"');
    relatedDocsReferenced = NAV_AUDIT_PREVIEW_LABELS_PM_RELATED_DOCS.every((doc) =>
      source.includes(doc.split("/").pop() ?? doc),
    );
    historicalDocumented =
      source.includes(`${NAV_AUDIT_PREVIEW_LABELS_PM_HISTORICAL_PCT}%`) &&
      source.includes("P1-24") &&
      source.includes("P1-56");
  }

  const liveSnapshot = computeNavPreviewLabelSnapshot(root);

  let baselineValid = false;
  if (existsSync(join(root, NAV_AUDIT_PREVIEW_LABELS_PM_ARTIFACT))) {
    const baseline = loadNavAuditPreviewLabelsBaseline(root);
    baselineValid = validateNavAuditPreviewLabelsBaseline(baseline, liveSnapshot).valid;
  }

  const combinedSources = [NAV_AUDIT_PREVIEW_LABELS_PM_DOC, NAV_AUDIT_PREVIEW_LABELS_PM_ARTIFACT]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = NAV_AUDIT_PREVIEW_LABELS_PM_HONESTY_MARKERS.every((marker) =>
    combinedSources.includes(marker),
  );

  const passed =
    wiringComplete &&
    docWired &&
    baselineValid &&
    relatedDocsReferenced &&
    historicalDocumented &&
    liveSnapshot.liveAuditPassed &&
    honestyMarkersPresent;

  return {
    policyId: NAV_AUDIT_PREVIEW_LABELS_PM_POLICY_ID,
    wiringComplete,
    docWired,
    baselineValid,
    relatedDocsReferenced,
    historicalDocumented,
    liveAuditPassed: liveSnapshot.liveAuditPassed,
    honestyMarkersPresent,
    passed,
  };
}

export function formatNavAuditPreviewLabelsPmAuditLines(
  summary: NavAuditPreviewLabelsPmAuditSummary,
): string[] {
  return [
    `Nav audit preview labels PM (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc (${NAV_AUDIT_PREVIEW_LABELS_PM_DOC}): ${summary.docWired ? "yes" : "no"}`,
    `Baseline artifact: ${summary.baselineValid ? "yes" : "no"}`,
    `Related docs referenced: ${summary.relatedDocsReferenced ? "yes" : "no"}`,
    `Historical 40% documented: ${summary.historicalDocumented ? "yes" : "no"}`,
    `Live P1-24/P1-56 audit: ${summary.liveAuditPassed ? "PASS" : "FAIL"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
