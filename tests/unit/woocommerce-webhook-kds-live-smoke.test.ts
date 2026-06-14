import { describe, expect, it } from "vitest";

import {
  WOOCOMMERCE_WEBHOOK_KDS_LIVE_SMOKE_ARTIFACT,
  WOOCOMMERCE_WEBHOOK_KDS_LIVE_SMOKE_POLICY_ID,
  WOOCOMMERCE_WEBHOOK_KDS_REQUIRED_STEP_IDS,
} from "@/lib/integrations/woocommerce-webhook-kds-live-smoke-policy";

describe("woocommerce webhook KDS live smoke policy (P0-2)", () => {
  it("locks P0-2 artifact path and required chain steps", () => {
    expect(WOOCOMMERCE_WEBHOOK_KDS_LIVE_SMOKE_POLICY_ID).toBe(
      "p0-2-woocommerce-webhook-kds-live-smoke-v1",
    );
    expect(WOOCOMMERCE_WEBHOOK_KDS_LIVE_SMOKE_ARTIFACT).toBe(
      "artifacts/woocommerce-webhook-kds-live-smoke.json",
    );
    expect(WOOCOMMERCE_WEBHOOK_KDS_REQUIRED_STEP_IDS).toEqual(
      expect.arrayContaining([
        "webhook_event_persisted",
        "kitchen_task_linked",
        "kds_bump_ready",
      ]),
    );
  });
});
