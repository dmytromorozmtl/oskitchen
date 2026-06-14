import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  auditNoopV1FallbackPolicy,
  OFFLINE_PCI_NOOP_V1_LEGACY_UNSEAL_ALLOWED,
} from "@/lib/pos/offline-pci-noop-v1-review";
import { auditOfflinePosPciEncryptionHardening } from "@/lib/pos/offline-pos-pci-review-policy";
import {
  OFFLINE_POS_PCI_NOOP_V1_P2_44_DECISION,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_DOC,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_ENCRYPTION_MODULE,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_FORBIDDEN_PATTERNS,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_PCI_REVIEW_DOC,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_POLICY_ID,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_QSA_CHECKLIST,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_REQUIRED_GATES,
} from "@/lib/security/offline-pos-pci-noop-v1-p2-44-policy";

export type OfflinePosPciNoopV1P244AuditSummary = {
  policyId: typeof OFFLINE_POS_PCI_NOOP_V1_P2_44_POLICY_ID;
  decision: typeof OFFLINE_POS_PCI_NOOP_V1_P2_44_DECISION;
  noopV1ReviewPassed: boolean;
  encryptionHardeningPassed: boolean;
  docPresent: boolean;
  pciReviewDocPresent: boolean;
  qsaChecklistComplete: boolean;
  legacyUnsealDocumented: boolean;
  passed: boolean;
};

export function auditOfflinePosPciNoopV1P244(root = process.cwd()): OfflinePosPciNoopV1P244AuditSummary {
  const encryptionSource = readFileSync(
    join(root, OFFLINE_POS_PCI_NOOP_V1_P2_44_ENCRYPTION_MODULE),
    "utf8",
  );
  const noopReview = auditNoopV1FallbackPolicy(encryptionSource);
  const hardening = auditOfflinePosPciEncryptionHardening(encryptionSource);

  const docPresent = existsSync(join(root, OFFLINE_POS_PCI_NOOP_V1_P2_44_DOC));
  const pciReviewDocPresent = existsSync(join(root, OFFLINE_POS_PCI_NOOP_V1_P2_44_PCI_REVIEW_DOC));

  let qsaChecklistComplete = false;
  let legacyUnsealDocumented = false;
  if (docPresent) {
    const doc = readFileSync(join(root, OFFLINE_POS_PCI_NOOP_V1_P2_44_DOC), "utf8");
    qsaChecklistComplete = OFFLINE_POS_PCI_NOOP_V1_P2_44_QSA_CHECKLIST.every((item) =>
      doc.includes(item),
    );
    legacyUnsealDocumented =
      doc.includes("legacy-unseal-migration-read-only") &&
      doc.includes(String(OFFLINE_PCI_NOOP_V1_LEGACY_UNSEAL_ALLOWED));
  }

  const forbiddenAbsent = OFFLINE_POS_PCI_NOOP_V1_P2_44_FORBIDDEN_PATTERNS.every(
    (pattern) => !encryptionSource.includes(pattern),
  );
  const gatesPresent = OFFLINE_POS_PCI_NOOP_V1_P2_44_REQUIRED_GATES.every((gate) =>
    encryptionSource.includes(gate),
  );

  const passed =
    noopReview.passed &&
    hardening.passed &&
    forbiddenAbsent &&
    gatesPresent &&
    docPresent &&
    pciReviewDocPresent &&
    qsaChecklistComplete &&
    legacyUnsealDocumented;

  return {
    policyId: OFFLINE_POS_PCI_NOOP_V1_P2_44_POLICY_ID,
    decision: OFFLINE_POS_PCI_NOOP_V1_P2_44_DECISION,
    noopV1ReviewPassed: noopReview.passed,
    encryptionHardeningPassed: hardening.passed,
    docPresent,
    pciReviewDocPresent,
    qsaChecklistComplete,
    legacyUnsealDocumented,
    passed,
  };
}

export function formatOfflinePosPciNoopV1P244AuditLines(
  summary: OfflinePosPciNoopV1P244AuditSummary,
): string[] {
  return [
    `Offline POS PCI noop-v1 review (${summary.policyId})`,
    `Decision: ${summary.decision}`,
    `noop-v1 policy audit: ${summary.noopV1ReviewPassed ? "passed" : "failed"}`,
    `Encryption hardening: ${summary.encryptionHardeningPassed ? "passed" : "failed"}`,
    `QSA checklist doc: ${summary.qsaChecklistComplete ? "complete" : "incomplete"}`,
    `Legacy unseal documented: ${summary.legacyUnsealDocumented ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
