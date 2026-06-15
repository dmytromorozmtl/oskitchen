import { describe, expect, it } from "vitest";

import { EDGE_SYNC_SLO_P95_MS } from "@/services/storefront/storefront-edge-sync-slo-service";

describe("edge sync SLO constants", () => {
  it("target is 60 seconds", () => {
    expect(EDGE_SYNC_SLO_P95_MS).toBe(60_000);
  });
});
