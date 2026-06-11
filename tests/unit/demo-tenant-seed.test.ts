import { describe, expect, it } from "vitest";

import {
  DEMO_TENANT_INVENTORY_CATALOG,
  DEMO_TENANT_INVENTORY_ITEM_COUNT,
  DEMO_TENANT_ORDER_COUNT,
  DEMO_TENANT_VENDOR_COUNT,
  DEMO_TENANT_VENDORS,
  auditDemoTenantSeedPolicy,
} from "@/lib/demo/demo-tenant-seed-policy";

describe("demo tenant seed (P1-35)", () => {
  it("locks blueprint targets", () => {
    expect(DEMO_TENANT_ORDER_COUNT).toBe(50);
    expect(DEMO_TENANT_VENDOR_COUNT).toBe(3);
    expect(DEMO_TENANT_INVENTORY_ITEM_COUNT).toBe(20);
    expect(DEMO_TENANT_VENDORS).toHaveLength(3);
    expect(DEMO_TENANT_INVENTORY_CATALOG).toHaveLength(20);
  });

  it("uses distinct vendor and inventory names", () => {
    const vendorNames = new Set(DEMO_TENANT_VENDORS.map((row) => row.companyName));
    const inventoryNames = new Set(DEMO_TENANT_INVENTORY_CATALOG.map((row) => row.name));
    expect(vendorNames.size).toBe(3);
    expect(inventoryNames.size).toBe(20);
  });

  it("passes wiring audit", () => {
    const audit = auditDemoTenantSeedPolicy();
    expect(audit.passed, JSON.stringify(audit)).toBe(true);
    expect(audit.serviceWired).toBe(true);
    expect(audit.commercialWired).toBe(true);
    expect(audit.cliWired).toBe(true);
  });
});
