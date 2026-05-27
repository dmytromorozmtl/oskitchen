import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const resolveStorefrontAdminAccess = vi.hoisted(() => vi.fn());
const logRewardsPermissionDenied = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const issueStorefrontGiftCard = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));
vi.mock("@/lib/storefront/storefront-admin-access", () => ({
  resolveStorefrontAdminAccess,
}));
vi.mock("@/services/crm/rewards-permission-audit", () => ({
  logRewardsPermissionDenied,
}));
vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));
vi.mock("@/services/storefront/gift-card-service", () => ({
  issueStorefrontGiftCard,
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { issueGiftCardFormAction } from "@/actions/storefront/gift-cards";
import { canAccessStorefrontGiftCardsTab } from "@/lib/storefront/storefront-rewards-permission";
import type { PermissionKey } from "@/lib/permissions/permissions";

function granted(...keys: PermissionKey[]) {
  return new Set(keys) as ReadonlySet<PermissionKey>;
}

describe("storefront gift cards RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logRewardsPermissionDenied.mockResolvedValue(undefined);
    issueStorefrontGiftCard.mockResolvedValue({ code: "ABCD12" });
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "staff-1" },
      userId: "owner-1",
    });
    resolveStorefrontAdminAccess.mockResolvedValue({
      ok: true,
      isOwner: false,
      workspaceRole: "STAFF",
      permissions: ["storefront.orders"],
      storefront: {
        id: "sf-1",
        storeSlug: "demo",
        userId: "owner-1",
        workspaceId: "ws-1",
      },
    });
  });

  it("gates subnav on giftcards.manage and storefront read", () => {
    expect(canAccessStorefrontGiftCardsTab(granted("giftcards.manage"), true)).toBe(true);
    expect(canAccessStorefrontGiftCardsTab(granted("storefront.read"), true)).toBe(false);
    expect(canAccessStorefrontGiftCardsTab(granted("giftcards.manage"), false)).toBe(false);
  });

  it("denies issue without giftcards.manage", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: { sessionUserId: "staff-1" },
    });

    const form = new FormData();
    form.set("amount", "25");
    const result = await issueGiftCardFormAction(form);

    expect(result).toEqual({ error: "You do not have permission to perform this action." });
    expect(requireMutationPermission).toHaveBeenCalledWith("giftcards.manage");
    expect(issueStorefrontGiftCard).not.toHaveBeenCalled();
    expect(logRewardsPermissionDenied).toHaveBeenCalled();
  });

  it("issues when giftcards.manage and storefront resolves", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: true,
      actor: { sessionUserId: "staff-1", granted: granted("giftcards.manage") },
    });

    const form = new FormData();
    form.set("amount", "50");
    const result = await issueGiftCardFormAction(form);

    expect(result).toEqual({ ok: true, code: "ABCD12" });
    expect(issueStorefrontGiftCard).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "owner-1",
        storefrontId: "sf-1",
        amount: 50,
      }),
    );
  });
});
