import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditNoopV1FallbackPolicy,
  isNoopV1EmptyBlob,
  OFFLINE_PCI_NOOP_V1_LEGACY_UNSEAL_ALLOWED,
} from "@/lib/pos/offline-pci-noop-v1-review";
import { auditOfflinePosPciEncryptionHardening } from "@/lib/pos/offline-pos-pci-review-policy";
import {
  auditOfflinePosPciNoopV1P244,
  formatOfflinePosPciNoopV1P244AuditLines,
} from "@/lib/security/offline-pos-pci-noop-v1-p2-44-audit";
import {
  OFFLINE_POS_PCI_NOOP_V1_P2_44_ARTIFACT,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_CHECK_NPM_SCRIPT,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_CI_NPM_SCRIPT,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_CI_WORKFLOW,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_DECISION,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_DOC,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_ENCRYPTION_MODULE,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_POLICY_ID,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_QSA_CHECKLIST,
  OFFLINE_POS_PCI_NOOP_V1_P2_44_WIRING_PATHS,
} from "@/lib/security/offline-pos-pci-noop-v1-p2-44-policy";
import {
  isNoopV1EmptyBlob as encryptionIsNoopV1EmptyBlob,
  sealOfflinePciField,
} from "@/lib/pos/offline-pci-local-encryption";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Offline POS PCI noop-v1 QSA review (P2-44)", () => {
  it("locks P2-44 policy with retain-empty-only decision", () => {
    expect(OFFLINE_POS_PCI_NOOP_V1_P2_44_POLICY_ID).toBe(
      "offline-pos-pci-noop-v1-p2-44-v1",
    );
    expect(OFFLINE_POS_PCI_NOOP_V1_P2_44_DECISION).toBe("retain-empty-only");
    expect(OFFLINE_PCI_NOOP_V1_LEGACY_UNSEAL_ALLOWED).toBe(true);
  });

  it("encryption module passes noop-v1 and hardening audits — no btoa fallback", () => {
    const source = readSource(OFFLINE_POS_PCI_NOOP_V1_P2_44_ENCRYPTION_MODULE);
    const noop = auditNoopV1FallbackPolicy(source);
    const hardening = auditOfflinePosPciEncryptionHardening(source);
    expect(noop.passed, noop.failures.join("; ")).toBe(true);
    expect(hardening.passed, hardening.failures.join("; ")).toBe(true);
    expect(source).not.toContain("btoa(trimmed)");
  });

  it("seals empty plaintext to noop-v1 sentinel only", async () => {
    const blob = await sealOfflinePciField("   ");
    expect(blob.algorithm).toBe("noop-v1");
    expect(blob.sealed).toBe("");
    expect(isNoopV1EmptyBlob(blob)).toBe(true);
    expect(encryptionIsNoopV1EmptyBlob(blob)).toBe(true);
  });

  it("passes full P2-44 audit — QSA checklist and legacy unseal documented", () => {
    const summary = auditOfflinePosPciNoopV1P244(ROOT);
    expect(summary.noopV1ReviewPassed).toBe(true);
    expect(summary.encryptionHardeningPassed).toBe(true);
    expect(summary.qsaChecklistComplete).toBe(true);
    expect(summary.legacyUnsealDocumented).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-44 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of OFFLINE_POS_PCI_NOOP_V1_P2_44_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${OFFLINE_POS_PCI_NOOP_V1_P2_44_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${OFFLINE_POS_PCI_NOOP_V1_P2_44_CI_NPM_SCRIPT}"`);

    const ci = readSource(OFFLINE_POS_PCI_NOOP_V1_P2_44_CI_WORKFLOW);
    expect(ci).toContain(OFFLINE_POS_PCI_NOOP_V1_P2_44_CHECK_NPM_SCRIPT);

    const doc = readSource(OFFLINE_POS_PCI_NOOP_V1_P2_44_DOC);
    expect(doc).toContain(OFFLINE_POS_PCI_NOOP_V1_P2_44_POLICY_ID);
    for (const item of OFFLINE_POS_PCI_NOOP_V1_P2_44_QSA_CHECKLIST) {
      expect(doc).toContain(item);
    }

    const artifact = JSON.parse(readSource(OFFLINE_POS_PCI_NOOP_V1_P2_44_ARTIFACT));
    expect(artifact.policyId).toBe(OFFLINE_POS_PCI_NOOP_V1_P2_44_POLICY_ID);
    expect(artifact.decision).toBe("retain-empty-only");
  });

  it("formats audit lines", () => {
    const summary = auditOfflinePosPciNoopV1P244(ROOT);
    const lines = formatOfflinePosPciNoopV1P244AuditLines(summary);
    expect(lines.some((line) => line.includes(OFFLINE_POS_PCI_NOOP_V1_P2_44_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
