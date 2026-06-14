import { describe, expect, it } from "vitest";

import {
  SHOPIFY_WEBHOOK_KDS_LIVE_SMOKE_ARTIFACT,
  SHOPIFY_WEBHOOK_KDS_LIVE_SMOKE_POLICY_ID,
  SHOPIFY_WEBHOOK_KDS_REQUIRED_STEP_IDS,
} from "@/lib/integrations/shopify-webhook-kds-live-smoke-policy";

describe("shopify webhook KDS live smoke policy (P0-3)", () => {
  it("locks P0-3 artifact path and required chain steps", () => {
    expect(SHOPIFY_WEBHOOK_KDS_LIVE_SMOKE_POLICY_ID).toBe(
      "p0-3-shopify-webhook-kds-live-smoke-v1",
    );
    expect(SHOPIFY_WEBHOOK_KDS_LIVE_SMOKE_ARTIFACT).toBe(
      "artifacts/shopify-webhook-kds-live-smoke.json",
    );
    expect(SHOPIFY_WEBHOOK_KDS_REQUIRED_STEP_IDS).toEqual(
      expect.arrayContaining([
        "webhook_event_persisted",
        "kitchen_task_linked",
        "kds_bump_ready",
      ]),
    );
  });
});
