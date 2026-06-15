import { describe, expect, it } from "vitest";

import {
  buildPosProductCategories,
  filterPosProductsForCashierSpeed,
  posCashierSpeedModeFromSearchParam,
  posCashierSpeedModeToggleHref,
  posCashierSpeedProductGridClass,
  shouldShowPosTerminalSecondaryPanels,
} from "@/lib/pos/pos-cashier-speed-mode-era19";
import { POS_CASHIER_SPEED_MODE_ERA19_POLICY_ID } from "@/lib/pos/pos-cashier-speed-mode-era19-policy";

const products = [
  { id: "p1", title: "Latte", price: 4.5, category: "Coffee", barcode: "111" },
  { id: "p2", title: "Muffin", price: 3, category: "Bakery", barcode: null },
  { id: "p3", title: "Espresso", price: 3.5, category: "Coffee", barcode: "222" },
];

describe("pos cashier speed mode era19", () => {
  it("locks era19 speed mode policy id", () => {
    expect(POS_CASHIER_SPEED_MODE_ERA19_POLICY_ID).toBe("era19-pos-cashier-speed-mode-v1");
  });

  it("parses speed query param", () => {
    expect(posCashierSpeedModeFromSearchParam("1")).toBe(true);
    expect(posCashierSpeedModeFromSearchParam("true")).toBe(true);
    expect(posCashierSpeedModeFromSearchParam(undefined)).toBe(false);
  });

  it("builds toggle href for shareable speed mode URL", () => {
    expect(posCashierSpeedModeToggleHref(false)).toBe("/dashboard/pos/terminal?speed=1");
    expect(posCashierSpeedModeToggleHref(true)).toBe("/dashboard/pos/terminal");
  });

  it("builds sorted categories with All first", () => {
    expect(buildPosProductCategories(products)).toEqual(["All", "Bakery", "Coffee"]);
  });

  it("filters by category and barcode query in speed mode", () => {
    const coffee = filterPosProductsForCashierSpeed({
      products,
      query: "",
      category: "Coffee",
    });
    expect(coffee).toHaveLength(2);

    const barcode = filterPosProductsForCashierSpeed({
      products,
      query: "222",
      category: "All",
    });
    expect(barcode).toHaveLength(1);
    expect(barcode[0]?.title).toBe("Espresso");
  });

  it("uses denser grid and hides secondary panels in speed mode", () => {
    expect(posCashierSpeedProductGridClass(true)).toContain("grid-cols-3");
    expect(posCashierSpeedProductGridClass(false)).toContain("grid-cols-2");
    expect(shouldShowPosTerminalSecondaryPanels(true)).toBe(false);
    expect(shouldShowPosTerminalSecondaryPanels(false)).toBe(true);
  });
});
