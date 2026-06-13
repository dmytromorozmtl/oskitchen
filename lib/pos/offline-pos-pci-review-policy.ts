import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Absolute Final Task 39 — offline POS queue PCI scope review.
 *
 * @see docs/offline-pos-pci-review.md
 * @see docs/offline-pos-plan.md
 * @see lib/pos/offline-card-pci.ts
 */

export const OFFLINE_POS_PCI_REVIEW_POLICY_ID =
  "offline-pos-pci-review-absolute-final-v1" as const;

export const OFFLINE_POS_PCI_REVIEW_DOC = "docs/offline-pos-pci-review.md" as const;

export const OFFLINE_POS_PCI_REVIEW_RELATED_DOCS = [
  "docs/offline-pos-plan.md",
  "docs/pos-offline-queue-era170-setup.md",
] as const;

export const OFFLINE_POS_PCI_REVIEW_REQUIRED_HEADINGS = [
  "Offline POS queue — PCI scope review",
  "Executive summary",
  "Cardholder data boundary",
  "Device-local encryption",
  "PCI SAQ scope assessment",
  "Review checklist",
  "Sales & marketing guardrails",
  "Open gaps & remediation",
] as const;

export const OFFLINE_POS_PCI_REVIEW_CODE_PATHS = [
  "lib/pos/offline-card-pci.ts",
  "lib/pos/offline-pci-local-encryption.ts",
  "lib/pos/offline-pos-queue.ts",
  "lib/pos/offline-card-client-queue.ts",
  "services/pos-offline-queue.ts",
] as const;

export const OFFLINE_POS_PCI_REVIEW_FORBIDDEN_CLAIMS = [
  "pci level 1 certified",
  "emv offline",
  "card works without connectivity",
  "saq-a for pos",
  "production-ready offline card pos",
] as const;

export const OFFLINE_POS_PCI_REVIEW_CI_SCRIPTS = [
  "test:ci:offline-pos-pci-review",
] as const;

export type OfflinePosPciReviewDocAudit = {
  policyId: typeof OFFLINE_POS_PCI_REVIEW_POLICY_ID;
  missingHeadings: string[];
  codePathHits: number;
  relatedDocHits: number;
  passed: boolean;
};

export function auditOfflinePosPciReviewDoc(source: string): OfflinePosPciReviewDocAudit {
  const missingHeadings = OFFLINE_POS_PCI_REVIEW_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const codePathHits = OFFLINE_POS_PCI_REVIEW_CODE_PATHS.filter((path) =>
    source.includes(path),
  ).length;
  const relatedDocHits = OFFLINE_POS_PCI_REVIEW_RELATED_DOCS.filter((path) =>
    source.includes(path),
  ).length;

  return {
    policyId: OFFLINE_POS_PCI_REVIEW_POLICY_ID,
    missingHeadings,
    codePathHits,
    relatedDocHits,
    passed:
      missingHeadings.length === 0 &&
      codePathHits === OFFLINE_POS_PCI_REVIEW_CODE_PATHS.length &&
      relatedDocHits >= 1,
  };
}

export function auditOfflinePosPciReviewFromRoot(
  root = process.cwd(),
): OfflinePosPciReviewDocAudit {
  const source = readFileSync(join(root, OFFLINE_POS_PCI_REVIEW_DOC), "utf8");
  return auditOfflinePosPciReviewDoc(source);
}

export type OfflinePosPciReviewCopyLint = {
  forbiddenHits: string[];
  passed: boolean;
};

export function lintOfflinePosPciReviewCopy(source: string): OfflinePosPciReviewCopyLint {
  const lower = source.toLowerCase();
  const marketingLines = lower
    .split("\n")
    .filter(
      (line) =>
        !line.includes("forbidden") &&
        !line.startsWith("|") &&
        !line.includes("not ") &&
        !line.includes("never "),
    )
    .join("\n");
  const forbiddenHits = OFFLINE_POS_PCI_REVIEW_FORBIDDEN_CLAIMS.filter((phrase) =>
    marketingLines.includes(phrase),
  );
  return {
    forbiddenHits,
    passed: forbiddenHits.length === 0,
  };
}

/** P0-8 — noop-v1 insecure fallback must not seal plaintext when Web Crypto unavailable. */
export function auditOfflinePosPciEncryptionHardening(source: string): {
  passed: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  if (source.includes("btoa(trimmed)")) {
    failures.push("insecure noop-v1 btoa(trimmed) fallback must be removed");
  }
  if (!source.includes("OfflinePciEncryptionUnavailableError")) {
    failures.push("OfflinePciEncryptionUnavailableError class missing");
  }
  if (!source.includes("assertOfflinePciEncryptionAvailable")) {
    failures.push("assertOfflinePciEncryptionAvailable gate missing");
  }
  if (!source.includes("canQueueOfflineCardCapture")) {
    failures.push("canQueueOfflineCardCapture gate missing");
  }
  return { passed: failures.length === 0, failures };
}
