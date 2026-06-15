import { describe, expect, it } from "vitest";

import {
  mergeProductInventoryLink,
  parseProductInventoryLink,
} from "@/lib/marketplace/inventory-link-types";

describe("marketplace inventory integration types", () => {
  it("parses inventory link from product attributes", () => {
    const link = parseProductInventoryLink({
      inventoryLink: {
        ingredientId: "ing-1",
        inventorySku: "FLOUR-50LB",
        unitsPerPack: 2,
        linkedAt: "2026-06-02T12:00:00.000Z",
      },
    });
    expect(link).toMatchObject({
      ingredientId: "ing-1",
      inventorySku: "FLOUR-50LB",
      unitsPerPack: 2,
    });
  });

  it("defaults unitsPerPack to 1 when missing", () => {
    const link = parseProductInventoryLink({
      inventoryLink: { ingredientId: "ing-2" },
    });
    expect(link?.unitsPerPack).toBe(1);
  });

  it("merges inventory link into attributes", () => {
    const merged = mergeProductInventoryLink(
      { tags: ["bulk"] },
      {
        ingredientId: "ing-3",
        inventorySku: "OIL-1GAL",
        unitsPerPack: 1,
        linkedAt: "2026-06-02T12:00:00.000Z",
      },
    );
    expect(parseProductInventoryLink(merged)?.ingredientId).toBe("ing-3");
    expect(merged.tags).toEqual(["bulk"]);
  });
});
