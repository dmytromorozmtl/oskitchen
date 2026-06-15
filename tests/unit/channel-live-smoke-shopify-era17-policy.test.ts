import { describe, expect, it } from "vitest";

import {
  CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_POLICY_ID,
  CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_PROOF_STATUS,
  CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_SHOPIFY_PROVIDER,
} from "@/lib/integrations/channel-live-smoke-shopify-era17-policy";

describe("channel live smoke shopify era17 policy", () => {
  it("locks era17 Shopify live smoke policy id", () => {
    expect(CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_POLICY_ID).toBe(
      "era17-channel-live-smoke-shopify-v1",
    );
  });

  it("awaits live credentials with shopify provider", () => {
    expect(CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_PROOF_STATUS).toBe("awaiting_live_credentials");
    expect(CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_SHOPIFY_PROVIDER).toBe("shopify");
  });
});
