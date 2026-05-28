import { describe, expect, it } from "vitest";

import {
  PRODUCT_MAPPING_FOCUS_ERA18_BACKLOG_ID,
  PRODUCT_MAPPING_FOCUS_ERA18_POLICY_ID,
  PRODUCT_MAPPING_FOCUS_ERA18_PROOF_STATUS,
} from "@/lib/product-mapping/product-mapping-focus-era18-policy";
import {
  buildProductMappingFocusSnapshot,
  pickProductMappingAttentionItems,
  resolveProductMappingBlockedOrdersNextAction,
  resolveProductMappingRowNextAction,
} from "@/lib/product-mapping/product-mapping-focus-era18";

describe("product-mapping-focus-era18 policy", () => {
  it("registers era18 product mapping focus proof", () => {
    expect(PRODUCT_MAPPING_FOCUS_ERA18_POLICY_ID).toBe("era18-product-mapping-focus-v1");
    expect(PRODUCT_MAPPING_FOCUS_ERA18_PROOF_STATUS).toBe("product_mapping_focus_attention_wired");
    expect(PRODUCT_MAPPING_FOCUS_ERA18_BACKLOG_ID).toBe("KOS-E18-038");
  });
});

describe("pickProductMappingAttentionItems", () => {
  it("prioritizes blocked order lines and conflicts", () => {
    const items = pickProductMappingAttentionItems(
      buildProductMappingFocusSnapshot({
        unmapped: 5,
        suggested: 2,
        needsReview: 1,
        conflicts: 3,
        blockedOrderLines: 4,
        highConfidenceSuggested: 2,
      }),
    );

    expect(items[0]?.id).toBe("blocked-order-lines");
    expect(items.some((item) => item.id === "mapping-conflicts")).toBe(true);
    expect(items[0]?.tone).toBe("urgent");
  });

  it("returns empty when mapping pipeline is clear", () => {
    expect(
      pickProductMappingAttentionItems(
        buildProductMappingFocusSnapshot({
          unmapped: 0,
          suggested: 0,
          needsReview: 0,
          conflicts: 0,
          blockedOrderLines: 0,
          highConfidenceSuggested: 0,
        }),
      ),
    ).toEqual([]);
  });
});

describe("resolveProductMappingRowNextAction", () => {
  it("returns urgent pick target for unmapped rows without candidates", () => {
    expect(
      resolveProductMappingRowNextAction(
        {
          id: "map-1",
          status: "UNMAPPED",
          confidenceLabel: "NONE",
          hasCandidate: false,
        },
        "/dashboard/product-mapping/unmapped",
      ),
    ).toEqual({
      label: "Pick menu target",
      href: "/dashboard/product-mapping/unmapped#mapping-map-1",
      tone: "urgent",
    });
  });

  it("routes high-confidence suggestions to suggestions queue", () => {
    expect(
      resolveProductMappingRowNextAction({
        id: "map-2",
        status: "SUGGESTED",
        confidenceLabel: "HIGH",
        hasCandidate: true,
      }),
    ).toMatchObject({
      label: "Verify high-confidence match",
      href: "/dashboard/product-mapping/suggestions#mapping-map-2",
    });
  });

  it("returns null for approved terminal rows", () => {
    expect(
      resolveProductMappingRowNextAction({
        id: "map-3",
        status: "APPROVED",
        confidenceLabel: "HIGH",
        hasCandidate: true,
      }),
    ).toBeNull();
  });
});

describe("resolveProductMappingBlockedOrdersNextAction", () => {
  it("links to order hub failed tab when orders are blocked", () => {
    expect(resolveProductMappingBlockedOrdersNextAction(2)).toEqual({
      label: "Review blocked channel orders",
      href: "/dashboard/order-hub?tab=failed",
      tone: "urgent",
    });
  });
});
