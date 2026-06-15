import { describe, expect, it } from "vitest";

import { exportUniversalMenuCsv, parseUniversalMenuCsv } from "@/lib/menu/universal-menu-csv";
import { emptyChannelOverrides, emptySyncStatus } from "@/lib/menu/universal-menu-builders";
import type { UniversalMenuItem } from "@/lib/menu/universal-menu-types";

function sampleItem(): UniversalMenuItem {
  return {
    productId: "p-1",
    menuId: "m-1",
    master: {
      title: "Burger",
      description: "Classic",
      price: 12.5,
      category: "MAINS",
      image: null,
      active: true,
      posVisible: true,
      storefrontVisible: true,
    },
    channelOverrides: emptyChannelOverrides(),
    syncStatus: emptySyncStatus(),
    updatedAt: "2026-06-01T00:00:00Z",
  };
}

describe("universal menu csv", () => {
  it("exports and parses round-trip productId and title", () => {
    const csv = exportUniversalMenuCsv([sampleItem()]);
    const { rows, errors } = parseUniversalMenuCsv(csv);
    expect(errors).toHaveLength(0);
    expect(rows[0]?.productId).toBe("p-1");
    expect(rows[0]?.title).toBe("Burger");
    expect(rows[0]?.price).toBe(12.5);
  });

  it("reports error for empty csv", () => {
    const { errors } = parseUniversalMenuCsv("");
    expect(errors.length).toBeGreaterThan(0);
  });
});
