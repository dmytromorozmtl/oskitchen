import { describe, expect, it } from "vitest";

import { buildIntegrationHealthCommercialInflectionBanner } from "@/lib/integrations/integration-health-commercial-inflection-era28";
import { enrichIntegrationHealthChannelCardsWithTrustLayer } from "@/lib/integrations/integration-health-trust-layer-era20";
describe("integration-health-commercial-inflection-era28", () => {
  it("builds banner with registry honesty line", () => {
    const banner = buildIntegrationHealthCommercialInflectionBanner();
    expect(banner?.milestone).toBe("p0_ops_vault_blocked");
    expect(banner?.registryHonestyLine).toContain("LIVE=0");
    expect(banner?.nextActions[0]?.href).toContain("commercial-inflection-readiness");
  });

  it("enriches trust layer with commercial inflection slice", () => {
    const enriched = enrichIntegrationHealthChannelCardsWithTrustLayer(
      {
        policyId: "era19-integration-health-channel-cards-v1",
        loadedAt: "2026-05-28T00:00:00.000Z",
        headline: "Test headline",
        cards: [],
      },
      null,
    );
    expect(enriched.commercialInflection).not.toBeNull();
    expect(enriched.headline).toContain("Market inflection blocked");
  });
});
