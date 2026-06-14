import type { PrismaClient } from "@prisma/client";

import {
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_INVENTORY_ITEM_ID,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_LATENCY_BUDGET_MS,
  SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_WEBHOOK_TOPIC,
} from "@/lib/integrations/shopify-realtime-inventory-sync-proof-p1-32-policy";
import {
  ensureShopifyInventoryProofFixture,
  type ShopifyInventoryProofFixture,
} from "@/services/integrations/shopify-inventory-sync-proof-p0-11";
import { ingestShopifyWebhookForSmoke } from "@/services/integrations/shopify-webhook-kds-smoke";

export type ShopifyRealtimeInventoryProofStep = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  detail?: string;
  latencyMs?: number;
};

async function readKitchenQuantity(
  prisma: PrismaClient,
  userId: string,
  productId: string,
): Promise<number | null> {
  const item = await prisma.storefrontInventoryItem.findFirst({
    where: { productId, userId },
    select: { quantity: true },
    orderBy: { updatedAt: "desc" },
  });
  if (item) return item.quantity;
  const product = await prisma.product.findFirst({
    where: { id: productId },
    select: { maxStorefrontQuantity: true },
  });
  return product?.maxStorefrontQuantity ?? null;
}

export async function runShopifyRealtimeInventoryLevelWebhookProof(input: {
  prisma: PrismaClient;
  userId: string;
  connectionId: string;
  productId: string;
  targetQuantity: number;
  inventoryItemId?: string;
  locationId?: string;
}): Promise<{ ok: boolean; quantity: number | null; latencyMs: number; detail: string }> {
  const inventoryItemId =
    input.inventoryItemId ?? SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_INVENTORY_ITEM_ID;
  const locationId = input.locationId ?? "1";
  const started = Date.now();

  await ingestShopifyWebhookForSmoke({
    userId: input.userId,
    connectionId: input.connectionId,
    topic: SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_WEBHOOK_TOPIC,
    payload: {
      inventory_item_id: Number(inventoryItemId),
      location_id: Number(locationId),
      available: input.targetQuantity,
      updated_at: new Date().toISOString(),
    },
    webhookId: `smoke-realtime-inv-${Date.now()}`,
  });

  const quantity = await readKitchenQuantity(input.prisma, input.userId, input.productId);
  const latencyMs = Date.now() - started;

  if (quantity !== input.targetQuantity) {
    return {
      ok: false,
      quantity,
      latencyMs,
      detail: `inventory_levels/update expected ${input.targetQuantity}, got ${quantity ?? "null"} in ${latencyMs}ms`,
    };
  }

  const withinBudget = latencyMs <= SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_LATENCY_BUDGET_MS;
  return {
    ok: withinBudget,
    quantity,
    latencyMs,
    detail: withinBudget
      ? `Kitchen qty ${quantity} updated in ${latencyMs}ms (≤${SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_LATENCY_BUDGET_MS}ms)`
      : `Kitchen qty correct but latency ${latencyMs}ms exceeds ${SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_LATENCY_BUDGET_MS}ms budget`,
  };
}

export async function appendShopifyRealtimeInventoryProofSteps(input: {
  prisma: PrismaClient;
  userId: string;
  connectionId: string;
  steps: ShopifyRealtimeInventoryProofStep[];
}): Promise<{ realtimeOk: boolean; fixture: ShopifyInventoryProofFixture }> {
  const fixture = await ensureShopifyInventoryProofFixture({
    prisma: input.prisma,
    userId: input.userId,
    connectionId: input.connectionId,
    initialQuantity: 20,
  });

  input.steps.push({
    id: "realtime_inventory_fixture",
    label: "Real-time inventory proof fixture",
    status: fixture.ok ? "PASSED" : "FAILED",
    detail: fixture.ok
      ? `Mapped product ${fixture.productId} · inventory_item ${SHOPIFY_REALTIME_INVENTORY_SYNC_PROOF_P1_32_INVENTORY_ITEM_ID}`
      : fixture.detail,
  });

  if (!fixture.ok || !fixture.productId) {
    input.steps.push({
      id: "inventory_levels_update_webhook",
      label: "inventory_levels/update webhook ingest",
      status: "SKIPPED",
      detail: "Fixture missing",
    });
    input.steps.push({
      id: "kitchen_qty_updated_within_budget",
      label: "Kitchen qty updated within latency budget",
      status: "SKIPPED",
    });
    input.steps.push({
      id: "realtime_sync_complete",
      label: "Real-time inventory sync complete",
      status: "FAILED",
    });
    return { realtimeOk: false, fixture };
  }

  const targetQuantity = 14;
  const proof = await runShopifyRealtimeInventoryLevelWebhookProof({
    prisma: input.prisma,
    userId: input.userId,
    connectionId: input.connectionId,
    productId: fixture.productId,
    targetQuantity,
  });

  input.steps.push({
    id: "inventory_levels_update_webhook",
    label: "inventory_levels/update webhook ingest",
    status: proof.quantity === targetQuantity ? "PASSED" : "FAILED",
    detail: proof.detail,
    latencyMs: proof.latencyMs,
  });

  input.steps.push({
    id: "kitchen_qty_updated_within_budget",
    label: "Kitchen qty updated within latency budget",
    status: proof.ok ? "PASSED" : "FAILED",
    detail: proof.detail,
    latencyMs: proof.latencyMs,
  });

  const realtimeOk = proof.ok;
  input.steps.push({
    id: "realtime_sync_complete",
    label: "Real-time inventory sync complete",
    status: realtimeOk ? "PASSED" : "FAILED",
    detail: realtimeOk
      ? `inventory_levels/update → kitchen qty ${targetQuantity} in ${proof.latencyMs}ms`
      : "Real-time inventory proof failed",
  });

  return { realtimeOk, fixture };
}
