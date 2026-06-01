import { describe, expect, it } from "vitest";

import {
  extractProductModerationMeta,
  type ProductModerationNote,
} from "@/services/marketplace/platform-product-moderation-service";
import {
  parsePlatformProductAdminFilters,
  platformProductAdminFiltersToQuery,
} from "@/lib/platform/marketplace-product-admin-filters";

describe("platform marketplace product moderation", () => {
  it("parses product admin filters", () => {
    const filters = parsePlatformProductAdminFilters({
      tab: "queue",
      status: "PENDING_REVIEW",
      category: "cat-1",
      q: "gloves",
      page: "2",
    });
    expect(filters).toMatchObject({
      tab: "queue",
      status: "PENDING_REVIEW",
      categoryId: "cat-1",
      q: "gloves",
      page: 2,
    });
  });

  it("serializes filters to query params", () => {
    expect(
      platformProductAdminFiltersToQuery({
        tab: "flagged",
        status: "ACTIVE",
        categoryId: "cat-2",
        q: "towel",
        page: 3,
        pageSize: 20,
      }),
    ).toEqual({
      tab: "flagged",
      status: "ACTIVE",
      category: "cat-2",
      q: "towel",
      page: "3",
    });
  });

  it("extracts moderation metadata from product attributes", () => {
    const note: ProductModerationNote = {
      at: "2026-06-02T09:00:00.000Z",
      by: "admin@test",
      action: "flag",
      note: "Misleading description",
    };
    const meta = extractProductModerationMeta({
      moderation: {
        flagged: true,
        flagReason: "Misleading description",
        notes: [note],
      },
    });
    expect(meta.flagged).toBe(true);
    expect(meta.flagReason).toBe("Misleading description");
    expect(meta.notes).toHaveLength(1);
  });
});
