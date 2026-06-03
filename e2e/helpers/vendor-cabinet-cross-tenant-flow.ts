import { expect, type APIRequestContext, type Page } from "@playwright/test";

import {
  VENDOR_ORDER_NOT_FOUND_HEADING,
  isVendorCrossTenantForbiddenStatus,
  vendorOrderDetailPath,
  vendorPackingSlipPath,
} from "@/lib/marketplace/vendor-cabinet-cross-tenant-e2e-policy";
import { loadVendorOrderDetail } from "@/services/marketplace/vendor-orders-service";

import { assertNoDashboardRscFailure, skipIfLoginRedirect } from "./dashboard-smoke";
import type { VendorCabinetCrossTenantFixture } from "./vendor-cabinet-cross-tenant-ready";

export async function assertVendorServiceCrossTenantDenial(
  authedVendorId: string,
  foreign: VendorCabinetCrossTenantFixture,
): Promise<void> {
  const detail = await loadVendorOrderDetail(authedVendorId, foreign.purchaseOrderId);
  expect(detail).toBeNull();
}

export async function assertVendorCabinetHttpCrossTenantDenial(
  page: Page,
  foreign: VendorCabinetCrossTenantFixture,
): Promise<void> {
  const packingRes = await page.request.get(vendorPackingSlipPath(foreign.purchaseOrderId));
  expect(isVendorCrossTenantForbiddenStatus(packingRes.status())).toBe(true);

  await page.goto(vendorOrderDetailPath(foreign.purchaseOrderId));
  await skipIfLoginRedirect(page, "Vendor cabinet cross-tenant requires dashboard auth");
  await assertNoDashboardRscFailure(page);

  await expect(page.getByRole("heading", { name: VENDOR_ORDER_NOT_FOUND_HEADING })).toBeVisible({
    timeout: 60_000,
  });
  await expect(page.locator("body")).not.toContainText(foreign.poNumber);
  await expect(page.locator("body")).not.toContainText(foreign.vendorCompanyName);
}

export async function assertVendorBulkConfirmDoesNotTouchForeignOrder(
  authedVendorId: string,
  foreign: VendorCabinetCrossTenantFixture,
): Promise<void> {
  const { prisma } = await import("@/lib/prisma");
  const result = await prisma.marketplacePurchaseOrder.updateMany({
    where: {
      vendorId: authedVendorId,
      id: foreign.purchaseOrderId,
      status: { in: ["SUBMITTED", "PENDING_APPROVAL"] },
    },
    data: { status: "CONFIRMED" },
  });
  expect(result.count).toBe(0);
}

export async function assertVendorPackingSlipApiDenied(
  request: APIRequestContext,
  foreignOrderId: string,
): Promise<void> {
  const response = await request.get(vendorPackingSlipPath(foreignOrderId));
  expect(isVendorCrossTenantForbiddenStatus(response.status())).toBe(true);
}
