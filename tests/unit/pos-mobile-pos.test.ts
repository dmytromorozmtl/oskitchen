import { describe, expect, it } from "vitest";

import {
  filterPosMobileProducts,
  posMobileCartSubtotal,
  posMobileProductCategories,
} from "@/lib/pos/pos-mobile-cart";
import { detectPosSwipe } from "@/lib/pos/pos-mobile-gestures";
import {
  MOBILE_PWA_SCOPE,
  POS_MOBILE_POS_MIN_TOUCH_PX,
  POS_MOBILE_POS_POLICY_ID,
  POS_MOBILE_POS_ROUTE,
} from "@/lib/pos/pos-mobile-pos-policy";
import { POS_TOUCH_TARGET_CONSUMERS } from "@/lib/pos/touch-targets";

describe("mobile POS", () => {
  it("locks policy constants", () => {
    expect(POS_MOBILE_POS_POLICY_ID).toBe("pos-mobile-pos-v1");
    expect(POS_MOBILE_POS_ROUTE).toBe("/dashboard/pos/mobile");
    expect(MOBILE_PWA_SCOPE).toBe("/dashboard/pos/mobile/");
    expect(POS_MOBILE_POS_MIN_TOUCH_PX).toBe(48);
  });

  it("detects horizontal and vertical swipes", () => {
    expect(detectPosSwipe({ x: 0, y: 0 }, { x: 80, y: 4 })).toBe("right");
    expect(detectPosSwipe({ x: 0, y: 0 }, { x: 0, y: -70 })).toBe("up");
    expect(detectPosSwipe({ x: 0, y: 0 }, { x: 4, y: 4 })).toBeNull();
  });

  it("filters products by category and search", () => {
    const products = [
      { id: "1", title: "Burger", price: 12, category: "Mains" },
      { id: "2", title: "Fries", price: 4, category: "Sides" },
    ];
    expect(posMobileProductCategories(products)).toEqual(["All", "Mains", "Sides"]);
    expect(
      filterPosMobileProducts({ products, category: "Mains", query: "bur" }),
    ).toHaveLength(1);
  });

  it("sums cart subtotal", () => {
    expect(
      posMobileCartSubtotal([
        { key: "a", productId: "a", title: "A", quantity: 2, unitPrice: 5 },
      ]),
    ).toBe(10);
  });

  it("registers mobile client in touch target consumers", () => {
    expect(POS_TOUCH_TARGET_CONSUMERS).toContain("components/pos/pos-mobile-client.tsx");
  });
});
