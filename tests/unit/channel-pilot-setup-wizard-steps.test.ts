import { describe, expect, it } from "vitest";

import {
  CHANNEL_PILOT_SETUP_LEGACY_STEP_COUNT,
  CHANNEL_PILOT_SETUP_SHOPIFY_STEPS,
  CHANNEL_PILOT_SETUP_STREAMLINED_STEP_COUNT,
  CHANNEL_PILOT_SETUP_WOO_STEPS,
  evaluateChannelPilotSetupProgress,
  pilotSetupStepReductionPercent,
  stepsForProvider,
} from "@/lib/integrations/channel-pilot-setup-wizard-steps";

describe("channel pilot setup wizard steps", () => {
  it("defines five streamlined steps per provider", () => {
    expect(CHANNEL_PILOT_SETUP_WOO_STEPS).toHaveLength(5);
    expect(CHANNEL_PILOT_SETUP_SHOPIFY_STEPS).toHaveLength(5);
    expect(stepsForProvider("woocommerce")).toBe(CHANNEL_PILOT_SETUP_WOO_STEPS);
    expect(stepsForProvider("shopify")).toBe(CHANNEL_PILOT_SETUP_SHOPIFY_STEPS);
  });

  it("reduces legacy nine-step playbook to five wizard steps", () => {
    expect(CHANNEL_PILOT_SETUP_LEGACY_STEP_COUNT).toBe(9);
    expect(CHANNEL_PILOT_SETUP_STREAMLINED_STEP_COUNT).toBe(5);
    expect(pilotSetupStepReductionPercent()).toBeGreaterThanOrEqual(40);
  });

  it("tracks progress from connection and certification state", () => {
    const empty = evaluateChannelPilotSetupProgress({
      provider: "woocommerce",
      hasConnection: false,
      hasCredentials: false,
      hasWebhookSecret: false,
      hasStoreIdentity: false,
      certification: null,
    });
    expect(empty.completedCount).toBe(0);
    expect(empty.currentStepId).toBe("save_credentials");

    const credsOnly = evaluateChannelPilotSetupProgress({
      provider: "woocommerce",
      hasConnection: true,
      hasCredentials: true,
      hasWebhookSecret: true,
      hasStoreIdentity: true,
      certification: null,
    });
    expect(credsOnly.completedCount).toBe(2);
    expect(credsOnly.steps.find((s) => s.id === "save_credentials")?.complete).toBe(true);
    expect(credsOnly.steps.find((s) => s.id === "configure_webhooks")?.complete).toBe(true);
    expect(credsOnly.currentStepId).toBe("test_connection");

    const pilotReady = evaluateChannelPilotSetupProgress({
      provider: "shopify",
      hasConnection: true,
      hasCredentials: true,
      hasWebhookSecret: true,
      hasStoreIdentity: true,
      certification: {
        provider: "shopify",
        lastRunAt: new Date().toISOString(),
        overall: "PASS",
        checks: [
          { id: "rest_api_reachable", label: "API", status: "pass", message: "ok" },
          { id: "recent_valid_webhooks", label: "Webhooks", status: "pass", message: "ok" },
        ],
        productStatus: "BETA",
      },
    });
    expect(pilotReady.pilotReady).toBe(true);
    expect(pilotReady.completedCount).toBe(5);
    expect(pilotReady.currentStepId).toBeNull();
  });
});
