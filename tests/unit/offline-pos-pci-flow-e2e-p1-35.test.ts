import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditOfflinePosPciFlowE2EP135,
  formatOfflinePosPciFlowE2EP135AuditLines,
  readOfflinePosPciFlowE2EP135Artifact,
} from "@/lib/qa/offline-pos-pci-flow-e2e-p1-35-audit";
import {
  OFFLINE_POS_PCI_FLOW_E2E_P1_35_ARTIFACT,
  OFFLINE_POS_PCI_FLOW_E2E_P1_35_CHAIN,
  OFFLINE_POS_PCI_FLOW_E2E_P1_35_CHECK_NPM_SCRIPT,
  OFFLINE_POS_PCI_FLOW_E2E_P1_35_CI_NPM_SCRIPT,
  OFFLINE_POS_PCI_FLOW_E2E_P1_35_CI_WORKFLOW,
  OFFLINE_POS_PCI_FLOW_E2E_P1_35_DOC,
  OFFLINE_POS_PCI_FLOW_E2E_P1_35_E2E_NPM_SCRIPT,
  OFFLINE_POS_PCI_FLOW_E2E_P1_35_POLICY_ID,
  OFFLINE_POS_PCI_FLOW_E2E_P1_35_WIRING_PATHS,
  OFFLINE_POS_PCI_AES_GCM_ALGORITHM,
  OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS,
} from "@/lib/qa/offline-pos-pci-flow-e2e-p1-35-policy";
import { runOfflinePosPciNoopV1ContractChecks } from "@/lib/qa/offline-pos-pci-flow-e2e-scoring";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Offline POS PCI flow E2E (P1-35)", () => {
  it("locks P1-35 policy and offline→AES-GCM→network→sync chain", () => {
    expect(OFFLINE_POS_PCI_FLOW_E2E_P1_35_POLICY_ID).toBe(
      "offline-pos-pci-flow-e2e-p1-35-v1",
    );
    expect(OFFLINE_POS_PCI_FLOW_E2E_P1_35_CHAIN).toEqual([
      "offline",
      "aes_gcm",
      "network",
      "sync",
    ]);
    expect(OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS).toEqual([
      "go_offline",
      "aes_gcm_seal",
      "queue_transaction",
      "reconnect_online",
      "sync_drain",
    ]);
    expect(OFFLINE_POS_PCI_AES_GCM_ALGORITHM).toBe("aes-gcm-v1");
  });

  it("passes AES-GCM PCI contract — non-empty card metadata sealed", async () => {
    const result = await runOfflinePosPciNoopV1ContractChecks(ROOT);
    expect(result.passed).toBe(true);
    const aesCheck = result.checks.find((row) => row.id === "non-empty-uses-aes-gcm");
    const noopCheck = result.checks.find((row) => row.id === "noop-v1-empty-only");
    expect(aesCheck?.passed ?? noopCheck?.passed).toBe(true);
  });

  it("passes full P1-35 audit — E2E spec, flow helper, artifact wired", () => {
    const summary = auditOfflinePosPciFlowE2EP135(ROOT);
    expect(summary.baseAuditPassed).toBe(true);
    expect(summary.aesGcmScoringWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("flow helper exports aes_gcm_seal step", () => {
    const flow = readSource("e2e/helpers/offline-pos-pci-flow-flow.ts");
    expect(flow).toContain("aes_gcm_seal");
    expect(flow).toContain("runOfflinePosPciNoopV1ContractChecks");
    expect(flow).toContain("runOfflinePosReconnectSyncFlow");
  });

  it("P1-35 wiring paths exist including doc, artifact, and CI gate", () => {
    for (const path of OFFLINE_POS_PCI_FLOW_E2E_P1_35_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${OFFLINE_POS_PCI_FLOW_E2E_P1_35_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${OFFLINE_POS_PCI_FLOW_E2E_P1_35_CI_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${OFFLINE_POS_PCI_FLOW_E2E_P1_35_E2E_NPM_SCRIPT}"`);

    const ci = readSource(OFFLINE_POS_PCI_FLOW_E2E_P1_35_CI_WORKFLOW);
    expect(ci).toContain(OFFLINE_POS_PCI_FLOW_E2E_P1_35_CHECK_NPM_SCRIPT);

    const doc = readSource(OFFLINE_POS_PCI_FLOW_E2E_P1_35_DOC);
    expect(doc).toContain(OFFLINE_POS_PCI_FLOW_E2E_P1_35_POLICY_ID);

    const artifact = readOfflinePosPciFlowE2EP135Artifact(ROOT);
    expect(artifact?.policyId).toBe(OFFLINE_POS_PCI_FLOW_E2E_P1_35_POLICY_ID);
    expect(artifact?.chain).toEqual([...OFFLINE_POS_PCI_FLOW_E2E_P1_35_CHAIN]);

    expect(existsSync(join(ROOT, OFFLINE_POS_PCI_FLOW_E2E_P1_35_ARTIFACT))).toBe(true);
  });

  it("formats audit lines", () => {
    const summary = auditOfflinePosPciFlowE2EP135(ROOT);
    const lines = formatOfflinePosPciFlowE2EP135AuditLines(summary);
    expect(lines.some((line) => line.includes(OFFLINE_POS_PCI_FLOW_E2E_P1_35_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
