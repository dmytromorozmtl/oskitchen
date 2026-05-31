/**
 * Mock channel fixtures for cross-channel inventory E2E — no live Shopify/Woo/DoorDash APIs.
 *
 * @see e2e/cross-channel-inventory.spec.ts
 * @see docs/cross-channel-inventory-sales-one-pager.md
 */

import {
  buildCrossChannelLevels,
  buildCrossChannelSyncSnapshot,
  type CrossChannelSyncSnapshot,
} from "@/services/inventory/cross-channel-inventory-sync";

export const MOCK_CROSS_CHANNEL_PRODUCTS = {
  burger: { id: "mock-product-burger", title: "Classic Burger", sku: "BRG-MOCK", quantity: 24 },
  fries: { id: "mock-product-fries", title: "Seasoned Fries", sku: "FRI-MOCK", quantity: 6 },
} as const;

export const MOCK_CROSS_CHANNEL_EXTERNAL_ROWS = [
  {
    connectionId: "mock-conn-shopify",
    provider: "SHOPIFY",
    externalProductId: "shopify-prod-1",
    externalVariantId: "shopify-var-1",
    mappedProductId: MOCK_CROSS_CHANNEL_PRODUCTS.burger.id,
    title: MOCK_CROSS_CHANNEL_PRODUCTS.burger.title,
    sku: MOCK_CROSS_CHANNEL_PRODUCTS.burger.sku,
    rawPayloadJson: { variant: { inventoryQuantity: 20 } },
  },
  {
    connectionId: "mock-conn-woo",
    provider: "WOOCOMMERCE",
    externalProductId: "woo-prod-2",
    externalVariantId: "",
    mappedProductId: MOCK_CROSS_CHANNEL_PRODUCTS.fries.id,
    title: MOCK_CROSS_CHANNEL_PRODUCTS.fries.title,
    sku: MOCK_CROSS_CHANNEL_PRODUCTS.fries.sku,
    rawPayloadJson: { stock_quantity: 12 },
  },
  {
    connectionId: "mock-conn-doordash",
    provider: "DOORDASH",
    externalProductId: "dd-item-3",
    externalVariantId: "",
    mappedProductId: MOCK_CROSS_CHANNEL_PRODUCTS.burger.id,
    title: MOCK_CROSS_CHANNEL_PRODUCTS.burger.title,
    sku: MOCK_CROSS_CHANNEL_PRODUCTS.burger.sku,
    rawPayloadJson: { quantity: 18 },
  },
] as const;

/** Build a deterministic cross-channel snapshot using mock POS + channel rows. */
export function buildMockCrossChannelSnapshot(now = new Date()): CrossChannelSyncSnapshot {
  const masterByProduct = new Map([
    [
      MOCK_CROSS_CHANNEL_PRODUCTS.burger.id,
      {
        title: MOCK_CROSS_CHANNEL_PRODUCTS.burger.title,
        sku: MOCK_CROSS_CHANNEL_PRODUCTS.burger.sku,
        quantity: MOCK_CROSS_CHANNEL_PRODUCTS.burger.quantity,
        lowStockThreshold: 10,
      },
    ],
    [
      MOCK_CROSS_CHANNEL_PRODUCTS.fries.id,
      {
        title: MOCK_CROSS_CHANNEL_PRODUCTS.fries.title,
        sku: MOCK_CROSS_CHANNEL_PRODUCTS.fries.sku,
        quantity: MOCK_CROSS_CHANNEL_PRODUCTS.fries.quantity,
        lowStockThreshold: 8,
      },
    ],
  ]);

  const levels = buildCrossChannelLevels({
    masterByProduct,
    externalRows: [...MOCK_CROSS_CHANNEL_EXTERNAL_ROWS],
    reservations: [],
    lowStockThresholdDefault: 8,
    now,
  });

  return buildCrossChannelSyncSnapshot({ levels, reservations: [], now });
}

/** In-browser flag for optional UI diagnostics (no API interception required). */
export const CROSS_CHANNEL_INVENTORY_MOCK_INIT_SCRIPT = `
window.__KOS_CROSS_CHANNEL_INVENTORY_MOCK__ = {
  policyId: "critical-cross-channel-inventory-sync-v1",
  channels: ["POS", "SHOPIFY", "WOOCOMMERCE", "DOORDASH"],
  products: ${JSON.stringify(MOCK_CROSS_CHANNEL_PRODUCTS)},
};
`;
