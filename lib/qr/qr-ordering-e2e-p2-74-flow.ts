import { qrScanEntryPath } from "@/lib/qa/qr-scan-storefront-kds-e2e-policy";
import { isQrScanDeepLinkPath } from "@/lib/qr/qr-scan-guest-kitchen-e2e-policy";

export type QrOrderChainSim = {
  storeSlug: string;
  tableRouteId: string;
  scanPath: string | null;
  orderId: string | null;
  webhookEventId: string | null;
  kitchenTaskId: string | null;
  kdsVisible: boolean;
  lineCount: number;
};

export type QrOrderChainStepResult =
  | { ok: true; chain: QrOrderChainSim }
  | { ok: false; chain: QrOrderChainSim; error: string; failedStep: string };

function baseChain(storeSlug: string, tableRouteId: string): QrOrderChainSim {
  return {
    storeSlug,
    tableRouteId,
    scanPath: null,
    orderId: null,
    webhookEventId: null,
    kitchenTaskId: null,
    kdsVisible: false,
    lineCount: 0,
  };
}

export function simulateQrScan(
  storeSlug: string,
  tableRouteId: string,
): QrOrderChainStepResult {
  const chain = baseChain(storeSlug, tableRouteId);
  const scanPath = qrScanEntryPath(storeSlug, tableRouteId);
  if (!isQrScanDeepLinkPath(scanPath)) {
    return { ok: false, chain, error: "Invalid QR scan path", failedStep: "qr_scan" };
  }
  return { ok: true, chain: { ...chain, scanPath } };
}

export function simulateQrCheckout(
  chain: QrOrderChainSim,
  lineCount: number,
): QrOrderChainStepResult {
  if (!chain.scanPath) {
    return { ok: false, chain, error: "Scan required before checkout", failedStep: "storefront_checkout" };
  }
  if (lineCount <= 0) {
    return { ok: false, chain, error: "Cart is empty", failedStep: "storefront_checkout" };
  }
  const orderId = `qr-order-${chain.storeSlug}-${chain.tableRouteId}-${lineCount}`;
  return {
    ok: true,
    chain: { ...chain, orderId, lineCount },
  };
}

export function simulateWebhookEvent(chain: QrOrderChainSim): QrOrderChainStepResult {
  if (!chain.orderId) {
    return { ok: false, chain, error: "Order required for webhook", failedStep: "webhook_event" };
  }
  return {
    ok: true,
    chain: { ...chain, webhookEventId: `wh-${chain.orderId}` },
  };
}

export function simulateKitchenTask(chain: QrOrderChainSim): QrOrderChainStepResult {
  if (!chain.webhookEventId) {
    return { ok: false, chain, error: "Webhook required for KitchenTask", failedStep: "kitchen_task" };
  }
  return {
    ok: true,
    chain: { ...chain, kitchenTaskId: `kt-${chain.orderId}` },
  };
}

export function simulateKdsTicket(chain: QrOrderChainSim): QrOrderChainStepResult {
  if (!chain.kitchenTaskId) {
    return { ok: false, chain, error: "KitchenTask required for KDS", failedStep: "kds_ticket" };
  }
  return {
    ok: true,
    chain: { ...chain, kdsVisible: true },
  };
}

/** Run full QR ordering E2E chain in memory. */
export function runQrOrderingE2EChain(
  storeSlug: string,
  tableRouteId: string,
  lineCount: number,
): QrOrderChainStepResult {
  const scan = simulateQrScan(storeSlug, tableRouteId);
  if (!scan.ok) return scan;

  const checkout = simulateQrCheckout(scan.chain, lineCount);
  if (!checkout.ok) return checkout;

  const webhook = simulateWebhookEvent(checkout.chain);
  if (!webhook.ok) return webhook;

  const task = simulateKitchenTask(webhook.chain);
  if (!task.ok) return task;

  return simulateKdsTicket(task.chain);
}
