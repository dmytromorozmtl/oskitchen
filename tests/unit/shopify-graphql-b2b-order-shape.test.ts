import { describe, expect, it } from "vitest";

import { attachShopifyGraphqlPurchasingEntityToRawOrder } from "@/lib/integrations/shopify-graphql-b2b-order-shape";

describe("shopify-graphql-b2b-order-shape", () => {
  it("maps GraphQL purchasingEntity to REST company block", () => {
    const shaped = attachShopifyGraphqlPurchasingEntityToRawOrder({
      id: "gid://shopify/Order/1001",
      purchasingEntity: {
        __typename: "PurchasingCompany",
        company: { id: "gid://shopify/Company/1", name: "Office Lunch Co" },
        location: { id: "gid://shopify/CompanyLocation/9", name: "HQ" },
      },
    });

    expect(shaped.company).toMatchObject({
      id: "1",
      location_id: "9",
      name: "Office Lunch Co",
      location_name: "HQ",
    });
  });

  it("leaves REST company block unchanged", () => {
    const node = { company: { id: 1, location_id: 9 } };
    expect(attachShopifyGraphqlPurchasingEntityToRawOrder(node)).toBe(node);
  });
});
