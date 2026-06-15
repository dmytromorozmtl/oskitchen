import { describe, expect, it } from "vitest";

import {
  b2bCompanyNamesMatch,
  b2bEmailsMatch,
  normalizeB2bCompanyName,
} from "@/lib/commercial/shopify-market-b2b-guard";
import {
  buildB2bCompanyImportRow,
  computeShopifyB2bCompanyHash,
  parseShopifyB2bCompaniesGraphQLResponse,
  suggestCompanyAccountIdForShopifyCompany,
} from "@/services/integrations/shopify-market-b2b-service";

describe("shopify-market-b2b-guard helpers", () => {
  it("normalizes company names for matching", () => {
    expect(normalizeB2bCompanyName("  Acme Corp.  ")).toBe("acme corp");
    expect(b2bCompanyNamesMatch("Acme Corp", "ACME CORP.")).toBe(true);
    expect(b2bEmailsMatch("Billing@Acme.com", "billing@acme.com")).toBe(true);
  });

  it("parses Shopify B2B companies GraphQL response", () => {
    const result = parseShopifyB2bCompaniesGraphQLResponse({
      data: {
        companies: {
          edges: [
            {
              node: {
                id: "gid://shopify/Company/1",
                name: "Office Lunch Co",
                externalId: "OLC-001",
                mainContact: { customer: { email: "billing@office.com" } },
                locations: {
                  edges: [
                    {
                      node: {
                        id: "gid://shopify/CompanyLocation/1",
                        shippingAddress: { country: "US" },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.companies).toHaveLength(1);
    expect(result.companies[0]?.name).toBe("Office Lunch Co");
    expect(result.companies[0]?.locationCountries).toEqual(["US"]);
  });

  it("suggests KitchenOS company account by name or email", () => {
    const shopifyCompany = {
      shopifyCompanyId: "gid://shopify/Company/1",
      name: "Metro Catering",
      externalId: null,
      mainContactEmail: "ap@metro.com",
      locationCount: 1,
      locationCountries: ["CA"],
    };

    const byName = suggestCompanyAccountIdForShopifyCompany({
      shopifyCompany,
      companyAccounts: [{ id: "acc-1", name: "Metro Catering", billingEmail: null }],
    });
    expect(byName).toBe("acc-1");

    const byEmail = suggestCompanyAccountIdForShopifyCompany({
      shopifyCompany: { ...shopifyCompany, name: "Different Name" },
      companyAccounts: [{ id: "acc-2", name: "Other Co", billingEmail: "ap@metro.com" }],
    });
    expect(byEmail).toBe("acc-2");
  });

  it("builds stable import row hash", () => {
    const row = buildB2bCompanyImportRow({
      shopifyCompany: {
        shopifyCompanyId: "gid://shopify/Company/1",
        name: "Test Co",
        externalId: "x",
        mainContactEmail: "a@b.com",
        locationCount: 2,
        locationCountries: ["US", "CA"],
      },
      suggestedCompanyAccountId: "acc-1",
      importedAt: "2026-06-01T00:00:00.000Z",
    });

    expect(row.companyHash).toBe(
      computeShopifyB2bCompanyHash({
        name: "Test Co",
        externalId: "x",
        mainContactEmail: "a@b.com",
        locationCountries: ["US", "CA"],
      }),
    );
  });
});
