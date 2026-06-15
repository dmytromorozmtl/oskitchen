import { describe, expect, it } from "vitest";

import {
  PROFIT_ENGINE_REFRESH_SECONDS,
  channelLabel,
} from "@/services/analytics/profit-engine-service";

describe("profit-engine-service", () => {
  it("refreshes every 30 seconds", () => {
    expect(PROFIT_ENGINE_REFRESH_SECONDS).toBe(30);
  });

  it("channelLabel prefers channelProvider", () => {
    expect(
      channelLabel({ channelProvider: "uber_eats", creationSource: "MANUAL" }),
    ).toBe("UBER_EATS");
  });

  it("channelLabel falls back to creation source", () => {
    expect(channelLabel({ channelProvider: null, creationSource: "STOREFRONT" })).toBe(
      "STOREFRONT",
    );
  });

  it("channelLabel defaults to in-house", () => {
    expect(channelLabel({ channelProvider: null, creationSource: null })).toBe("In-house");
  });
});
