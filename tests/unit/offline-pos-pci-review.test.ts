import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  auditOfflinePosPciReviewDoc,
  auditOfflinePosPciReviewFromRoot,
  auditOfflinePosPciEncryptionHardening,
  lintOfflinePosPciReviewCopy,
  OFFLINE_POS_PCI_REVIEW_CODE_PATHS,
  OFFLINE_POS_PCI_REVIEW_DOC,
  OFFLINE_POS_PCI_REVIEW_POLICY_ID,
  OFFLINE_POS_PCI_REVIEW_REQUIRED_HEADINGS,
} from "@/lib/pos/offline-pos-pci-review-policy";

const ROOT = process.cwd();

describe("offline POS PCI review (Absolute Final Task 39)", () => {
  it("locks PCI review policy id and doc path", () => {
    expect(OFFLINE_POS_PCI_REVIEW_POLICY_ID).toBe(
      "offline-pos-pci-review-absolute-final-v1",
    );
    expect(OFFLINE_POS_PCI_REVIEW_DOC).toBe("docs/offline-pos-pci-review.md");
    expect(OFFLINE_POS_PCI_REVIEW_CODE_PATHS.length).toBeGreaterThanOrEqual(5);
  });

  it("passes audit on canonical offline POS PCI review doc", () => {
    const audit = auditOfflinePosPciReviewFromRoot();
    expect(audit.missingHeadings, audit.missingHeadings.join("; ")).toEqual([]);
    expect(audit.codePathHits).toBe(OFFLINE_POS_PCI_REVIEW_CODE_PATHS.length);
    expect(audit.relatedDocHits).toBeGreaterThanOrEqual(1);
    expect(audit.passed).toBe(true);
  });

  it("includes all required headings and CHD boundary section", () => {
    const source = readFileSync(join(ROOT, OFFLINE_POS_PCI_REVIEW_DOC), "utf8");
    for (const heading of OFFLINE_POS_PCI_REVIEW_REQUIRED_HEADINGS) {
      expect(source).toContain(heading);
    }
    expect(source).toContain("assertPciSafeOfflineCardCapture");
    expect(source).toContain("offline-pos-plan.md");
  });

  it("blocks insecure noop-v1 plaintext fallback in encryption module", () => {
    const source = readFileSync(
      join(ROOT, "lib/pos/offline-pci-local-encryption.ts"),
      "utf8",
    );
    const hardening = auditOfflinePosPciEncryptionHardening(source);
    expect(hardening.passed, hardening.failures.join("; ")).toBe(true);
    expect(source).toContain("OfflinePciEncryptionUnavailableError");
    expect(source).not.toContain("btoa(trimmed)");
  });

  it("forbids overstated PCI certification claims in review copy lint", () => {
    const bad = lintOfflinePosPciReviewCopy(
      "OS Kitchen is PCI Level 1 certified with EMV offline and card works without connectivity.",
    );
    expect(bad.passed).toBe(false);
    expect(bad.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest PCI boundary copy", () => {
    const result = lintOfflinePosPciReviewCopy(
      "OS Kitchen never stores full card numbers — offline queue holds last4, brand, and Stripe opaque references until reconnect.",
    );
    expect(result.passed).toBe(true);
  });

  it("fails audit when required headings missing", () => {
    const audit = auditOfflinePosPciReviewDoc("# Offline POS queue — PCI scope review\n");
    expect(audit.passed).toBe(false);
    expect(audit.missingHeadings.length).toBeGreaterThan(0);
  });
});
