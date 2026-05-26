import { describe, expect, it } from "vitest";

import { getIntegrationActionAvailability } from "@/lib/integrations/integration-action-availability";

describe("getIntegrationActionAvailability", () => {
  it("disables webhook replay until server action is registered", () => {
    const a = getIntegrationActionAvailability("SHOPIFY", "webhook_replay", {});
    expect(a.available).toBe(false);
    expect(a.disabledTooltip).toMatch(/Webhook activity table|Platform/i);
  });

  it("enables replay only when hasReplayServerAction is true", () => {
    const a = getIntegrationActionAvailability("SHOPIFY", "webhook_replay", { hasReplayServerAction: true });
    expect(a.available).toBe(true);
  });
});
