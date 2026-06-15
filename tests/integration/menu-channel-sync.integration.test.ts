import { describe, expect, it, vi } from "vitest";

import { syncMenuItemToPos, syncMenuItemToWebsite } from "@/services/menu/sync";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  },
}));

vi.mock("@/lib/storefront/revalidate-shopify-market-catalog", () => ({
  revalidateStorefrontCatalogForOwner: vi.fn().mockResolvedValue(undefined),
}));

const baseInput = {
  userId: "user-1",
  productId: "prod-1",
  previousMaster: {
    title: "Burger",
    description: "Tasty",
    price: 12,
    category: "MAINS",
    image: null,
    active: true,
    posVisible: true,
    storefrontVisible: true,
  },
  effective: {
    channel: "pos" as const,
    enabled: true,
    title: "Deluxe Burger",
    description: "Tasty",
    price: 13.5,
    image: null,
    category: "MAINS",
    externalId: null,
  },
};

describe("internal channel sync adapters", () => {
  it("syncs POS catalog fields", async () => {
    const { prisma } = await import("@/lib/prisma");
    const result = await syncMenuItemToPos({ ...baseInput, effective: { ...baseInput.effective, channel: "pos" } });
    expect(result.ok).toBe(true);
    expect(result.status).toBe("synced");
    expect(prisma.product.updateMany).toHaveBeenCalled();
  });

  it("syncs website catalog and revalidates storefront", async () => {
    const { revalidateStorefrontCatalogForOwner } = await import(
      "@/lib/storefront/revalidate-shopify-market-catalog"
    );
    const result = await syncMenuItemToWebsite({
      ...baseInput,
      effective: { ...baseInput.effective, channel: "website" },
    });
    expect(result.ok).toBe(true);
    expect(revalidateStorefrontCatalogForOwner).toHaveBeenCalledWith("user-1");
  });
});
