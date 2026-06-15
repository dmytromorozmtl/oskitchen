import { describe, expect, it } from "vitest";

import {
  CHANNEL_LIVE_SMOKE_ERA16_IN_DEFAULT_CI,
  CHANNEL_LIVE_SMOKE_ERA16_NPM_SCRIPT,
  CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID,
  CHANNEL_LIVE_SMOKE_ERA16_PILOT_RUNBOOK_STEPS,
} from "@/lib/integrations/channel-live-smoke-era16-policy";

describe("channel live smoke era16 policy", () => {
  it("locks era16 live channel smoke policy id", () => {
    expect(CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID).toBe("era16-channel-live-smoke-v1");
    expect(CHANNEL_LIVE_SMOKE_ERA16_NPM_SCRIPT).toBe("smoke:woo-shopify-live");
    expect(CHANNEL_LIVE_SMOKE_ERA16_IN_DEFAULT_CI).toBe(false);
  });

  it("documents honest pilot runbook steps", () => {
    expect(CHANNEL_LIVE_SMOKE_ERA16_PILOT_RUNBOOK_STEPS.join(" ")).toContain(
      "SKIPPED WITH REASON",
    );
    expect(CHANNEL_LIVE_SMOKE_ERA16_PILOT_RUNBOOK_STEPS.join(" ")).toContain(
      "channel-live-smoke-summary",
    );
  });
});
