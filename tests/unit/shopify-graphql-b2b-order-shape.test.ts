import { describe, expect, it } from "vitest";

import { attachShopifyGraphqlPurchasingEntityToRawOrder, normalizeShopifyGraphqlB2bOrderShape } from "@/lib/integrations/shopify-graphql-b2b-order-shape";

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
    expect(attachShopifyGraphqlPurchasingEntityToRawOrder(node)).toEqual(node);
  });

  it("maps GraphQL poNumber and paymentTerms to REST keys", () => {
    const shaped = normalizeShopifyGraphqlB2bOrderShape({
      poNumber: "PO-42",
      paymentTerms: { paymentTermsName: "Net 30", dueInDays: 30 },
    });
    expect(shaped.po_number).toBe("PO-42");
    expect(shaped.payment_terms).toMatchObject({ paymentTermsName: "Net 30" });
  });
});
