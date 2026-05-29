import { describe, expect, it } from "vitest";

import { buildCommercialInflectionReadinessUiSlice } from "@/lib/commercial/commercial-inflection-readiness-ui-era28";
import { augmentPilotIntegrationHealthStripWithCommercialInflection } from "@/lib/integrations/pilot-integration-health-commercial-inflection-era28";
import { buildPilotIntegrationHealthStripModel } from "@/lib/integrations/pilot-integration-health-strip-era18";

describe("pilot-integration-health-commercial-inflection-era28", () => {
  it("augments strip headline with registry honesty", () => {
    const base = buildPilotIntegrationHealthStripModel({
      summary: {
        overall: "healthy",
        healthyCount: 1,
        degradedCount: 0,
        downCount: 0,
      },
      cards: [],
      failedWebhookCount: 0,
    });
    const augmented = augmentPilotIntegrationHealthStripWithCommercialInflection(
      base,
      buildCommercialInflectionReadinessUiSlice(),
    );
    expect(augmented.commercialInflection).not.toBeNull();
    expect(augmented.headline).toContain("Registry LIVE");
  });
});
