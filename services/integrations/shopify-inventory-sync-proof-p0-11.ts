import type { PrismaClient } from "@prisma/client";
import { IntegrationProvider } from "@prisma/client";

import {
  SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_EXTERNAL_PRODUCT_ID,
  SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_EXTERNAL_VARIANT_ID,
  SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_SMOKE_SKU,
} from "@/lib/integrations/shopify-inventory-sync-proof-p0-11-policy";
import { ingestShopifyWebhookForSmoke } from "@/services/integrations/shopify-webhook-kds-smoke";

export type ShopifyInventoryProofFixture = {
  ok: boolean;
  productId: string | null;
  externalProductId: string;
  externalVariantId: string;
  initialQuantity: number;
  detail?: string;
};

export type ShopifyInventoryProofStep = {
  id: string;
  label: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  detail?: string;
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

/** Ensures mapped Shopify variant + kitchen stock for inventory proof smoke. */
export async function ensureShopifyInventoryProofFixture(input: {
  prisma: PrismaClient;
  userId: string;
  connectionId: string;
  initialQuantity?: number;
}): Promise<ShopifyInventoryProofFixture> {
  const initialQuantity = input.initialQuantity ?? 20;
  const externalProductId = SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_EXTERNAL_PRODUCT_ID;
  const externalVariantId = SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_EXTERNAL_VARIANT_ID;
  const sku = SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_SMOKE_SKU;

  let external = await input.prisma.externalProduct.findFirst({
    where: {
      connectionId: input.connectionId,
      provider: IntegrationProvider.SHOPIFY,
      sku,
      mappedProductId: { not: null },
    },
    select: { externalProductId: true, externalVariantId: true, mappedProductId: true },
  });

  if (!external) {
    external = await input.prisma.externalProduct.findFirst({
      where: {
        connectionId: input.connectionId,
        provider: IntegrationProvider.SHOPIFY,
        mappedProductId: { not: null },
      },
      select: { externalProductId: true, externalVariantId: true, mappedProductId: true },
      orderBy: { updatedAt: "desc" },
    });
    if (external) {
      await input.prisma.externalProduct.updateMany({
        where: {
          connectionId: input.connectionId,
          externalProductId: external.externalProductId,
          externalVariantId: external.externalVariantId,
        },
        data: { sku },
      });
    }
  }

  let productId = external?.mappedProductId ?? null;

  if (!productId) {
    const menu = await input.prisma.menu.findFirst({
      where: { userId: input.userId },
      select: { id: true },
      orderBy: { updatedAt: "desc" },
    });
    if (!menu) {
      return {
        ok: false,
        productId: null,
        externalProductId,
        externalVariantId,
        initialQuantity,
        detail: "No menu/product mapping available for Shopify inventory proof fixture",
      };
    }

    const product = await input.prisma.product.findFirst({
      where: { menuId: menu.id },
      select: { id: true },
      orderBy: { updatedAt: "desc" },
    });
    if (!product) {
      return {
        ok: false,
        productId: null,
        externalProductId,
        externalVariantId,
        initialQuantity,
        detail: "No catalog product found to map for Shopify inventory proof",
      };
    }

    productId = product.id;
    await input.prisma.externalProduct.upsert({
      where: {
        connectionId_externalProductId_externalVariantId: {
          connectionId: input.connectionId,
          externalProductId,
          externalVariantId,
        },
      },
      create: {
        userId: input.userId,
        connectionId: input.connectionId,
        provider: IntegrationProvider.SHOPIFY,
        externalProductId,
        externalVariantId,
        title: "Merchant proof salad",
        sku,
        mappedProductId: productId,
        rawPayloadJson: {
          smoke: true,
          variant: { inventory_item_id: 99001, inventory_quantity: initialQuantity },
        },
      },
      update: {
        sku,
        mappedProductId: productId,
      },
    });
  }

  const storefront = await input.prisma.storefrontSettings.findFirst({
    where: { userId: input.userId },
    select: { id: true },
    orderBy: { updatedAt: "desc" },
  });

  if (storefront) {
    await input.prisma.storefrontInventoryItem.upsert({
      where: {
        storefrontId_productId: { storefrontId: storefront.id, productId },
      },
      create: {
        userId: input.userId,
        storefrontId: storefront.id,
        productId,
        quantity: initialQuantity,
      },
      update: { quantity: initialQuantity },
    });
  } else {
    await input.prisma.product.update({
      where: { id: productId },
      data: { maxStorefrontQuantity: initialQuantity },
    });
  }

  return {
    ok: true,
    productId,
    externalProductId: external?.externalProductId ?? externalProductId,
    externalVariantId: external?.externalVariantId ?? externalVariantId,
    initialQuantity,
  };
}

export async function verifyShopifyOutboundInventoryAfterOrder(input: {
  prisma: PrismaClient;
  userId: string;
  productId: string;
  initialQuantity: number;
  orderedQuantity: number;
}): Promise<{ ok: boolean; quantity: number | null; detail: string }> {
  const expected = Math.max(0, input.initialQuantity - input.orderedQuantity);
  const quantity = await readKitchenQuantity(input.prisma, input.userId, input.productId);
  if (quantity == null) {
    return { ok: false, quantity: null, detail: "Kitchen quantity not found after orders/create" };
  }
  if (quantity !== expected) {
    return {
      ok: false,
      quantity,
      detail: `Expected kitchen qty ${expected}, got ${quantity}`,
    };
  }
  return {
    ok: true,
    quantity,
    detail: `Kitchen qty ${input.initialQuantity} → ${quantity} after orders/create`,
  };
}

export async function runShopifyInboundInventoryWebhookProof(input: {
  prisma: PrismaClient;
  userId: string;
  connectionId: string;
  productId: string;
  externalProductId: string;
  externalVariantId: string;
  targetQuantity: number;
}): Promise<{ ok: boolean; quantity: number | null; detail: string }> {
  const payload = {
    id: input.externalProductId,
    title: "Merchant proof salad",
    variants: [
      {
        id: input.externalVariantId,
        title: "Default",
        sku: SHOPIFY_INVENTORY_SYNC_PROOF_P0_11_SMOKE_SKU,
        inventory_quantity: input.targetQuantity,
        inventory_item_id: 99001,
      },
    ],
  };

  await ingestShopifyWebhookForSmoke({
    userId: input.userId,
    connectionId: input.connectionId,
    topic: "products/update",
    payload,
    webhookId: `smoke-inbound-inv-${Date.now()}`,
  });

  const quantity = await readKitchenQuantity(input.prisma, input.userId, input.productId);
  if (quantity !== input.targetQuantity) {
    return {
      ok: false,
      quantity,
      detail: `Inbound products/update expected ${input.targetQuantity}, got ${quantity ?? "null"}`,
    };
  }

  return {
    ok: true,
    quantity,
    detail: `products/update inventory_quantity=${input.targetQuantity} → kitchen qty ${quantity}`,
  };
}

export async function appendShopifyInventoryProofStepsAfterOrder(input: {
  prisma: PrismaClient;
  userId: string;
  connectionId: string;
  fixture: ShopifyInventoryProofFixture;
  orderedQuantity: number;
  steps: ShopifyInventoryProofStep[];
}): Promise<{ bidirectionalOk: boolean }> {
  if (!input.fixture.ok || !input.fixture.productId) {
    input.steps.push({
      id: "inventory_sync_bidirectional_complete",
      label: "Bi-directional inventory sync complete",
      status: "FAILED",
      detail: "Shopify inventory proof fixture missing",
    });
    return { bidirectionalOk: false };
  }

  const outbound = await verifyShopifyOutboundInventoryAfterOrder({
    prisma: input.prisma,
    userId: input.userId,
    productId: input.fixture.productId,
    initialQuantity: input.fixture.initialQuantity,
    orderedQuantity: input.orderedQuantity,
  });

  input.steps.push({
    id: "inventory_sync_outbound_kitchen",
    label: "Outbound inventory sync (orders/create → kitchen)",
    status: outbound.ok ? "PASSED" : "FAILED",
    detail: outbound.detail,
  });

  const inboundTarget = 11;
  const inbound = await runShopifyInboundInventoryWebhookProof({
    prisma: input.prisma,
    userId: input.userId,
    connectionId: input.connectionId,
    productId: input.fixture.productId,
    externalProductId: input.fixture.externalProductId,
    externalVariantId: input.fixture.externalVariantId,
    targetQuantity: inboundTarget,
  });

  input.steps.push({
    id: "inventory_sync_inbound_product_webhook",
    label: "Inbound inventory sync (products/update → kitchen)",
    status: inbound.ok ? "PASSED" : "FAILED",
    detail: inbound.detail,
  });

  const bidirectionalOk = outbound.ok && inbound.ok;
  input.steps.push({
    id: "inventory_sync_bidirectional_complete",
    label: "Bi-directional inventory sync complete",
    status: bidirectionalOk ? "PASSED" : "FAILED",
    detail: bidirectionalOk
      ? "Kitchen ↔ Shopify inventory: orders/create decrement + products/update pull"
      : "Outbound or inbound inventory proof failed",
  });

  return { bidirectionalOk };
}
