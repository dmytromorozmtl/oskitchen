import { describe, expect, it } from "vitest";

import { buildCapabilityRows } from "@/lib/capabilities/capability-matrix";
import type { ServerEnv } from "@/lib/env";

const minimalEnv = {} as unknown as ServerEnv;

describe("buildCapabilityRows", () => {
  it("marks SMS as NOT_AVAILABLE", () => {
    const rows = buildCapabilityRows(minimalEnv);
    const sms = rows.find((r) => r.id === "sms");
    expect(sms?.status).toBe("NOT_AVAILABLE");
  });

  it("marks POS offline as BETA", () => {
    const rows = buildCapabilityRows(minimalEnv);
    const pos = rows.find((r) => r.id === "pos_offline");
    expect(pos?.status).toBe("BETA");
  });

  it("marks Stripe async billing webhooks as DESIGN_READY", () => {
    const rows = buildCapabilityRows(minimalEnv);
    const row = rows.find((r) => r.id === "stripe_async_billing");
    expect(row?.status).toBe("DESIGN_READY");
  });
});
