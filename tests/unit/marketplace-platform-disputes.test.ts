import { describe, expect, it } from "vitest";

import {
  disputeReasonLabel,
  disputeStatusLabel,
  parseDisputeResolution,
  serializeDisputeResolution,
} from "@/lib/marketplace/dispute-types";
import {
  parsePlatformDisputeAdminFilters,
  platformDisputeAdminFiltersToQuery,
} from "@/lib/platform/marketplace-dispute-admin-filters";

describe("platform marketplace dispute resolution", () => {
  it("parses dispute admin filters", () => {
    const filters = parsePlatformDisputeAdminFilters({
      status: "ADMIN_REVIEW",
      reason: "DAMAGED",
      dateFrom: "2026-06-01",
      dateTo: "2026-06-30",
      q: "Metro",
      page: "2",
    });
    expect(filters).toMatchObject({
      status: "ADMIN_REVIEW",
      reason: "DAMAGED",
      dateFrom: "2026-06-01",
      dateTo: "2026-06-30",
      q: "Metro",
      page: 2,
    });
  });

  it("serializes filters to query params", () => {
    expect(
      platformDisputeAdminFiltersToQuery({
        status: "OPEN",
        reason: "WRONG_ITEM",
        dateFrom: "2026-06-01",
        q: "PO-100",
        page: 3,
        pageSize: 20,
      }),
    ).toEqual({
      status: "OPEN",
      reason: "WRONG_ITEM",
      dateFrom: "2026-06-01",
      q: "PO-100",
      page: "3",
    });
  });

  it("labels dispute enums for UI", () => {
    expect(disputeStatusLabel("ADMIN_REVIEW")).toBe("Admin Review");
    expect(disputeReasonLabel("NOT_AS_DESCRIBED")).toBe("Not As Described");
  });

  it("stores resolution history as JSON", () => {
    const first = serializeDisputeResolution(null, {
      decision: "refund",
      buyerAmount: 100,
      vendorAmount: 0,
      notes: "Full refund approved",
      resolvedById: "admin-1",
      resolvedByEmail: "admin@test",
      resolvedAt: "2026-06-02T10:00:00.000Z",
    });
    const parsed = parseDisputeResolution(first);
    expect(parsed?.current.decision).toBe("refund");

    const second = serializeDisputeResolution(first, {
      decision: "split",
      buyerAmount: 50,
      vendorAmount: 50,
      notes: "Adjusted split",
      resolvedById: "admin-2",
      resolvedByEmail: null,
      resolvedAt: "2026-06-02T11:00:00.000Z",
    });
    const withHistory = parseDisputeResolution(second);
    expect(withHistory?.history).toHaveLength(1);
    expect(withHistory?.current.decision).toBe("split");
  });
});
