import { describe, expect, it } from "vitest";

import {
  buildVendorAnalyticsModule,
  buildVendorInvoicesModule,
  buildVendorOrdersModule,
  buildVendorPortalHub,
} from "@/lib/marketplace/vendor-portal-builders";
import {
  VENDOR_PORTAL_BASE_PATH,
  VENDOR_PORTAL_MODULES,
  VENDOR_PORTAL_POLICY_ID,
  VENDOR_PORTAL_SERVICE,
} from "@/lib/marketplace/vendor-portal-policy";

describe("Vendor Portal 2.0", () => {
  it("locks policy constants", () => {
    expect(VENDOR_PORTAL_POLICY_ID).toBe("vendor-portal-v2");
    expect(VENDOR_PORTAL_SERVICE).toBe("services/marketplace/vendor-portal-service.ts");
    expect(VENDOR_PORTAL_BASE_PATH).toBe("/vendor");
    expect(VENDOR_PORTAL_MODULES).toEqual(["orders", "invoices", "analytics"]);
  });

  it("flags orders module when pending action exists", () => {
    const mod = buildVendorOrdersModule({ ordersActive: 4, ordersPending: 3, ordersMonth: 12 });
    expect(mod.module).toBe("orders");
    expect(mod.status).toBe("watch");
    expect(mod.href).toBe("/vendor/orders");
  });

  it("builds invoices module with outstanding balance", () => {
    const mod = buildVendorInvoicesModule({
      outstandingCount: 5,
      outstandingAmount: 4200,
      paidOutCount: 18,
      currency: "USD",
    });
    expect(mod.module).toBe("invoices");
    expect(mod.headline).toContain("5 open invoices");
    expect(mod.href).toBe("/vendor/invoices");
  });

  it("assembles vendor portal hub with three modules", () => {
    const hub = buildVendorPortalHub({
      vendorId: "v-1",
      vendorName: "PackCo Supply",
      currency: "USD",
      ordersActive: 6,
      ordersPending: 2,
      ordersMonth: 14,
      outstandingCount: 3,
      outstandingAmount: 1800,
      paidOutCount: 9,
      revenue30d: 12400,
      orders30d: 14,
      repeatBuyerRate: 28,
      avgRating: 4.6,
      recentOrders: [],
      recentInvoices: [],
      analyticsHighlights: [
        { id: "revenue", label: "Revenue (30d)", value: "$12,400", detail: "14 purchase orders" },
      ],
    });

    expect(hub.policyId).toBe(VENDOR_PORTAL_POLICY_ID);
    expect(hub.basePath).toBe(VENDOR_PORTAL_BASE_PATH);
    expect(hub.modules).toHaveLength(3);
    expect(hub.summary.revenue30d).toBe(12400);
    expect(buildVendorAnalyticsModule({
      revenue30d: 0,
      orders30d: 0,
      repeatBuyerRate: 0,
      avgRating: null,
      currency: "USD",
    }).status).toBe("idle");
  });
});
