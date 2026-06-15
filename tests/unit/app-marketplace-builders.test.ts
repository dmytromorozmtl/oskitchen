import { describe, expect, it } from "vitest";

import {
  buildAppMarketplaceDashboard,
  listingFromRegistryRow,
  mapRegistryStatusToListing,
} from "@/lib/platform/app-marketplace-builders";

describe("app marketplace builders", () => {
  it("maps registry statuses", () => {
    expect(mapRegistryStatusToListing("IN_REVIEW")).toBe("in_review");
    expect(mapRegistryStatusToListing("PUBLISHED")).toBe("published");
  });

  it("includes 70/30 revenue share on listings", () => {
    const listing = listingFromRegistryRow({
      id: "1",
      clientId: "test-app",
      name: "Test",
      publisher: "Acme",
      description: "Desc",
      status: "IN_REVIEW",
      allowedScopes: ["read:orders"],
      submittedAt: new Date(),
      reviewedAt: null,
    });
    expect(listing.developerSharePercent).toBe(70);
    expect(listing.platformSharePercent).toBe(30);
  });

  it("builds dashboard summary", () => {
    const dash = buildAppMarketplaceDashboard({
      publishedApps: [],
      mySubmissions: [],
      reviewQueue: [],
      canReview: false,
    });
    expect(dash.revenueShare.developerPercent).toBe(70);
    expect(dash.revenueShare.summary).toContain("70%");
  });
});
