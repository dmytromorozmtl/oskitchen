import { describe, expect, it } from "vitest";

import { buildVendor1099Html } from "@/services/marketplace/vendor-finance-service";

describe("vendor finance helpers", () => {
  it("builds 1099-K summary html", () => {
    const html = buildVendor1099Html({
      vendorName: "Supply Co",
      legalName: "Supply Co LLC",
      taxYear: 2026,
      grossAmount: 12000,
      netAmount: 11400,
      commissionAmount: 600,
      transactionCount: 42,
    });

    expect(html).toContain("1099-K");
    expect(html).toContain("Supply Co LLC");
    expect(html).toContain("12000.00");
  });
});
