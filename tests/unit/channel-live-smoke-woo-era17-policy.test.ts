import { describe, expect, it } from "vitest";

import {
  CHANNEL_LIVE_SMOKE_WOO_ERA17_POLICY_ID,
  CHANNEL_LIVE_SMOKE_WOO_ERA17_PROOF_STATUS,
  CHANNEL_LIVE_SMOKE_WOO_ERA17_WOO_PROVIDER,
} from "@/lib/integrations/channel-live-smoke-woo-era17-policy";

describe("channel live smoke woo era17 policy", () => {
  it("locks era17 Woo live smoke policy id", () => {
    expect(CHANNEL_LIVE_SMOKE_WOO_ERA17_POLICY_ID).toBe("era17-channel-live-smoke-woo-v1");
  });

  it("awaits live credentials with woocommerce provider", () => {
    expect(CHANNEL_LIVE_SMOKE_WOO_ERA17_PROOF_STATUS).toBe("awaiting_live_credentials");
    expect(CHANNEL_LIVE_SMOKE_WOO_ERA17_WOO_PROVIDER).toBe("woocommerce");
  });
});
