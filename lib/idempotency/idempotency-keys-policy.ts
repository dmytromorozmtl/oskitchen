/**
 * P1-32 — idempotency keys for webhook processing, payment capture, payout requests.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const IDEMPOTENCY_KEYS_POLICY_ID = "idempotency-keys-p1-32-v1" as const;

export type IdempotencySurface = "webhook" | "payment_capture" | "payout";

export type IdempotencyKeyEntry = {
  surface: IdempotencySurface;
  servicePath: string;
  wiringPattern: RegExp;
};

export const IDEMPOTENCY_KEY_REGISTRY: readonly IdempotencyKeyEntry[] = [
  {
    surface: "webhook",
    servicePath: "lib/webhooks/webhook-event-store.ts",
    wiringPattern: /webhookProcessingKey|connectionId_externalEventId/,
  },
  {
    surface: "payment_capture",
    servicePath: "services/marketplace/checkout-service.ts",
    wiringPattern: /marketplacePaymentIntentKey|stripeIdempotencyRequestOptions/,
  },
  {
    surface: "payment_capture",
    servicePath: "services/marketplace/stripe-connect-service.ts",
    wiringPattern: /marketplacePaymentIntentKey|marketplacePaymentCaptureKey|stripeIdempotencyRequestOptions/,
  },
  {
    surface: "payment_capture",
    servicePath: "services/payments/stripe-terminal-service.ts",
    wiringPattern: /posTerminalPaymentIntentKey|stripeIdempotencyRequestOptions/,
  },
  {
    surface: "payout",
    servicePath: "services/marketplace/instant-payouts-service.ts",
    wiringPattern: /buildStablePayoutId|vendorInstantPayoutTransferKey|vendorInstantPayoutDebitKey/,
  },
  {
    surface: "payout",
    servicePath: "services/marketplace/stripe-connect-service.ts",
    wiringPattern: /buildStablePayoutId|vendorPayoutTransferKey/,
  },
  {
    surface: "payout",
    servicePath: "services/marketplace/vendor-finance-service.ts",
    wiringPattern: /buildStablePayoutId/,
  },
  {
    surface: "payment_capture",
    servicePath: "services/pos/pos-refund-service.ts",
    wiringPattern: /posRefundIdempotencyKey/,
  },
  {
    surface: "payment_capture",
    servicePath: "services/pos/pos-checkout-service.ts",
    wiringPattern: /posCheckoutIdempotencyKey/,
  },
  {
    surface: "payment_capture",
    servicePath: "services/pos/pos-void-service.ts",
    wiringPattern: /posVoidIdempotencyKey/,
  },
] as const;

export const IDEMPOTENCY_KEYS_CI_SCRIPTS = ["test:ci:idempotency-keys"] as const;

export type IdempotencyKeyAuditReport = {
  policyId: typeof IDEMPOTENCY_KEYS_POLICY_ID;
  entry: IdempotencyKeyEntry;
  servicePresent: boolean;
  wired: boolean;
  passed: boolean;
};

export function auditIdempotencyEntry(
  entry: IdempotencyKeyEntry,
  root = process.cwd(),
): IdempotencyKeyAuditReport {
  const absPath = join(root, entry.servicePath);
  const servicePresent = existsSync(absPath);
  let wired = false;
  if (servicePresent) {
    const source = readFileSync(absPath, "utf8");
    wired = entry.wiringPattern.test(source);
  }
  return {
    policyId: IDEMPOTENCY_KEYS_POLICY_ID,
    entry,
    servicePresent,
    wired,
    passed: servicePresent && wired,
  };
}

export function auditAllIdempotencyKeys(root = process.cwd()): {
  policyId: typeof IDEMPOTENCY_KEYS_POLICY_ID;
  reports: IdempotencyKeyAuditReport[];
  passed: boolean;
} {
  const reports = IDEMPOTENCY_KEY_REGISTRY.map((entry) => auditIdempotencyEntry(entry, root));
  return {
    policyId: IDEMPOTENCY_KEYS_POLICY_ID,
    reports,
    passed: reports.every((report) => report.passed),
  };
}
