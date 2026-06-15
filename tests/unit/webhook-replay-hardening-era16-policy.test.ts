import { describe, expect, it } from "vitest";

import {
  WEBHOOK_REPLAY_HARDENING_ERA16_HARDENED_ROUTES,
  WEBHOOK_REPLAY_HARDENING_ERA16_HONEST_SCOPE,
  WEBHOOK_REPLAY_HARDENING_ERA16_POLICY_ID,
} from "@/lib/security/webhook-replay-hardening-era16-policy";

describe("webhook replay hardening era16 policy", () => {
  it("locks era16 replay hardening policy id", () => {
    expect(WEBHOOK_REPLAY_HARDENING_ERA16_POLICY_ID).toBe(
      "era16-webhook-replay-hardening-v1",
    );
  });

  it("hardens uber direct and slack routes without overclaiming", () => {
    expect(WEBHOOK_REPLAY_HARDENING_ERA16_HARDENED_ROUTES).toEqual([
      "/api/webhooks/uber-direct",
      "/api/webhooks/slack/experiment-interactive",
    ]);
    expect(WEBHOOK_REPLAY_HARDENING_ERA16_HONEST_SCOPE.ingressDedupeForPlatformRoutes).toBe(
      true,
    );
    expect(WEBHOOK_REPLAY_HARDENING_ERA16_HONEST_SCOPE.fullReplayMonitoringOps).toBe(
      false,
    );
    expect(WEBHOOK_REPLAY_HARDENING_ERA16_HONEST_SCOPE.uberDirectStillPlaceholder).toBe(
      true,
    );
  });
});
