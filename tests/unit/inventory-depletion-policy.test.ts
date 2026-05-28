import { describe, expect, it } from "vitest";

import {
  INVENTORY_DEPLETION_CERTIFIED_CHANNELS,
  INVENTORY_DEPLETION_NON_CERTIFIED_CHANNELS,
  INVENTORY_DEPLETION_POLICY_ID,
  INVENTORY_DEPLETION_UNIFIED_STOCK_CLAIM_ALLOWED,
  isInventoryDepletionCertifiedForChannel,
} from "@/lib/inventory/inventory-depletion-policy";

describe("inventory depletion channel policy", () => {
  it("certifies POS only (Era 4 Cycle 1)", () => {
    expect(INVENTORY_DEPLETION_POLICY_ID).toBe("era4-pos-only-v1");
    expect(INVENTORY_DEPLETION_CERTIFIED_CHANNELS).toEqual(["pos"]);
    expect(INVENTORY_DEPLETION_NON_CERTIFIED_CHANNELS).toContain("storefront");
    expect(INVENTORY_DEPLETION_UNIFIED_STOCK_CLAIM_ALLOWED).toBe(false);
  });

  it("classifies channels consistently", () => {
    expect(isInventoryDepletionCertifiedForChannel("pos")).toBe(true);
    for (const channel of INVENTORY_DEPLETION_NON_CERTIFIED_CHANNELS) {
      expect(isInventoryDepletionCertifiedForChannel(channel)).toBe(false);
    }
  });
});
