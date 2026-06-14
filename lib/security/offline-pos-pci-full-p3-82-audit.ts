import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditOfflinePosPciNoopV1P244 } from "@/lib/security/offline-pos-pci-noop-v1-p2-44-audit";
import {
  OFFLINE_POS_PCI_FULL_P3_82_AES_GCM_ALGORITHM,
  OFFLINE_POS_PCI_FULL_P3_82_ARTIFACT,
  OFFLINE_POS_PCI_FULL_P3_82_DOC,
  OFFLINE_POS_PCI_FULL_P3_82_ENCRYPTION_MODULE,
  OFFLINE_POS_PCI_FULL_P3_82_POLICY_ID,
  OFFLINE_POS_PCI_FULL_P3_82_QSA_CHECKLIST,
  OFFLINE_POS_PCI_FULL_P3_82_QSA_INTRO,
  OFFLINE_POS_PCI_FULL_P3_82_SIGNOFF_STATUS,
  OFFLINE_POS_PCI_FULL_P3_82_UPSTREAM,
  OFFLINE_POS_PCI_FULL_P3_82_WIRING_PATHS,
} from "@/lib/security/offline-pos-pci-full-p3-82-policy";
import { runOfflinePosPciFullBenchmarkP382 } from "@/lib/security/offline-pos-pci-full-p3-82-scoring";

export type OfflinePosPciFullP382AuditSummary = {
  policyId: typeof OFFLINE_POS_PCI_FULL_P3_82_POLICY_ID;
  wiringComplete: boolean;
  fullReviewDocComplete: boolean;
  aesGcmImplementationPassed: boolean;
  upstreamP244Passed: boolean;
  upstreamP135E2EChainWired: boolean;
  qsaSignoffArtifactComplete: boolean;
  pciReviewDocCrossLinked: boolean;
  scoringPassed: boolean;
  passPct: number;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditAesGcmImplementation(source: string): {
  passed: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  if (!source.includes('"AES-GCM"')) {
    failures.push("AES-GCM cipher name missing");
  }
  if (!source.includes(OFFLINE_POS_PCI_FULL_P3_82_AES_GCM_ALGORITHM)) {
    failures.push(`${OFFLINE_POS_PCI_FULL_P3_82_AES_GCM_ALGORITHM} algorithm marker missing`);
  }
  if (!source.includes("getRandomValues(new Uint8Array(12))")) {
    failures.push("12-byte random IV missing");
  }
  if (!source.includes("getRandomValues(new Uint8Array(32))")) {
    failures.push("32-byte device-local key missing");
  }
  if (!source.includes("kitchenos-offline-pci-keys")) {
    failures.push("IndexedDB key store missing");
  }
  if (source.includes("btoa(trimmed)")) {
    failures.push("insecure btoa plaintext fallback must not exist");
  }
  if (!source.includes("assertOfflinePciEncryptionAvailable")) {
    failures.push("assertOfflinePciEncryptionAvailable gate missing");
  }

  return { passed: failures.length === 0, failures };
}

export function auditOfflinePosPciFullP382(root = process.cwd()): OfflinePosPciFullP382AuditSummary {
  const wiringComplete = OFFLINE_POS_PCI_FULL_P3_82_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  const docPath = join(root, OFFLINE_POS_PCI_FULL_P3_82_DOC);
  const doc = existsSync(docPath) ? readFileSync(docPath, "utf8") : "";
  const fullReviewDocComplete =
    doc.includes(OFFLINE_POS_PCI_FULL_P3_82_POLICY_ID) &&
    OFFLINE_POS_PCI_FULL_P3_82_QSA_CHECKLIST.every((item) => doc.includes(item)) &&
    doc.includes(OFFLINE_POS_PCI_FULL_P3_82_SIGNOFF_STATUS) &&
    /AES-GCM/i.test(doc);

  const encryptionSource = readFileSync(
    join(root, OFFLINE_POS_PCI_FULL_P3_82_ENCRYPTION_MODULE),
    "utf8",
  );
  const aesGcm = auditAesGcmImplementation(encryptionSource);
  const aesGcmImplementationPassed = aesGcm.passed;

  const upstreamP244Passed = auditOfflinePosPciNoopV1P244(root).passed;

  const p135DocPath = join(root, "docs/offline-pos-pci-flow-e2e-p1-35.md");
  const p135Doc = existsSync(p135DocPath) ? readFileSync(p135DocPath, "utf8") : "";
  const p135DocLower = p135Doc.toLowerCase();
  const upstreamP135E2EChainWired =
    p135DocLower.includes("offline") &&
    (p135DocLower.includes("aes_gcm") || p135DocLower.includes("aes-gcm")) &&
    (p135DocLower.includes("network") || p135DocLower.includes("reconnect")) &&
    p135DocLower.includes("sync") &&
    existsSync(join(root, "artifacts/offline-pos-pci-flow-e2e-p1-35.json"));

  let qsaSignoffArtifactComplete = false;
  const artifactPath = join(root, OFFLINE_POS_PCI_FULL_P3_82_ARTIFACT);
  if (existsSync(artifactPath)) {
    const artifact = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      policyId?: string;
      signoffStatus?: string;
      aesGcmAlgorithm?: string;
      qsaIntroDate?: string;
      engineeringReviewPassed?: boolean;
      externalQsaPending?: boolean;
      productionCardClaimsBlocked?: boolean;
    };
    qsaSignoffArtifactComplete =
      artifact.policyId === OFFLINE_POS_PCI_FULL_P3_82_POLICY_ID &&
      artifact.signoffStatus === OFFLINE_POS_PCI_FULL_P3_82_SIGNOFF_STATUS &&
      artifact.aesGcmAlgorithm === OFFLINE_POS_PCI_FULL_P3_82_AES_GCM_ALGORITHM &&
      artifact.qsaIntroDate === OFFLINE_POS_PCI_FULL_P3_82_QSA_INTRO &&
      artifact.engineeringReviewPassed === true &&
      artifact.externalQsaPending === true &&
      artifact.productionCardClaimsBlocked === true;
  }

  const pciReviewPath = join(root, "docs/offline-pos-pci-review.md");
  const pciReviewDocCrossLinked =
    existsSync(pciReviewPath) &&
    readFileSync(pciReviewPath, "utf8").includes(OFFLINE_POS_PCI_FULL_P3_82_POLICY_ID);

  const upstreamPresent = OFFLINE_POS_PCI_FULL_P3_82_UPSTREAM.every((rel) =>
    existsSync(join(root, rel)),
  );

  const benchmark = runOfflinePosPciFullBenchmarkP382({
    fullReviewDocComplete,
    aesGcmImplementationPassed,
    upstreamP244Passed,
    upstreamP135E2EChainWired: upstreamP135E2EChainWired && upstreamPresent,
    qsaSignoffArtifactComplete,
    pciReviewDocCrossLinked,
  });

  const artifactPresent = existsSync(artifactPath);
  const passed = wiringComplete && benchmark.passed && artifactPresent;

  return {
    policyId: OFFLINE_POS_PCI_FULL_P3_82_POLICY_ID,
    wiringComplete,
    fullReviewDocComplete,
    aesGcmImplementationPassed,
    upstreamP244Passed,
    upstreamP135E2EChainWired,
    qsaSignoffArtifactComplete,
    pciReviewDocCrossLinked,
    scoringPassed: benchmark.passed,
    passPct: benchmark.passPct,
    artifactPresent,
    passed,
  };
}

export function formatOfflinePosPciFullP382AuditLines(
  summary: OfflinePosPciFullP382AuditSummary,
): string[] {
  return [
    `Offline POS PCI full review (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Full review doc: ${summary.fullReviewDocComplete ? "yes" : "no"}`,
    `AES-GCM implementation: ${summary.aesGcmImplementationPassed ? "passed" : "failed"}`,
    `Upstream P2-44: ${summary.upstreamP244Passed ? "passed" : "failed"}`,
    `Upstream P1-35 E2E: ${summary.upstreamP135E2EChainWired ? "wired" : "missing"}`,
    `QSA sign-off artifact: ${summary.qsaSignoffArtifactComplete ? "complete" : "incomplete"}`,
    `PCI review cross-link: ${summary.pciReviewDocCrossLinked ? "yes" : "no"}`,
    `Benchmark: ${summary.passPct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
