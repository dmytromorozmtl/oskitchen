import { describe, expect, it } from "vitest";

import {
  mapCountryToCapitalRegion,
  resetCapitalPartnersConfigCache,
  listLenderOfferPartners,
} from "@/lib/commercial/capital-partners";

describe("capital-multi-lender region helpers", () => {
  it("maps kitchen country to capital region codes", () => {
    expect(mapCountryToCapitalRegion("United States")).toBe("US");
    expect(mapCountryToCapitalRegion("Canada")).toBe("CA");
    expect(mapCountryToCapitalRegion("United Kingdom")).toBe("UK");
    expect(mapCountryToCapitalRegion("Germany")).toBe("EU");
    expect(mapCountryToCapitalRegion(null)).toBe("US");
  });

  it("filters lender partners by region and lifecycle status", () => {
    resetCapitalPartnersConfigCache();
    const usPartners = listLenderOfferPartners({ region: "US" });
    expect(usPartners.some((partner) => partner.slug === "pilot-rbf-partner")).toBe(true);
    expect(usPartners.some((partner) => partner.slug === "pilot-equipment-lender-ca")).toBe(false);

    const caPartners = listLenderOfferPartners({ region: "CA" });
    expect(caPartners.some((partner) => partner.slug === "pilot-equipment-lender-ca")).toBe(true);

    const ukPartners = listLenderOfferPartners({ region: "UK" });
    expect(ukPartners.some((partner) => partner.slug === "pilot-working-capital-uk")).toBe(true);
    expect(ukPartners[0]?.offerLifecycleStatus).toBe("live");
  });
});
