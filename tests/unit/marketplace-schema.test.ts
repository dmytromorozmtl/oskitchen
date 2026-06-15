import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const SCHEMA_PATH = join(process.cwd(), "prisma/schema.prisma");

describe("B2B marketplace Prisma schema contract", () => {
  const schema = readFileSync(SCHEMA_PATH, "utf8");

  it("declares core vendor and catalog models with workspace scoping", () => {
    expect(schema).toMatch(/model Vendor[\s\S]*?@@index\(\[workspaceId\]\)/);
    expect(schema).toMatch(/model VendorProduct[\s\S]*?@@unique\(\[vendorId, sku\]\)/);
    expect(schema).toMatch(/model MarketplaceProductCategory[\s\S]*?slug\s+String\s+@unique/);
    expect(schema).toMatch(/model MarketplaceProductVariant[\s\S]*?@@unique\(\[productId, sku\]\)/);
    expect(schema).toMatch(/model MarketplaceVolumePrice[\s\S]*?@@unique\(\[productId, minQuantity\]\)/);
  });

  it("declares purchase flow models with tenant isolation indexes", () => {
    expect(schema).toMatch(
      /model MarketplacePurchaseOrder[\s\S]*?@@index\(\[workspaceId, status\]\)/,
    );
    expect(schema).toMatch(/model MarketplacePOLineItem[\s\S]*?purchaseOrderId/);
    expect(schema).toMatch(/model MarketplaceRecurringOrder[\s\S]*?@@index\(\[workspaceId\]\)/);
    expect(schema).toMatch(/model MarketplaceCart[\s\S]*?workspaceId\s+String\s+@unique/);
  });

  it("declares reviews, disputes, transactions, and messaging", () => {
    expect(schema).toMatch(
      /model MarketplaceVendorReview[\s\S]*?@@unique\(\[workspaceId, purchaseOrderId\]\)/,
    );
    expect(schema).toMatch(/model MarketplaceDispute[\s\S]*?purchaseOrderId\s+String\s+@unique/);
    expect(schema).toMatch(/model VendorTransaction[\s\S]*?purchaseOrderId\s+String\s+@unique/);
    expect(schema).toMatch(/model VendorMessage[\s\S]*?@@index\(\[purchaseOrderId\]\)/);
  });

  it("links marketplace orders to Workspace", () => {
    expect(schema).toMatch(
      /marketplacePurchaseOrders MarketplacePurchaseOrder\[\] @relation\("MarketplacePurchaseOrderWorkspace"\)/,
    );
    expect(schema).toMatch(
      /marketplaceCarts MarketplaceCart\[\] @relation\("MarketplaceCartWorkspace"\)/,
    );
  });
});
