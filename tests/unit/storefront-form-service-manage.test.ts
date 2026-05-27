import { beforeEach, describe, expect, it, vi } from "vitest";

const requireManageStorefrontRow = vi.hoisted(() => vi.fn());

vi.mock("@/lib/storefront/require-admin-storefront", () => ({
  requireManageStorefrontRow,
}));

import { getManageStorefrontForSession } from "@/services/storefront/storefront-form-service";

describe("getManageStorefrontForSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the active storefront when manage row resolves", async () => {
    requireManageStorefrontRow.mockResolvedValue({
      sf: { id: "sf-1", storeSlug: "demo" },
    });

    const res = await getManageStorefrontForSession("storefront.forms.create");

    expect(res).toEqual({ id: "sf-1", storeSlug: "demo" });
    expect(requireManageStorefrontRow).toHaveBeenCalledWith(
      { id: true, storeSlug: true },
      { operation: "storefront.forms.create" },
    );
  });

  it("returns an error when manage row is denied", async () => {
    requireManageStorefrontRow.mockRejectedValue(
      new Error("You do not have permission to perform this action."),
    );

    const res = await getManageStorefrontForSession("storefront.forms.create");

    expect(res).toEqual({ error: "You do not have permission to perform this action." });
  });
});
