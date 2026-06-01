import { describe, expect, it } from "vitest";

import {
  parsePlatformVendorAdminFilters,
  platformVendorAdminFiltersToQuery,
} from "@/lib/platform/marketplace-vendor-admin-filters";

describe("platform marketplace vendor admin filters", () => {
  it("defaults to all vendors tab with page 1", () => {
    const filters = parsePlatformVendorAdminFilters({});
    expect(filters.tab).toBe("all");
    expect(filters.page).toBe(1);
    expect(filters.pageSize).toBe(20);
  });

  it("parses queue tab and filters", () => {
    const filters = parsePlatformVendorAdminFilters({
      tab: "queue",
      status: "PENDING",
      type: "DISTRIBUTOR",
      plan: "GROWTH",
      q: "Metro",
      page: "2",
    });
    expect(filters).toMatchObject({
      tab: "queue",
      status: "PENDING",
      type: "DISTRIBUTOR",
      plan: "GROWTH",
      q: "Metro",
      page: 2,
    });
  });

  it("serializes filters to query params", () => {
    const query = platformVendorAdminFiltersToQuery({
      tab: "queue",
      status: "UNDER_REVIEW",
      type: "MANUFACTURER",
      plan: "ENTERPRISE",
      q: "Kitchen",
      page: 3,
      pageSize: 20,
    });
    expect(query).toEqual({
      tab: "queue",
      status: "UNDER_REVIEW",
      type: "MANUFACTURER",
      plan: "ENTERPRISE",
      q: "Kitchen",
      page: "3",
    });
  });
});
