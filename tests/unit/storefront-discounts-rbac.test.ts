import { beforeEach, describe, expect, it, vi } from "vitest";

const requireManageStorefrontRow = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());

vi.mock("@/lib/storefront/require-admin-storefront", () => ({
  requireManageStorefrontRow,
}));
vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    storefrontDiscount: {
      create: vi.fn().mockResolvedValue({ id: "disc-1" }),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createStorefrontDiscountAction } from "@/actions/storefront-discounts";

describe("storefront discounts RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({ sessionUser: { id: "owner-1" }, userId: "owner-1" });
    requireManageStorefrontRow.mockResolvedValue({
      access: { storefront: { id: "sf-1", storeSlug: "demo" } },
      sf: { id: "sf-1", storeSlug: "demo" },
    });
  });

  it("requires storefront.manage row before creating a discount", async () => {
    const form = new FormData();
    form.set("code", "SAVE10");
    form.set("kind", "PERCENT_OFF");
    form.set("percentOff", "10");

    const result = await createStorefrontDiscountAction(form);

    expect(result).toEqual({ ok: true });
    expect(requireManageStorefrontRow).toHaveBeenCalledWith(
      { id: true, storeSlug: true },
      { operation: "storefront.discounts" },
    );
  });

  it("surfaces permission errors from requireManageStorefrontRow", async () => {
    requireManageStorefrontRow.mockRejectedValue(new Error("You do not have permission for this action."));

    const form = new FormData();
    form.set("code", "SAVE10");
    form.set("kind", "PERCENT_OFF");
    form.set("percentOff", "10");

    const result = await createStorefrontDiscountAction(form);

    expect(result).toEqual({ error: "You do not have permission for this action." });
  });
});
