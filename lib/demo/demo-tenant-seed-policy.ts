/**
 * P1-35 — demo tenant seed targets: 50 orders, 3 vendors, 20 inventory items.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { VendorType } from "@prisma/client";

export const DEMO_TENANT_SEED_POLICY_ID = "demo-tenant-seed-p1-35-v1" as const;

export const DEMO_TENANT_ORDER_COUNT = 50 as const;
export const DEMO_TENANT_VENDOR_COUNT = 3 as const;
export const DEMO_TENANT_INVENTORY_ITEM_COUNT = 20 as const;

export type DemoTenantInventorySeed = {
  name: string;
  unit: string;
  cost: number;
  stock: number;
};

export type DemoTenantVendorSeed = {
  companyName: string;
  legalName: string;
  type: VendorType;
};

export const DEMO_TENANT_VENDORS: readonly DemoTenantVendorSeed[] = [
  {
    companyName: "FreshPack Supplies",
    legalName: "FreshPack Supplies LLC",
    type: "DISTRIBUTOR",
  },
  {
    companyName: "Metro Provisions",
    legalName: "Metro Provisions Inc",
    type: "MANUFACTURER",
  },
  {
    companyName: "Local Farms Co-op",
    legalName: "Local Farms Cooperative",
    type: "COMBO",
  },
] as const;

export const DEMO_TENANT_INVENTORY_CATALOG: readonly DemoTenantInventorySeed[] = [
  { name: "Ground beef", unit: "lb", cost: 4.5, stock: 24 },
  { name: "Romaine lettuce", unit: "head", cost: 2.2, stock: 18 },
  { name: "Mozzarella", unit: "lb", cost: 5.8, stock: 12 },
  { name: "Chicken breast", unit: "lb", cost: 3.9, stock: 30 },
  { name: "Atlantic salmon", unit: "lb", cost: 11.5, stock: 14 },
  { name: "Yellow onions", unit: "lb", cost: 0.9, stock: 40 },
  { name: "Roma tomatoes", unit: "lb", cost: 1.4, stock: 28 },
  { name: "All-purpose flour", unit: "lb", cost: 0.6, stock: 50 },
  { name: "Olive oil", unit: "L", cost: 8.2, stock: 16 },
  { name: "Heavy cream", unit: "qt", cost: 3.1, stock: 20 },
  { name: "Eggs", unit: "dozen", cost: 4.0, stock: 36 },
  { name: "Butter", unit: "lb", cost: 4.8, stock: 22 },
  { name: "Basmati rice", unit: "lb", cost: 1.2, stock: 45 },
  { name: "Black beans", unit: "lb", cost: 1.1, stock: 32 },
  { name: "Cheddar cheese", unit: "lb", cost: 4.2, stock: 18 },
  { name: "Bell peppers", unit: "lb", cost: 2.0, stock: 26 },
  { name: "Garlic", unit: "lb", cost: 2.5, stock: 15 },
  { name: "Potatoes", unit: "lb", cost: 0.7, stock: 60 },
  { name: "Lemons", unit: "lb", cost: 1.8, stock: 20 },
  { name: "Fresh herbs mix", unit: "bunch", cost: 2.4, stock: 12 },
] as const;

export const DEMO_TENANT_SEED_SERVICE_PATH = "services/demo/demo-tenant-seed.ts" as const;
export const DEMO_TENANT_SEED_COMMERCIAL_PATH = "services/demo/commercial-demo-seed.ts" as const;
export const DEMO_TENANT_SEED_CLI_PATH = "prisma/seed-demo.ts" as const;

export const DEMO_TENANT_SEED_CI_SCRIPTS = ["test:ci:demo-tenant-seed"] as const;

export function auditDemoTenantSeedPolicy(root = process.cwd()): {
  policyId: typeof DEMO_TENANT_SEED_POLICY_ID;
  catalogLength: number;
  vendorLength: number;
  serviceWired: boolean;
  commercialWired: boolean;
  cliWired: boolean;
  passed: boolean;
} {
  const servicePath = join(root, DEMO_TENANT_SEED_SERVICE_PATH);
  const commercialPath = join(root, DEMO_TENANT_SEED_COMMERCIAL_PATH);
  const cliPath = join(root, DEMO_TENANT_SEED_CLI_PATH);

  const serviceWired =
    existsSync(servicePath) &&
    readFileSync(servicePath, "utf8").includes("DEMO_TENANT_ORDER_COUNT");
  const commercialWired =
    existsSync(commercialPath) &&
    readFileSync(commercialPath, "utf8").includes("seedDemoTenantBlueprintExtras");
  const cliWired =
    existsSync(cliPath) &&
    readFileSync(cliPath, "utf8").includes("DEMO_TENANT_ORDER_COUNT");

  const passed =
    DEMO_TENANT_INVENTORY_CATALOG.length === DEMO_TENANT_INVENTORY_ITEM_COUNT &&
    DEMO_TENANT_VENDORS.length === DEMO_TENANT_VENDOR_COUNT &&
    serviceWired &&
    commercialWired &&
    cliWired;

  return {
    policyId: DEMO_TENANT_SEED_POLICY_ID,
    catalogLength: DEMO_TENANT_INVENTORY_CATALOG.length,
    vendorLength: DEMO_TENANT_VENDORS.length,
    serviceWired,
    commercialWired,
    cliWired,
    passed,
  };
}
