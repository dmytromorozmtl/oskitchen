import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditAesGcmImplementation,
  auditOfflinePosPciFullP382,
  formatOfflinePosPciFullP382AuditLines,
} from "@/lib/security/offline-pos-pci-full-p3-82-audit";
import {
  OFFLINE_POS_PCI_FULL_P3_82_ARTIFACT,
  OFFLINE_POS_PCI_FULL_P3_82_AES_GCM_ALGORITHM,
  OFFLINE_POS_PCI_FULL_P3_82_CHECK_NPM_SCRIPT,
  OFFLINE_POS_PCI_FULL_P3_82_CI_WORKFLOW,
  OFFLINE_POS_PCI_FULL_P3_82_DOC,
  OFFLINE_POS_PCI_FULL_P3_82_ENCRYPTION_MODULE,
  OFFLINE_POS_PCI_FULL_P3_82_POLICY_ID,
  OFFLINE_POS_PCI_FULL_P3_82_QSA_CHECKLIST,
  OFFLINE_POS_PCI_FULL_P3_82_SIGNOFF_STATUS,
  OFFLINE_POS_PCI_FULL_P3_82_UNIT_TEST,
  OFFLINE_POS_PCI_FULL_P3_82_WIRING_PATHS,
} from "@/lib/security/offline-pos-pci-full-p3-82-policy";
import { runOfflinePosPciFullBenchmarkP382 } from "@/lib/security/offline-pos-pci-full-p3-82-scoring";

const ROOT = process.cwd();

describe("Offline POS PCI full review (P3-82)", () => {
  it("locks P3-82 policy with AES-GCM sign-off status", () => {
    expect(OFFLINE_POS_PCI_FULL_P3_82_POLICY_ID).toBe("offline-pos-pci-full-p3-82-v1");
    expect(OFFLINE_POS_PCI_FULL_P3_82_AES_GCM_ALGORITHM).toBe("aes-gcm-v1");
    expect(OFFLINE_POS_PCI_FULL_P3_82_SIGNOFF_STATUS).toBe(
      "engineering_ready_pending_external_qsa",
    );
  });

  it("passes AES-GCM implementation audit on encryption module", () => {
    const source = readFileSync(
      join(ROOT, OFFLINE_POS_PCI_FULL_P3_82_ENCRYPTION_MODULE),
      "utf8",
    );
    const audit = auditAesGcmImplementation(source);
    expect(audit.passed, audit.failures.join("; ")).toBe(true);
    expect(source).not.toContain("btoa(trimmed)");
  });

  it("passes offline POS PCI full benchmark", () => {
    const benchmark = runOfflinePosPciFullBenchmarkP382({
      fullReviewDocComplete: true,
      aesGcmImplementationPassed: true,
      upstreamP244Passed: true,
      upstreamP135E2EChainWired: true,
      qsaSignoffArtifactComplete: true,
      pciReviewDocCrossLinked: true,
    });
    expect(benchmark.passPct).toBe(100);
    expect(benchmark.passed).toBe(true);
  });

  it("passes full P3-82 offline POS PCI audit", () => {
    const summary = auditOfflinePosPciFullP382(ROOT);
    expect(summary.aesGcmImplementationPassed).toBe(true);
    expect(summary.upstreamP244Passed).toBe(true);
    expect(summary.upstreamP135E2EChainWired).toBe(true);
    expect(summary.qsaSignoffArtifactComplete).toBe(true);
    expect(summary.pciReviewDocCrossLinked).toBe(true);
    expect(summary.scoringPassed).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-82 wiring paths, CI gate, and artifacts", () => {
    for (const path of OFFLINE_POS_PCI_FULL_P3_82_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[OFFLINE_POS_PCI_FULL_P3_82_CHECK_NPM_SCRIPT]).toContain(
      OFFLINE_POS_PCI_FULL_P3_82_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, OFFLINE_POS_PCI_FULL_P3_82_CI_WORKFLOW), "utf8");
    expect(ci).toContain(OFFLINE_POS_PCI_FULL_P3_82_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, OFFLINE_POS_PCI_FULL_P3_82_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(OFFLINE_POS_PCI_FULL_P3_82_POLICY_ID);
    expect(artifact.signoffStatus).toBe(OFFLINE_POS_PCI_FULL_P3_82_SIGNOFF_STATUS);
    expect(artifact.engineeringReviewPassed).toBe(true);
    expect(artifact.externalQsaPending).toBe(true);

    const doc = readFileSync(join(ROOT, OFFLINE_POS_PCI_FULL_P3_82_DOC), "utf8");
    expect(doc).toContain(OFFLINE_POS_PCI_FULL_P3_82_POLICY_ID);
    for (const item of OFFLINE_POS_PCI_FULL_P3_82_QSA_CHECKLIST) {
      expect(doc).toContain(item);
    }
  });

  it("formats audit lines", () => {
    const summary = auditOfflinePosPciFullP382(ROOT);
    const lines = formatOfflinePosPciFullP382AuditLines(summary);
    expect(lines.some((line) => line.includes(OFFLINE_POS_PCI_FULL_P3_82_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
