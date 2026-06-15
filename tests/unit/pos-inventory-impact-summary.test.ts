import { describe, expect, it } from "vitest";

import { summarizePosInventoryImpactStatuses } from "@/services/inventory/pos-inventory-impact-query-service";

describe("summarizePosInventoryImpactStatuses", () => {
  it("counts applied, pending, and other statuses", () => {
    expect(
      summarizePosInventoryImpactStatuses([
        "APPLIED",
        "APPLIED",
        "PENDING_CONFIGURATION",
        "UNKNOWN",
      ]),
    ).toEqual({
      total: 4,
      applied: 2,
      pending: 1,
      other: 1,
    });
  });
});
