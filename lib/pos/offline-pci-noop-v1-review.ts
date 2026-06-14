/**
 * P1-31 — noop-v1 fallback review for offline POS PCI sealing.
 *
 * noop-v1 is permitted only for empty plaintext. Non-empty PCI-adjacent fields
 * require aes-gcm-v1 or the queue is blocked via assertOfflinePciEncryptionAvailable.
 *
 * @see docs/offline-pos-full-mode-p1-31.md
 * @see docs/offline-pos-pci-review.md
 */

import type { OfflinePciSealedBlob } from "@/lib/pos/offline-pci-local-encryption";

export const OFFLINE_PCI_NOOP_V1_REVIEW_POLICY_ID =
  "offline-pci-noop-v1-review-p1-31-v1" as const;

/** Legacy unseal path — migration only; new seals must use aes-gcm-v1. */
export const OFFLINE_PCI_NOOP_V1_LEGACY_UNSEAL_ALLOWED = true as const;

export function isNoopV1EmptyBlob(blob: OfflinePciSealedBlob): boolean {
  return blob.algorithm === "noop-v1" && blob.sealed === "";
}

export function auditNoopV1FallbackPolicy(source: string): {
  passed: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  if (source.includes("btoa(trimmed)")) {
    failures.push("insecure noop-v1 btoa(trimmed) plaintext fallback must not exist");
  }
  if (!source.includes('algorithm: "noop-v1"')) {
    failures.push('noop-v1 algorithm marker missing — empty-field sentinel required');
  }
  if (!source.includes("assertOfflinePciEncryptionAvailable")) {
    failures.push("assertOfflinePciEncryptionAvailable gate missing for non-empty seals");
  }
  if (!source.includes("canQueueOfflineCardCapture")) {
    failures.push("canQueueOfflineCardCapture gate missing");
  }

  const sealFn = source.slice(
    source.indexOf("export async function sealOfflinePciField"),
    source.indexOf("export async function unsealOfflinePciField"),
  );
  if (!sealFn.includes('if (!trimmed)')) {
    failures.push("sealOfflinePciField must short-circuit empty plaintext to noop-v1");
  }
  if (!sealFn.includes("assertOfflinePciEncryptionAvailable()")) {
    failures.push("sealOfflinePciField must assert encryption before sealing non-empty values");
  }

  return { passed: failures.length === 0, failures };
}
