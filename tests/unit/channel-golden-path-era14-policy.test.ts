import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CHANNEL_GOLDEN_PATH_ERA14_HONEST_SCOPE,
  CHANNEL_GOLDEN_PATH_ERA14_POLICY_ID,
  CHANNEL_GOLDEN_PATH_ERA14_STAGES,
  findOrderHubVisibilityMarkerGaps,
  findWebhookProcessorsMissingOnDisk,
} from "@/lib/integrations/channel-golden-path-era14-policy";

const ROOT = process.cwd();

function readSource(relativeModule: string): string {
  return readFileSync(join(ROOT, relativeModule), "utf8");
}

describe("channel golden path era14 policy", () => {
  it("locks era14 channel golden path recert policy id", () => {
    expect(CHANNEL_GOLDEN_PATH_ERA14_POLICY_ID).toBe(
      "era14-channel-golden-path-recert-v1",
    );
    expect(CHANNEL_GOLDEN_PATH_ERA14_STAGES).toContain("order_hub_visibility");
    expect(CHANNEL_GOLDEN_PATH_ERA14_HONEST_SCOPE.kitchenOrderAutoCreateFromWebhook).toBe(
      false,
    );
    expect(CHANNEL_GOLDEN_PATH_ERA14_HONEST_SCOPE.stagingSmokeNotInDefaultCi).toBe(true);
  });

  it("keeps webhook processors and fixtures on disk", () => {
    const gaps = findWebhookProcessorsMissingOnDisk((rel) =>
      existsSync(join(ROOT, rel)),
    );
    expect(gaps).toEqual([]);
    expect(existsSync(join(ROOT, "tests/fixtures/channel-golden-path/woo-order-minimal.json"))).toBe(
      true,
    );
    expect(
      existsSync(join(ROOT, "tests/fixtures/channel-golden-path/shopify-order-minimal.json")),
    ).toBe(true);
  });

  it("recertifies order hub visibility wiring after era12", () => {
    const gaps = findOrderHubVisibilityMarkerGaps(readSource);
    expect(gaps).toEqual([]);
  });
});
