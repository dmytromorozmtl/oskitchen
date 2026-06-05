import { describe, expect, it } from "vitest";

import {
  augmentPilotIntegrationHealthStripWithBetaEnv,
  buildPilotIntegrationHealthBetaEnvFootnote,
} from "@/lib/integrations/pilot-integration-health-beta-env-era18";
import { buildPilotIntegrationHealthStripModel } from "@/lib/integrations/pilot-integration-health-strip-era18";

function baseModel() {
  return buildPilotIntegrationHealthStripModel({
    summary: {
      overall: "healthy",
      healthyCount: 1,
      degradedCount: 0,
      downCount: 0,
      stripeConfigured: true,
      emailConfigured: true,
    },
    failedWebhookCount: 0,
    cards: [],
  });
}

describe("pilot integration health beta env footnote", () => {
  it("builds footnote for eighteen BETA integrations", () => {
    const footnote = buildPilotIntegrationHealthBetaEnvFootnote({});
    expect(footnote.total).toBe(7);
    expect(footnote.optionalCount).toBeGreaterThanOrEqual(1);
    expect(footnote.href).toBe("/dashboard/integrations/health");
    expect(footnote.headline).toContain("BETA");
  });

  it("reports platform-ready when all required env vars are set", () => {
    const footnote = buildPilotIntegrationHealthBetaEnvFootnote({
      SQUARE_ACCESS_TOKEN: "x",
      SQUARE_LOCATION_ID: "y",
      TOAST_ACCESS_TOKEN: "x",
      TOAST_RESTAURANT_GUID: "y",
      CLOVER_ACCESS_TOKEN: "x",
      CLOVER_MERCHANT_ID: "y",
      LIGHTSPEED_ACCESS_TOKEN: "x",
      LIGHTSPEED_BUSINESS_LOCATION_ID: "y",
      DOORDASH_API_KEY: "x",
      DOORDASH_MERCHANT_ID: "y",
      DOORDASH_WEBHOOK_SECRET: "x",
      GRUBHUB_API_KEY: "x",
      GRUBHUB_MERCHANT_ID: "y",
      GRUBHUB_WEBHOOK_SECRET: "x",
      UBER_EATS_CLIENT_ID: "x",
      UBER_EATS_CLIENT_SECRET: "x",
      UBER_EATS_STORE_ID: "x",
      UBER_EATS_WEBHOOK_SECRET: "x",
      QUICKBOOKS_CLIENT_ID: "x",
      XERO_CLIENT_ID: "x",
      SEVENSHIFTS_API_KEY: "x",
      SEVENSHIFTS_COMPANY_ID: "x",
      HOMEBASE_API_KEY: "x",
      HOMEBASE_LOCATION_ID: "x",
      KLAVIYO_API_KEY: "x",
      MAILCHIMP_API_KEY: "x",
      MAILCHIMP_LIST_ID: "x",
      RESY_API_KEY: "x",
      RESY_VENUE_ID: "x",
      OPENTABLE_API_KEY: "x",
      OPENTABLE_RID: "x",
      UBER_DIRECT_CUSTOMER_ID: "x",
      UBER_DIRECT_CLIENT_ID: "x",
      UBER_DIRECT_CLIENT_SECRET: "x",
      GOOGLE_FORMS_SHEET_ACCESS_TOKEN: "x",
      GOOGLE_FORMS_SHEET_ID: "x",
    });
    expect(footnote.readyCount + footnote.optionalCount).toBe(7);
    expect(footnote.headline).toContain("platform-ready");
  });

  it("augments strip model with beta env footnote", () => {
    const augmented = augmentPilotIntegrationHealthStripWithBetaEnv(baseModel(), {});
    expect(augmented.betaEnvFootnote.total).toBe(7);
    expect(augmented.overall).toBe("healthy");
  });
});
