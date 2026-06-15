import { describe, expect, it } from "vitest";

import {
  buildMarketplaceOrderTimeline,
  marketplaceOrderStatusLabel,
} from "@/lib/marketplace/order-status";
import { parseMarketplaceOrdersFilters } from "@/lib/marketplace/orders-filters";
import { computeNextRecurringRunAt } from "@/services/marketplace/recurring-orders-service";

describe("marketplace order status", () => {
  it("labels PO statuses for UI", () => {
    expect(marketplaceOrderStatusLabel("PENDING_APPROVAL")).toBe("Pending Approval");
    expect(marketplaceOrderStatusLabel("SHIPPED")).toBe("Shipped");
  });

  it("builds timeline for pending approval", () => {
    const steps = buildMarketplaceOrderTimeline({
      status: "PENDING_APPROVAL",
      createdAt: new Date("2026-06-01T10:00:00Z"),
    });
    expect(steps.some((step) => step.key === "approval" && step.state === "current")).toBe(true);
  });

  it("builds shipped timeline with tracking detail", () => {
    const steps = buildMarketplaceOrderTimeline({
      status: "SHIPPED",
      createdAt: new Date("2026-06-01T10:00:00Z"),
      trackingNumber: "1Z999",
    });
    const shipped = steps.find((step) => step.key === "shipped");
    expect(shipped?.detail).toContain("1Z999");
  });
});

describe("marketplace orders filters", () => {
  it("parses tab and status from search params", () => {
    const filters = parseMarketplaceOrdersFilters({
      tab: "po",
      status: "SUBMITTED",
      vendor: "vendor-1",
      page: "2",
    });
    expect(filters.tab).toBe("po");
    expect(filters.status).toBe("SUBMITTED");
    expect(filters.vendorId).toBe("vendor-1");
    expect(filters.page).toBe(2);
  });
});

describe("marketplace recurring orders", () => {
  it("computes next weekly run", () => {
    const from = new Date("2026-06-01T12:00:00Z");
    const next = computeNextRecurringRunAt(from, "WEEKLY");
    expect(next.getTime()).toBeGreaterThan(from.getTime());
  });
});
