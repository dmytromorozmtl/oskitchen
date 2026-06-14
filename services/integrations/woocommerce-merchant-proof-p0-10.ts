import type { PrismaClient } from "@prisma/client";
import { IntegrationProvider } from "@prisma/client";

import {
  WOOCOMMERCE_MERCHANT_PROOF_P0_10_EXTERNAL_PRODUCT_ID,
  WOOCOMMERCE_MERCHANT_PROOF_P0_10_SMOKE_SKU,
} from "@/lib/integrations/woocommerce-merchant-proof-p0-10-policy";
import { ingestWooCommerceWebhookForSmoke } from "@/services/integrations/woocommerce-webhook-kds-smoke";

export type MerchantProofInventoryFixture = {
  ok: boolean;
  productId: string | null;
  externalProductId: string;
  initialQuantity: number;
  detail?: string;
};

export type MerchantProofInventoryStep = {
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

/** Ensures mapped Woo product + kitchen stock for merchant proof smoke. */
export async function ensureMerchantProofInventoryFixture(input: {
  prisma: PrismaClient;
  userId: string;
  connectionId: string;
  initialQuantity?: number;
}): Promise<MerchantProofInventoryFixture> {
  const initialQuantity = input.initialQuantity ?? 20;
  const externalProductId = WOOCOMMERCE_MERCHANT_PROOF_P0_10_EXTERNAL_PRODUCT_ID;
  const sku = WOOCOMMERCE_MERCHANT_PROOF_P0_10_SMOKE_SKU;

  let external = await input.prisma.externalProduct.findFirst({
    where: {
      connectionId: input.connectionId,
      provider: IntegrationProvider.WOOCOMMERCE,
      sku,
      mappedProductId: { not: null },
    },
    select: { externalProductId: true, mappedProductId: true },
  });

  if (!external) {
    external = await input.prisma.externalProduct.findFirst({
      where: {
        connectionId: input.connectionId,
        provider: IntegrationProvider.WOOCOMMERCE,
        mappedProductId: { not: null },
      },
      select: { externalProductId: true, mappedProductId: true },
      orderBy: { updatedAt: "desc" },
    });
    if (external) {
      await input.prisma.externalProduct.updateMany({
        where: {
          connectionId: input.connectionId,
          externalProductId: external.externalProductId,
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
        initialQuantity,
        detail: "No menu/product mapping available for merchant proof fixture",
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
        initialQuantity,
        detail: "No catalog product found to map for merchant proof",
      };
    }

    productId = product.id;
    await input.prisma.externalProduct.upsert({
      where: {
        connectionId_externalProductId_externalVariantId: {
          connectionId: input.connectionId,
          externalProductId,
          externalVariantId: "",
        },
      },
      create: {
        userId: input.userId,
        connectionId: input.connectionId,
        provider: IntegrationProvider.WOOCOMMERCE,
        externalProductId,
        externalVariantId: "",
        title: "Merchant proof bowl",
        sku,
        mappedProductId: productId,
        rawPayloadJson: { smoke: true },
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
    initialQuantity,
  };
}

export async function verifyOutboundInventoryAfterOrder(input: {
  prisma: PrismaClient;
  userId: string;
  productId: string;
  initialQuantity: number;
  orderedQuantity: number;
}): Promise<{ ok: boolean; quantity: number | null; detail: string }> {
  const expected = Math.max(0, input.initialQuantity - input.orderedQuantity);
  const quantity = await readKitchenQuantity(input.prisma, input.userId, input.productId);
  if (quantity == null) {
    return { ok: false, quantity: null, detail: "Kitchen quantity not found after order.created" };
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
    detail: `Kitchen qty ${input.initialQuantity} → ${quantity} after order.created`,
  };
}

export async function runInboundInventoryWebhookProof(input: {
  prisma: PrismaClient;
  userId: string;
  connectionId: string;
  productId: string;
  externalProductId: string;
  targetQuantity: number;
}): Promise<{ ok: boolean; quantity: number | null; detail: string }> {
  const payload = {
    id: input.externalProductId,
    name: "Merchant proof bowl",
    sku: WOOCOMMERCE_MERCHANT_PROOF_P0_10_SMOKE_SKU,
    manage_stock: true,
    stock_quantity: input.targetQuantity,
  };

  await ingestWooCommerceWebhookForSmoke({
    userId: input.userId,
    connectionId: input.connectionId,
    topic: "product.updated",
    payload,
    deliveryId: `smoke-inbound-inv-${Date.now()}`,
  });

  const quantity = await readKitchenQuantity(input.prisma, input.userId, input.productId);
  if (quantity !== input.targetQuantity) {
    return {
      ok: false,
      quantity,
      detail: `Inbound product.updated expected ${input.targetQuantity}, got ${quantity ?? "null"}`,
    };
  }

  return {
    ok: true,
    quantity,
    detail: `product.updated stock_quantity=${input.targetQuantity} → kitchen qty ${quantity}`,
  };
}

export async function appendMerchantProofInventoryStepsAfterOrder(input: {
  prisma: PrismaClient;
  userId: string;
  connectionId: string;
  fixture: MerchantProofInventoryFixture;
  orderedQuantity: number;
  steps: MerchantProofInventoryStep[];
}): Promise<{ bidirectionalOk: boolean }> {
  if (!input.fixture.ok || !input.fixture.productId) {
    input.steps.push({
      id: "inventory_sync_bidirectional_complete",
      label: "Bi-directional inventory sync complete",
      status: "FAILED",
      detail: "Merchant proof fixture missing",
    });
    return { bidirectionalOk: false };
  }

  const outbound = await verifyOutboundInventoryAfterOrder({
    prisma: input.prisma,
    userId: input.userId,
    productId: input.fixture.productId,
    initialQuantity: input.fixture.initialQuantity,
    orderedQuantity: input.orderedQuantity,
  });

  input.steps.push({
    id: "inventory_sync_outbound_kitchen",
    label: "Outbound inventory sync (order.created → kitchen)",
    status: outbound.ok ? "PASSED" : "FAILED",
    detail: outbound.detail,
  });

  const inboundTarget = 11;
  const inbound = await runInboundInventoryWebhookProof({
    prisma: input.prisma,
    userId: input.userId,
    connectionId: input.connectionId,
    productId: input.fixture.productId,
    externalProductId: input.fixture.externalProductId,
    targetQuantity: inboundTarget,
  });

  input.steps.push({
    id: "inventory_sync_inbound_product_webhook",
    label: "Inbound inventory sync (product.updated → kitchen)",
    status: inbound.ok ? "PASSED" : "FAILED",
    detail: inbound.detail,
  });

  const bidirectionalOk = outbound.ok && inbound.ok;
  input.steps.push({
    id: "inventory_sync_bidirectional_complete",
    label: "Bi-directional inventory sync complete",
    status: bidirectionalOk ? "PASSED" : "FAILED",
    detail: bidirectionalOk
      ? "Kitchen ↔ Woo inventory: order.created decrement + product.updated pull"
      : "Outbound or inbound inventory proof failed",
  });

  return { bidirectionalOk };
}

export async function runWooCommerceMerchantProofInventorySteps(input: {
  prisma: PrismaClient;
  userId: string;
  connectionId: string;
  orderedQuantity: number;
  steps: MerchantProofInventoryStep[];
}): Promise<{ bidirectionalOk: boolean; productId: string | null }> {
  const fixture = await ensureMerchantProofInventoryFixture({
    prisma: input.prisma,
    userId: input.userId,
    connectionId: input.connectionId,
  });

  input.steps.push({
    id: "merchant_proof_fixture",
    label: "Merchant proof inventory fixture",
    status: fixture.ok && fixture.productId ? "PASSED" : "FAILED",
    detail: fixture.ok
      ? `productId=${fixture.productId} sku=${WOOCOMMERCE_MERCHANT_PROOF_P0_10_SMOKE_SKU} qty=${fixture.initialQuantity}`
      : fixture.detail ?? "Fixture provisioning failed",
  });

  if (!fixture.ok || !fixture.productId) {
    return { bidirectionalOk: false, productId: null };
  }

  const outbound = await verifyOutboundInventoryAfterOrder({
    prisma: input.prisma,
    userId: input.userId,
    productId: fixture.productId,
    initialQuantity: fixture.initialQuantity,
    orderedQuantity: input.orderedQuantity,
  });

  input.steps.push({
    id: "inventory_sync_outbound_kitchen",
    label: "Outbound inventory sync (order.created → kitchen)",
    status: outbound.ok ? "PASSED" : "FAILED",
    detail: outbound.detail,
  });

  const inboundTarget = 11;
  const inbound = await runInboundInventoryWebhookProof({
    prisma: input.prisma,
    userId: input.userId,
    connectionId: input.connectionId,
    productId: fixture.productId,
    externalProductId: fixture.externalProductId,
    targetQuantity: inboundTarget,
  });

  input.steps.push({
    id: "inventory_sync_inbound_product_webhook",
    label: "Inbound inventory sync (product.updated → kitchen)",
    status: inbound.ok ? "PASSED" : "FAILED",
    detail: inbound.detail,
  });

  const bidirectionalOk = outbound.ok && inbound.ok;
  input.steps.push({
    id: "inventory_sync_bidirectional_complete",
    label: "Bi-directional inventory sync complete",
    status: bidirectionalOk ? "PASSED" : "FAILED",
    detail: bidirectionalOk
      ? "Kitchen ↔ Woo inventory: order.created decrement + product.updated pull"
      : "Outbound or inbound inventory proof failed",
  });

  return { bidirectionalOk, productId: fixture.productId };
}
