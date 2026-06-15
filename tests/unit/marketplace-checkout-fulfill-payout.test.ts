import { beforeEach, describe, expect, it, vi } from "vitest";

const orderState = vi.hoisted(() => ({
  status: "SUBMITTED" as string,
  trackingNumber: null as string | null,
}));

const transactionState = vi.hoisted(() => ({
  status: "PENDING" as string,
  payoutId: null as string | null,
  netAmount: 47.5,
}));

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    marketplacePurchaseOrder: {
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    vendorTransaction: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
      aggregate: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    vendor: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { loadVendorFinance, requestVendorPayout } from "@/services/marketplace/vendor-finance-service";
import {
  confirmVendorOrder,
  shipVendorOrder,
  startProcessingVendorOrder,
} from "@/services/marketplace/vendor-orders-service";

const vendorId = "vendor-e2e";
const orderId = "order-e2e";

function mockOrder() {
  return {
    id: orderId,
    status: orderState.status,
    notes: null,
    trackingNumber: orderState.trackingNumber,
    items: [
      {
        id: "line-1",
        sku: "GL-NIT-L",
        quantity: 5,
      },
    ],
  };
}

describe("marketplace checkout → fulfill → payout lifecycle", () => {
  beforeEach(() => {
    orderState.status = "SUBMITTED";
    orderState.trackingNumber = null;
    transactionState.status = "PENDING";
    transactionState.payoutId = null;

    prismaMock.marketplacePurchaseOrder.findFirst.mockImplementation(async () => mockOrder());
    prismaMock.marketplacePurchaseOrder.update.mockImplementation(async ({ data }) => {
      if (data.status) orderState.status = data.status;
      if (data.trackingNumber) orderState.trackingNumber = data.trackingNumber;
      return mockOrder();
    });
    prismaMock.marketplacePurchaseOrder.updateMany.mockResolvedValue({ count: 1 });

    prismaMock.vendorTransaction.findMany.mockImplementation(async (args) => {
      const where = args?.where ?? {};
      if (where.status === "PENDING" && orderState.status === "SHIPPED") {
        return [{ id: "tx-1" }];
      }
      if (where.status === "AVAILABLE") {
        return transactionState.status === "AVAILABLE"
          ? [{ id: "tx-1", netAmount: { toString: () => String(transactionState.netAmount) } }]
          : [];
      }
      if (where.status === "PENDING") {
        return transactionState.status === "PENDING"
          ? [{ id: "tx-1", netAmount: { toString: () => String(transactionState.netAmount) } }]
          : [];
      }
      return [];
    });

    prismaMock.vendorTransaction.updateMany.mockImplementation(async ({ data }) => {
      if (data.status === "AVAILABLE") transactionState.status = "AVAILABLE";
      if (data.status === "PAID_OUT") {
        transactionState.status = "PAID_OUT";
        transactionState.payoutId = data.payoutId ?? null;
      }
      return { count: 1 };
    });

    prismaMock.vendor.findUnique.mockResolvedValue({ commissionRate: { toString: () => "5" } });
    prismaMock.vendorTransaction.aggregate.mockImplementation(async (args) => {
      const status = args?.where?.status;
      if (status === "AVAILABLE" && transactionState.status === "AVAILABLE") {
        return { _sum: { netAmount: { toString: () => String(transactionState.netAmount) } } };
      }
      if (status === "PENDING" && transactionState.status === "PENDING") {
        return { _sum: { netAmount: { toString: () => String(transactionState.netAmount) } } };
      }
      if (status === "PAID_OUT" && transactionState.status === "PAID_OUT") {
        return { _sum: { netAmount: { toString: () => String(transactionState.netAmount) } } };
      }
      return { _sum: { netAmount: null } };
    });
    prismaMock.vendorTransaction.count.mockResolvedValue(1);
    prismaMock.vendorTransaction.groupBy.mockResolvedValue([]);
  });

  it("confirm → process → ship → available balance → payout", async () => {
    expect(await confirmVendorOrder({ vendorId, orderId })).toEqual({ ok: true });
    expect(orderState.status).toBe("CONFIRMED");

    expect(await startProcessingVendorOrder({ vendorId, orderId })).toEqual({ ok: true });
    expect(orderState.status).toBe("PROCESSING");

    const ship = await shipVendorOrder({
      vendorId,
      orderId,
      trackingNumber: "TRK-E2E-001",
      lines: [{ lineItemId: "line-1", shippedQuantity: 5 }],
    });
    expect(ship).toEqual({ ok: true, status: "SHIPPED" });
    expect(orderState.status).toBe("SHIPPED");

    const finance = await loadVendorFinance(vendorId, { page: 1, pageSize: 20 });
    expect(transactionState.status).toBe("AVAILABLE");
    expect(finance.balanceAvailable).toBe(47.5);
    expect(finance.balancePending).toBe(0);

    const payout = await requestVendorPayout(vendorId);
    expect(payout.ok).toBe(true);
    if (payout.ok) {
      expect(payout.amount).toBe(47.5);
      expect(payout.transactionCount).toBe(1);
      expect(transactionState.status).toBe("PAID_OUT");
      expect(transactionState.payoutId).toMatch(/^PAYOUT-/);
    }
  });
});
