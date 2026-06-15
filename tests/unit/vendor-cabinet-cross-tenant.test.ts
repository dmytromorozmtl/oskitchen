import { describe, expect, it } from "vitest";

import {
  VENDOR_CABINET_CROSS_TENANT_E2E_POLICY_ID,
  VENDOR_ORDERS_PATH,
  isVendorCrossTenantForbiddenStatus,
  vendorOrderDetailPath,
  vendorPackingSlipPath,
} from "@/lib/marketplace/vendor-cabinet-cross-tenant-e2e-policy";

describe("Vendor cabinet cross-tenant lifecycle (QA-24)", () => {
  it("exports E2E policy id and vendor routes", () => {
    expect(VENDOR_CABINET_CROSS_TENANT_E2E_POLICY_ID).toBe(
      "vendor-cabinet-cross-tenant-e2e-v1",
    );
    expect(VENDOR_ORDERS_PATH).toBe("/vendor/orders");
    expect(vendorOrderDetailPath("abc")).toBe("/vendor/orders/abc");
    expect(vendorPackingSlipPath("abc")).toBe("/api/vendor/orders/abc/packing-slip");
  });

  it("treats 403 and 404 as cross-tenant forbidden responses", () => {
    expect(isVendorCrossTenantForbiddenStatus(403)).toBe(true);
    expect(isVendorCrossTenantForbiddenStatus(404)).toBe(true);
    expect(isVendorCrossTenantForbiddenStatus(401)).toBe(false);
    expect(isVendorCrossTenantForbiddenStatus(500)).toBe(false);
  });
});
