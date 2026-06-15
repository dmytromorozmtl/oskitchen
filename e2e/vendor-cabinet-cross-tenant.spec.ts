import { expect, test } from "@playwright/test";

import {
  VENDOR_CABINET_CROSS_TENANT_E2E_POLICY_ID,
  VENDOR_DASHBOARD_PATH,
  VENDOR_ORDERS_PATH,
  isVendorCrossTenantForbiddenStatus,
  vendorOrderDetailPath,
  vendorPackingSlipPath,
} from "@/lib/marketplace/vendor-cabinet-cross-tenant-e2e-policy";
import { loadVendorOrderDetail } from "@/services/marketplace/vendor-orders-service";

import {
  assertVendorBulkConfirmDoesNotTouchForeignOrder,
  assertVendorCabinetHttpCrossTenantDenial,
  assertVendorServiceCrossTenantDenial,
} from "./helpers/vendor-cabinet-cross-tenant-flow";
import {
  resolveAuthedApprovedVendorId,
  seedForeignMarketplacePurchaseOrder,
  skipVendorCabinetCrossTenantIfNoDb,
  skipVendorCabinetCrossTenantIfNotAuthed,
} from "./helpers/vendor-cabinet-cross-tenant-ready";

/**
 * Vendor cabinet cross-tenant isolation E2E.
 *
 * Vendor A cannot read vendor B purchase orders via service, page, or packing-slip API.
 *
 * @see e2e/cross-tenant-isolation.spec.ts — broader tenant isolation suite
 * @see app/vendor/(cabinet)/orders/[id]/page.tsx
 */

test.describe("vendor cabinet cross-tenant policy", () => {
  test("exports vendor cabinet route and forbidden status contract", () => {
    expect(VENDOR_CABINET_CROSS_TENANT_E2E_POLICY_ID).toBe(
      "vendor-cabinet-cross-tenant-e2e-v1",
    );
    expect(VENDOR_DASHBOARD_PATH).toBe("/vendor/dashboard");
    expect(VENDOR_ORDERS_PATH).toBe("/vendor/orders");
    expect(vendorOrderDetailPath("po-1")).toBe("/vendor/orders/po-1");
    expect(vendorPackingSlipPath("po-1")).toBe("/api/vendor/orders/po-1/packing-slip");
    expect(isVendorCrossTenantForbiddenStatus(404)).toBe(true);
    expect(isVendorCrossTenantForbiddenStatus(403)).toBe(true);
    expect(isVendorCrossTenantForbiddenStatus(200)).toBe(false);
  });
});

test.describe("vendor cabinet cross-tenant (database)", () => {
  test.beforeEach(() => {
    skipVendorCabinetCrossTenantIfNoDb();
  });

  test("loadVendorOrderDetail returns null for foreign vendor purchase order", async () => {
    const foreign = await seedForeignMarketplacePurchaseOrder("svc");
    const otherVendor = await seedForeignMarketplacePurchaseOrder("svc-other");

    try {
      const detail = await loadVendorOrderDetail(otherVendor.vendorId, foreign.purchaseOrderId);
      expect(detail).toBeNull();
    } finally {
      await foreign.cleanup();
      await otherVendor.cleanup();
    }
  });
});

test.describe("vendor cabinet cross-tenant (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Vendor cabinet cross-tenant runs in chromium-authed project only",
    );
    skipVendorCabinetCrossTenantIfNoDb();
    skipVendorCabinetCrossTenantIfNotAuthed();
  });

  test("authed vendor cannot open foreign purchase order in cabinet", async ({ page }) => {
    const authedVendorId = await resolveAuthedApprovedVendorId();
    if (!authedVendorId) {
      test.skip(true, "E2E login user has no approved vendor — register vendor first.");
    }

    const foreign = await seedForeignMarketplacePurchaseOrder("http");

    try {
      await assertVendorServiceCrossTenantDenial(authedVendorId!, foreign);
      await assertVendorBulkConfirmDoesNotTouchForeignOrder(authedVendorId!, foreign);
      await assertVendorCabinetHttpCrossTenantDenial(page, foreign);
    } finally {
      await foreign.cleanup();
    }
  });
});
