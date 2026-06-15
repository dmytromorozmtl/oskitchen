import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  getServerEnv: () => ({
    STRIPE_SECRET_KEY: "",
    STRIPE_WEBHOOK_SECRET: "",
    RESEND_API_KEY: "",
    RESEND_FROM_EMAIL: "",
    GOOGLE_MAPS_API_KEY: "",
    OPENAI_API_KEY: "",
  }),
}));

import { describeIntegrationConnectionHealth } from "@/lib/integrations/integration-connection-health";

describe("describeIntegrationConnectionHealth", () => {
  it("never shows green OK for roadmap providers", () => {
    const r = describeIntegrationConnectionHealth({
      provider: "doordash",
      connectionStatus: "ACTIVE",
      hasCredentials: true,
      lastHealthCheckOk: true,
    });
    expect(r.truthLabel).toBe("PLACEHOLDER");
    expect(r.showGreenOk).toBe(false);
  });

  it("marks Woo as configured BETA without verified green when no check", () => {
    const r = describeIntegrationConnectionHealth({
      provider: "woocommerce",
      connectionStatus: "ACTIVE",
      hasCredentials: true,
    });
    expect(r.headline).toContain("BETA");
    expect(r.showGreenOk).toBe(false);
  });

  it("requires auth when credentials missing", () => {
    const r = describeIntegrationConnectionHealth({
      provider: "shopify",
      connectionStatus: "NEEDS_AUTH",
      hasCredentials: false,
    });
    expect(r.truthLabel).toBe("NEEDS_AUTH");
    expect(r.showGreenOk).toBe(false);
  });
});
