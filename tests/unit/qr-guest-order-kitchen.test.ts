import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  QR_GUEST_KITCHEN_CREATION_SOURCE,
  QR_GUEST_KITCHEN_E2E_POLICY_ID,
  QR_GUEST_KITCHEN_ORDER_STATUS,
  QR_GUEST_KITCHEN_TICKET_VISIBLE_MS,
  QR_GUEST_KDS_TABLE_BADGE_TEST_ID,
  qrGuestKdsTicketTestId,
} from "@/lib/qr/qr-guest-kitchen-e2e-policy";
import { isQrTableOrder, readQrTableLabel } from "@/lib/qr/qr-order-meta";

const createOrderViaCenter = vi.hoisted(() => vi.fn());

const prismaMock = vi.hoisted(() => ({
  kitchenSettings: { findUnique: vi.fn() },
  restaurantTable: { findFirst: vi.fn() },
  order: {
    count: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/services/orders/order-creation-service", () => ({ createOrderViaCenter }));
vi.mock("@/lib/storefront/public-access", () => ({
  getStorefrontForPublicFromRequest: vi.fn(),
}));
vi.mock("@/lib/storefront/menu-page-data", () => ({
  loadStorefrontMenuCatalogForPage: vi.fn(),
}));
vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  restaurantTableListWhereForOwner: vi.fn().mockResolvedValue({ userId: "owner-1" }),
}));

import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";
import { loadStorefrontMenuCatalogForPage } from "@/lib/storefront/menu-page-data";
import { processQROrder } from "@/services/qr/qr-ordering-service";

const productId = "prod-qr-1";
const ownerUserId = "owner-qr-1";
const tableId = "table-uuid-12";

describe("qr guest order → kitchen ticket lifecycle (QA-12)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getStorefrontForPublicFromRequest).mockResolvedValue({
      published: true,
      enabled: true,
      userId: ownerUserId,
    } as Awaited<ReturnType<typeof getStorefrontForPublicFromRequest>>);

    vi.mocked(loadStorefrontMenuCatalogForPage).mockResolvedValue({
      effectiveStoreSlug: "demo-store",
      currency: "USD",
      catalog: {
        products: [
          {
            id: productId,
            name: "House Burger",
            price: 14.5,
            canAddToCart: true,
          },
        ],
      },
    } as Awaited<ReturnType<typeof loadStorefrontMenuCatalogForPage>>);

    prismaMock.kitchenSettings.findUnique.mockResolvedValue({
      businessName: "Demo Kitchen",
    });
    prismaMock.restaurantTable.findFirst.mockResolvedValue({
      id: tableId,
      name: "Table 12",
    });
    prismaMock.order.count.mockResolvedValue(2);
    createOrderViaCenter.mockResolvedValue({
      ok: true,
      orderId: "order-qr-kitchen-1",
      lookupToken: "lookup-abc",
    });
    prismaMock.order.update.mockResolvedValue({});
    prismaMock.order.findUnique.mockResolvedValue({ paymentStatus: "UNPAID" });
  });

  it("exports kitchen E2E policy constants aligned with Playwright selectors", () => {
    expect(QR_GUEST_KITCHEN_E2E_POLICY_ID).toBe("qr-guest-kitchen-e2e-v1");
    expect(QR_GUEST_KITCHEN_TICKET_VISIBLE_MS).toBe(15_000);
    expect(QR_GUEST_KDS_TABLE_BADGE_TEST_ID).toBe("kds-qr-table-badge");
    expect(qrGuestKdsTicketTestId("ord-99")).toBe("kds-ticket-ord-99");
  });

  it("processQROrder routes guest table order to IN_PRODUCTION with QR metadata", async () => {
    const result = await processQROrder({
      storeSlug: "demo-store",
      tableRouteId: "12",
      lines: [{ productId, quantity: 2 }],
      customerName: "Guest",
      checkoutStyle: "pay_later",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.orderId).toBe("order-qr-kitchen-1");
    expect(result.tableLabel).toBe("Table 12");

    expect(createOrderViaCenter).toHaveBeenCalledWith(
      { userId: ownerUserId },
      expect.objectContaining({
        orderType: "RESTAURANT_ORDER",
        statusKey: QR_GUEST_KITCHEN_ORDER_STATUS,
        fulfillmentDetail: "DINE_IN",
        paymentMode: "PAY_LATER",
        channelProvider: "qr",
        creationSourceOverride: QR_GUEST_KITCHEN_CREATION_SOURCE,
      }),
    );

    const orderInput = createOrderViaCenter.mock.calls[0]?.[1];
    const metadata = JSON.parse(orderInput.sourceMetadataJson as string);
    expect(isQrTableOrder(metadata)).toBe(true);
    expect(readQrTableLabel(metadata)).toBe("Table 12");
    expect(metadata.qr.selfService).toBe(true);

    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: "order-qr-kitchen-1" },
      data: { tableId },
    });
  });
});
