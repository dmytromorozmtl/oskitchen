import { readFileSync } from "node:fs";
import { join } from "node:path";

import { auditOfflinePosPciEncryptionHardening } from "@/lib/pos/offline-pos-pci-review-policy";
import {
  OfflinePciEncryptionUnavailableError,
  isOfflinePciStorageAvailable,
  sealOfflinePciField,
} from "@/lib/pos/offline-pci-local-encryption";
import {
  OFFLINE_POS_PCI_AES_GCM_ALGORITHM,
  OFFLINE_POS_PCI_NOOP_V1_ALGORITHM,
  isNoopV1EmptyOnly,
} from "@/lib/qa/offline-pos-pci-flow-e2e-policy";
import {
  describePosPaymentBlockReason,
  posPaymentAllowedWhileOffline,
} from "@/services/pos/pos-payment-service";

export type OfflinePosPciNoopV1Check = {
  id: string;
  passed: boolean;
  detail: string;
};

export type OfflinePosPciNoopV1ContractResult = {
  checkCount: number;
  passedCount: number;
  passed: boolean;
  checks: OfflinePosPciNoopV1Check[];
};

export async function runOfflinePosPciNoopV1ContractChecks(
  root = process.cwd(),
): Promise<OfflinePosPciNoopV1ContractResult> {
  const checks: OfflinePosPciNoopV1Check[] = [];

  const encryptionSource = readFileSync(
    join(root, "lib/pos/offline-pci-local-encryption.ts"),
    "utf8",
  );
  const hardening = auditOfflinePosPciEncryptionHardening(encryptionSource);
  checks.push({
    id: "static-no-insecure-btoa-fallback",
    passed: hardening.passed,
    detail: hardening.passed
      ? "noop-v1 btoa plaintext fallback removed"
      : hardening.failures.join("; "),
  });

  const emptySeal = await sealOfflinePciField("");
  checks.push({
    id: "noop-v1-empty-only",
    passed: isNoopV1EmptyOnly(emptySeal.algorithm, emptySeal.sealed, ""),
    detail: `empty → ${emptySeal.algorithm}`,
  });

  if (isOfflinePciStorageAvailable()) {
    const cardMeta = await sealOfflinePciField("4242");
    checks.push({
      id: "non-empty-uses-aes-gcm",
      passed: cardMeta.algorithm === OFFLINE_POS_PCI_AES_GCM_ALGORITHM,
      detail: `last4 → ${cardMeta.algorithm}`,
    });
  } else {
    try {
      await sealOfflinePciField("4242");
      checks.push({
        id: "non-empty-blocks-without-crypto",
        passed: false,
        detail: "expected OfflinePciEncryptionUnavailableError",
      });
    } catch (error) {
      checks.push({
        id: "non-empty-blocks-without-crypto",
        passed: error instanceof OfflinePciEncryptionUnavailableError,
        detail:
          error instanceof OfflinePciEncryptionUnavailableError
            ? "OfflinePciEncryptionUnavailableError thrown"
            : String(error),
      });
    }
  }

  checks.push({
    id: "offline-card-blocked-without-encryption",
    passed:
      !posPaymentAllowedWhileOffline("OFFLINE_CARD_QUEUED") &&
      posPaymentAllowedWhileOffline("OFFLINE_CARD_QUEUED", {
        offlinePciEncryptionAvailable: true,
      }) &&
      describePosPaymentBlockReason("OFFLINE_CARD_QUEUED").includes("Web Crypto"),
    detail: "OFFLINE_CARD_QUEUED gated on device encryption",
  });

  checks.push({
    id: "noop-v1-not-used-for-card-data",
    passed: !encryptionSource.includes("btoa(trimmed)"),
    detail: `noop-v1 algorithm constant: ${OFFLINE_POS_PCI_NOOP_V1_ALGORITHM}`,
  });

  const passedCount = checks.filter((row) => row.passed).length;

  return {
    checkCount: checks.length,
    passedCount,
    passed: passedCount === checks.length && checks.length > 0,
    checks,
  };
}
