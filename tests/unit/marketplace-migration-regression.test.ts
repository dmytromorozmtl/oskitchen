import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { isPrismaMigrationMissingError } from "@/lib/prisma-migration-missing";

const ROOT = process.cwd();
const MIGRATION_DIR = join(ROOT, "prisma/migrations/20260602133000_marketplace_core");
const MIGRATION_SQL_PATH = join(MIGRATION_DIR, "migration.sql");
const SCHEMA_PATH = join(ROOT, "prisma/schema.prisma");

const MARKETPLACE_TABLES = [
  "marketplace_vendors",
  "marketplace_vendor_products",
  "marketplace_product_categories",
  "marketplace_product_variants",
  "marketplace_volume_prices",
  "marketplace_purchase_orders",
  "marketplace_po_line_items",
  "marketplace_recurring_orders",
  "marketplace_carts",
  "marketplace_vendor_reviews",
  "marketplace_disputes",
  "marketplace_vendor_transactions",
  "marketplace_vendor_messages",
] as const;

const MARKETPLACE_HUB_PAGES = [
  "app/dashboard/marketplace/catalog/page.tsx",
  "app/dashboard/marketplace/checkout/page.tsx",
  "app/dashboard/marketplace/orders/page.tsx",
  "app/dashboard/marketplace/vendors/page.tsx",
  "app/dashboard/marketplace/analytics/page.tsx",
  "app/dashboard/marketplace/compare/page.tsx",
] as const;

describe("marketplace core migration regression", () => {
  const migrationSql = readFileSync(MIGRATION_SQL_PATH, "utf8");
  const schema = readFileSync(SCHEMA_PATH, "utf8");

  it("ships migration 20260602133000_marketplace_core on disk", () => {
    expect(existsSync(MIGRATION_DIR)).toBe(true);
    expect(existsSync(MIGRATION_SQL_PATH)).toBe(true);
    expect(migrationSql.length).toBeGreaterThan(1_000);
  });

  it("creates all marketplace tables referenced by Prisma @@map", () => {
    for (const table of MARKETPLACE_TABLES) {
      expect(migrationSql).toContain(`CREATE TABLE "${table}"`);
      expect(schema).toContain(`@@map("${table}")`);
    }
  });

  it("declares tenant isolation indexes on purchase orders and carts", () => {
    expect(migrationSql).toContain(
      'CREATE INDEX "marketplace_purchase_orders_workspace_id_status_idx"',
    );
    expect(migrationSql).toContain('CREATE UNIQUE INDEX "marketplace_carts_workspace_id_key"');
    expect(schema).toMatch(
      /model MarketplacePurchaseOrder[\s\S]*?@@index\(\[workspaceId, status\]\)/,
    );
    expect(schema).toMatch(/model MarketplaceCart[\s\S]*?workspaceId\s+String\s+@unique/);
  });

  it("anchors marketplace vendors and orders to workspaces with FK constraints", () => {
    expect(migrationSql).toContain(
      'ALTER TABLE "marketplace_purchase_orders" ADD CONSTRAINT "marketplace_purchase_orders_workspace_id_fkey"',
    );
    expect(migrationSql).toContain(
      'ALTER TABLE "marketplace_carts" ADD CONSTRAINT "marketplace_carts_workspace_id_fkey"',
    );
    expect(migrationSql).toContain(
      'ALTER TABLE "marketplace_vendors" ADD CONSTRAINT "marketplace_vendors_workspace_id_fkey"',
    );
  });

  it("keeps marketplace enums in migration aligned with schema declarations", () => {
    const enums = [
      "VendorType",
      "VendorStatus",
      "MarketplacePOStatus",
      "MarketplacePaymentMethod",
      "MarketplaceDisputeStatus",
    ];
    for (const enumName of enums) {
      expect(migrationSql).toContain(`CREATE TYPE "${enumName}"`);
      expect(schema).toContain(`enum ${enumName}`);
    }
  });

  it("marketplace hub pages degrade when migration is not applied", () => {
    for (const pagePath of MARKETPLACE_HUB_PAGES) {
      const source = readFileSync(join(ROOT, pagePath), "utf8");
      expect(source).toContain("isPrismaMigrationMissingError");
      expect(source).toContain("MarketplaceDataUnavailable");
    }
  });

  it("detects missing column errors as migration-not-applied (P2022)", () => {
    const error = new Prisma.PrismaClientKnownRequestError("column missing", {
      code: "P2022",
      clientVersion: "6.19.3",
    });
    expect(isPrismaMigrationMissingError(error)).toBe(true);
  });
});
