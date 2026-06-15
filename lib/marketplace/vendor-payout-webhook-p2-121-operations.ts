/**
 * Pure helpers for vendor payout webhook (Blueprint P2-121).
 */

import { VENDOR_PAYOUT_WEBHOOK_P2_121_POLICY_ID } from "@/lib/marketplace/vendor-payout-webhook-p2-121-policy";

export type PayoutWebhookCapabilityBlock = {
  id: string;
  label: string;
  status: "ready" | "partial" | "missing";
  summary: string;
  count: number;
};

export type VendorPayoutWebhookReport = {
  policyId: typeof VENDOR_PAYOUT_WEBHOOK_P2_121_POLICY_ID;
  connectReady: boolean;
  connectStatus: string;
  availableBalanceUsd: number;
  paidOutCount30d: number;
  webhookEventTypeCount: number;
  connectWebhookDeliveries30d: number;
  blocks: PayoutWebhookCapabilityBlock[];
  readinessScore: number;
};

function blockStatus(ready: boolean, count = 0): "ready" | "partial" | "missing" {
  if (ready) return "ready";
  if (count >= 1) return "partial";
  return "missing";
}

export function buildConnectOnboardingBlock(
  connectReady: boolean,
  connectStatus: string,
): PayoutWebhookCapabilityBlock {
  return {
    id: "connect-onboarding",
    label: "Connect onboarding",
    status: connectReady ? "ready" : connectStatus === "not_connected" ? "missing" : "partial",
    count: connectReady ? 1 : 0,
    summary: connectReady
      ? "Stripe Connect ready — payouts_enabled and details submitted"
      : `Connect status: ${connectStatus} — complete onboarding in vendor finance`,
  };
}

export function buildPaymentCaptureBlock(
  availableBalanceUsd: number,
  paidOutCount30d: number,
): PayoutWebhookCapabilityBlock {
  return {
    id: "payment-capture",
    label: "Payment capture",
    status: blockStatus(paidOutCount30d > 0 || availableBalanceUsd > 0, paidOutCount30d),
    count: paidOutCount30d,
    summary:
      availableBalanceUsd > 0 || paidOutCount30d > 0
        ? `$${availableBalanceUsd.toFixed(2)} available · ${paidOutCount30d} captured payout(s) (30d) — verify application_fee on checkout`
        : "No captured payments yet — funds release on payment_intent.succeeded webhook",
  };
}

export function buildPayoutTransferBlock(
  paidOutCount30d: number,
  availableBalanceUsd: number,
): PayoutWebhookCapabilityBlock {
  const status =
    paidOutCount30d >= 1
      ? "ready"
      : availableBalanceUsd > 0
        ? "partial"
        : "missing";
  return {
    id: "payout-transfer",
    label: "Payout transfer",
    status,
    count: paidOutCount30d,
    summary:
      paidOutCount30d > 0
        ? `${paidOutCount30d} transfer(s) (30d) — idempotency keys on vendorPayoutTransferKey`
        : availableBalanceUsd > 0
          ? `$${availableBalanceUsd.toFixed(2)} ready to transfer — request payout from vendor finance`
          : "No transfers yet — processPayout creates Stripe transfer to connected account",
  };
}

export function buildPayoutWebhookBlock(
  connectWebhookDeliveries30d: number,
  webhookEventTypeCount: number,
): PayoutWebhookCapabilityBlock {
  return {
    id: "payout-webhook",
    label: "Payout webhook",
    status: blockStatus(connectWebhookDeliveries30d >= 1, connectWebhookDeliveries30d),
    count: connectWebhookDeliveries30d,
    summary:
      connectWebhookDeliveries30d > 0
        ? `${connectWebhookDeliveries30d} Connect webhook delivery(ies) (30d) · ${webhookEventTypeCount} event types wired`
        : `${webhookEventTypeCount} event types configured — payout.paid dispatches payout_processed to vendor webhooks`,
  };
}

export function computePayoutWebhookReadinessScore(
  blocks: PayoutWebhookCapabilityBlock[],
): number {
  if (blocks.length === 0) return 0;
  const weights = { ready: 1, partial: 0.5, missing: 0 };
  const total = blocks.reduce((sum, block) => sum + weights[block.status], 0);
  return Math.round((total / blocks.length) * 100);
}

export function buildVendorPayoutWebhookReport(input: {
  connectReady?: boolean;
  connectStatus?: string;
  availableBalanceUsd?: number;
  paidOutCount30d?: number;
  webhookEventTypeCount?: number;
  connectWebhookDeliveries30d?: number;
}): VendorPayoutWebhookReport {
  const connectReady = input.connectReady ?? false;
  const connectStatus = input.connectStatus ?? "not_connected";
  const availableBalanceUsd = input.availableBalanceUsd ?? 0;
  const paidOutCount30d = input.paidOutCount30d ?? 0;
  const webhookEventTypeCount = input.webhookEventTypeCount ?? 0;
  const connectWebhookDeliveries30d = input.connectWebhookDeliveries30d ?? 0;

  const blocks = [
    buildConnectOnboardingBlock(connectReady, connectStatus),
    buildPaymentCaptureBlock(availableBalanceUsd, paidOutCount30d),
    buildPayoutTransferBlock(paidOutCount30d, availableBalanceUsd),
    buildPayoutWebhookBlock(connectWebhookDeliveries30d, webhookEventTypeCount),
  ];

  return {
    policyId: VENDOR_PAYOUT_WEBHOOK_P2_121_POLICY_ID,
    connectReady,
    connectStatus,
    availableBalanceUsd,
    paidOutCount30d,
    webhookEventTypeCount,
    connectWebhookDeliveries30d,
    blocks,
    readinessScore: computePayoutWebhookReadinessScore(blocks),
  };
}

export function buildVendorPayoutWebhookDemoReport(): VendorPayoutWebhookReport {
  return buildVendorPayoutWebhookReport({
    connectReady: true,
    connectStatus: "ready",
    availableBalanceUsd: 1240.5,
    paidOutCount30d: 8,
    webhookEventTypeCount: 10,
    connectWebhookDeliveries30d: 42,
  });
}

export function hasActivePayoutFlow(report: VendorPayoutWebhookReport): boolean {
  return report.connectReady || report.paidOutCount30d > 0 || report.availableBalanceUsd > 0;
}
