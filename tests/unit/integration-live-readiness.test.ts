import { describe, expect, it } from "vitest";

import {
  LIVE_CAPABLE_INTEGRATION_PROVIDERS,
  channelByKey,
  providerCountsTowardLiveReadiness,
} from "@/lib/channels/channel-registry";
import { resolveChannel } from "@/lib/channels/channel-runtime";
import { integrationLaunchLabel } from "@/lib/integration-launch-status";

describe("integration live readiness guards", () => {
  it("does not mark partner-gated placeholder connections as live ready", () => {
    const result = integrationLaunchLabel({
      status: "CONNECTED",
      partnerGate: true,
      supportsLiveMode: false,
      isPlaceholder: true,
    });

    expect(result.label).toBe("partner_access_required");
  });

  it("keeps uber direct channel status blocked from live even with a connected row", () => {
    const def = channelByKey("uber-direct");
    expect(def).toBeDefined();

    const resolved = resolveChannel(
      def!,
      [
        {
          provider: "UBER_DIRECT",
          status: "CONNECTED",
          lastError: null,
        } as never,
      ],
      false,
    );

    expect(resolved.effectiveStatus).toBe("PARTNER_ACCESS_REQUIRED");
    expect(resolved.nextAction).toBe("Complete partner checklist");
  });

  it("counts only real live-capable providers toward generic readiness", () => {
    expect(providerCountsTowardLiveReadiness("SHOPIFY")).toBe(true);
    expect(providerCountsTowardLiveReadiness("WOOCOMMERCE")).toBe(true);
    expect(providerCountsTowardLiveReadiness("UBER_EATS")).toBe(true);
    expect(providerCountsTowardLiveReadiness("UBER_DIRECT")).toBe(false);
    expect(providerCountsTowardLiveReadiness("DOORDASH")).toBe(true);
    expect(LIVE_CAPABLE_INTEGRATION_PROVIDERS).not.toContain("UBER_DIRECT");
    expect(LIVE_CAPABLE_INTEGRATION_PROVIDERS).toContain("UBER_EATS");
    expect(LIVE_CAPABLE_INTEGRATION_PROVIDERS).toContain("DOORDASH");
  });
});
