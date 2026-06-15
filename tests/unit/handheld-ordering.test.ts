import { describe, expect, it } from "vitest";

import {
  findOpenTabForTable,
  groupHandheldProducts,
  handheldCartSubtotal,
  HANDHELD_PWA_SCOPE,
} from "@/lib/pos/handheld-ordering";

describe("handheld ordering helpers", () => {
  it("groups products by category", () => {
    const groups = groupHandheldProducts([
      { id: "1", title: "Burger", price: 12, category: "MAINS" },
      { id: "2", title: "Fries", price: 5, category: "SIDES" },
      { id: "3", title: "Steak", price: 24, category: "MAINS" },
    ]);
    expect(groups.map((group) => group.category)).toEqual(["MAINS", "SIDES"]);
    expect(groups[0]?.products).toHaveLength(2);
  });

  it("finds an open tab for a table", () => {
    const tab = findOpenTabForTable(
      [
        { id: "tab-1", name: "Table 4", tableId: "table-4", items: [] },
        { id: "tab-2", name: "Table 8", tableId: "table-8", items: [] },
      ],
      "table-8",
    );
    expect(tab?.id).toBe("tab-2");
  });

  it("sums cart subtotals", () => {
    expect(
      handheldCartSubtotal([
        { key: "a", productId: "a", title: "Burger", quantity: 2, unitPrice: 10 },
        { key: "b", productId: "b", title: "Fries", quantity: 1, unitPrice: 4.5 },
      ]),
    ).toBe(24.5);
  });

  it("exposes handheld PWA scope", () => {
    expect(HANDHELD_PWA_SCOPE).toBe("/dashboard/pos/handheld");
  });
});
