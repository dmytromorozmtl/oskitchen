import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditOfflinePosPciFlowE2E } from "@/lib/qa/offline-pos-pci-flow-e2e-audit";
import {
  OFFLINE_POS_PCI_FLOW_E2E_P1_35_ARTIFACT,
  OFFLINE_POS_PCI_FLOW_E2E_P1_35_CHAIN,
  OFFLINE_POS_PCI_FLOW_E2E_P1_35_POLICY_ID,
} from "@/lib/qa/offline-pos-pci-flow-e2e-p1-35-policy";
import {
  OFFLINE_POS_PCI_AES_GCM_ALGORITHM,
  OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS,
} from "@/lib/qa/offline-pos-pci-flow-e2e-policy";

export type OfflinePosPciFlowE2EP135AuditSummary = {
  policyId: typeof OFFLINE_POS_PCI_FLOW_E2E_P1_35_POLICY_ID;
  flowSteps: readonly string[];
  chain: readonly string[];
  aesGcmAlgorithm: string;
  baseAuditPassed: boolean;
  aesGcmScoringWired: boolean;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditOfflinePosPciFlowE2EP135(
  root = process.cwd(),
): OfflinePosPciFlowE2EP135AuditSummary {
  const base = auditOfflinePosPciFlowE2E(root);
  const artifactPresent = existsSync(join(root, OFFLINE_POS_PCI_FLOW_E2E_P1_35_ARTIFACT));

  const flowStepsMatch =
    OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS[0] === "go_offline" &&
    OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS[1] === "aes_gcm_seal" &&
    OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS.at(-1) === "sync_drain";

  const passed =
    base.passed &&
    base.aesGcmScoringWired &&
    flowStepsMatch &&
    artifactPresent &&
    OFFLINE_POS_PCI_FLOW_E2E_P1_35_CHAIN.length === 4;

  return {
    policyId: OFFLINE_POS_PCI_FLOW_E2E_P1_35_POLICY_ID,
    flowSteps: OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS,
    chain: OFFLINE_POS_PCI_FLOW_E2E_P1_35_CHAIN,
    aesGcmAlgorithm: OFFLINE_POS_PCI_AES_GCM_ALGORITHM,
    baseAuditPassed: base.passed,
    aesGcmScoringWired: base.aesGcmScoringWired,
    artifactPresent,
    passed,
  };
}

export function formatOfflinePosPciFlowE2EP135AuditLines(
  summary: OfflinePosPciFlowE2EP135AuditSummary,
): string[] {
  return [
    `Offline POS PCI flow E2E (P1-35) audit (${summary.policyId})`,
    `Chain: ${summary.chain.join(" → ")}`,
    `Flow steps: ${summary.flowSteps.join(" → ")}`,
    `AES-GCM algorithm: ${summary.aesGcmAlgorithm}`,
    `Base E2E audit: ${summary.baseAuditPassed ? "passed" : "failed"}`,
    `AES-GCM scoring wired: ${summary.aesGcmScoringWired ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}

export function readOfflinePosPciFlowE2EP135Artifact(root = process.cwd()): {
  policyId: string;
  chain: string[];
  flowSteps: string[];
} | null {
  const path = join(root, OFFLINE_POS_PCI_FLOW_E2E_P1_35_ARTIFACT);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as {
    policyId: string;
    chain: string[];
    flowSteps: string[];
  };
}
