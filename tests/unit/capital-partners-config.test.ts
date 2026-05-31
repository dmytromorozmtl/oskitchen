import { describe, expect, it } from "vitest";

import {
  getCapitalPartnerBySlug,
  loadCapitalPartnersConfig,
  resetCapitalPartnersConfigCache,
  validateCapitalPartnersConfig,
} from "@/lib/commercial/capital-partners";
import { resolveCapitalPartnerOutboundHref } from "@/services/commercial/restaurant-capital-resources-service";

describe("capital-partners config", () => {
  it("loads and validates partner registry", () => {
    resetCapitalPartnersConfigCache();
    const config = loadCapitalPartnersConfig();
    expect(config.partners.length).toBeGreaterThan(3);
    expect(validateCapitalPartnersConfig(config)).toEqual([]);
    expect(config.forbiddenMarketingClaims).toContain("instant funding");
  });

  it("resolves partners by slug", () => {
    const partner = getCapitalPartnerBySlug("sba-funding-programs");
    expect(partner?.category).toBe("government");
    expect(partner?.href.startsWith("https://")).toBe(true);
  });

  it("builds audited outbound href for external partners", () => {
    expect(resolveCapitalPartnerOutboundHref("sba-funding-programs")).toContain(
      "/api/capital/partner-outbound?slug=sba-funding-programs",
    );
    expect(resolveCapitalPartnerOutboundHref("os-kitchen-attestation-waitlist")).toBe(
      "/contact-sales?topic=capital-attestation",
    );
  });
});
