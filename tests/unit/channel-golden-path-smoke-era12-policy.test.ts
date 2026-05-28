import { describe, expect, it } from "vitest";

import {
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_HONEST_SCOPE,
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_IN_DEFAULT_CI,
  CHANNEL_GOLDEN_PATH_ERA12_SMOKE_POLICY_ID,
} from "@/lib/integrations/channel-golden-path-smoke-era12-policy";

describe("channel golden path smoke era12 policy", () => {
  it("locks era12 staging smoke policy id and honest scope", () => {
    expect(CHANNEL_GOLDEN_PATH_ERA12_SMOKE_POLICY_ID).toBe(
      "era12-channel-golden-path-smoke-v1",
    );
    expect(CHANNEL_GOLDEN_PATH_ERA12_SMOKE_IN_DEFAULT_CI).toBe(false);
    expect(CHANNEL_GOLDEN_PATH_ERA12_SMOKE_HONEST_SCOPE.kitchenOrderAutoCreateFromWebhook).toBe(
      false,
    );
    expect(CHANNEL_GOLDEN_PATH_ERA12_SMOKE_HONEST_SCOPE.notInDefaultCi).toBe(true);
  });
});
