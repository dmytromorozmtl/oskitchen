import { beforeEach, describe, expect, it, vi } from "vitest";

import { workspacePermissionsFromStaffTemplate } from "@/lib/permissions/staff-template-workspace-permissions";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const logRewardsPermissionDenied = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/services/crm/rewards-permission-audit", () => ({
  logRewardsPermissionDenied,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("@/services/gift-cards/gift-card-service", () => ({
  createGiftCard: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/services/loyalty/loyalty-service", () => ({
  updateLoyaltyProgram: vi.fn().mockResolvedValue(undefined),
}));

import { createGiftCardAction } from "@/actions/gift-cards";
import { updateLoyaltyProgramAction } from "@/actions/loyalty";
import { canLookupRewardsBalance } from "@/lib/crm/require-rewards-mutation";

describe("rewards RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "user-1" },
      userId: "owner-1",
      dataUserId: "owner-1",
      workspaceId: "ws-1",
    });
  });

  it("denies gift card creation without giftcards.manage", async () => {
    const granted = workspacePermissionsFromStaffTemplate("LINE_COOK", "STAFF");
    const actor = {
      sessionUserId: "user-1",
      dataUserId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "LINE_COOK" as const,
      email: "cook@example.com",
      granted,
    };
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor,
    });

    const formData = new FormData();
    formData.set("amount", "50");

    const result = await createGiftCardAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("giftcards.manage");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(logRewardsPermissionDenied).toHaveBeenCalled();
  });

  it("denies loyalty program updates without loyalty.manage", async () => {
    const granted = workspacePermissionsFromStaffTemplate("CUSTOMER_SERVICE", "STAFF");
    const actor = {
      sessionUserId: "user-1",
      dataUserId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "CUSTOMER_SERVICE" as const,
      email: "cs@example.com",
      granted,
    };
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor,
    });

    const formData = new FormData();
    formData.set("pointsPerDollar", "1");
    formData.set("redeemPointsThreshold", "100");
    formData.set("redeemValueCents", "500");
    formData.set("active", "true");

    const result = await updateLoyaltyProgramAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("loyalty.manage");
    expect(logRewardsPermissionDenied).toHaveBeenCalled();
  });

  it("allows POS checkout staff to look up gift card balances", () => {
    const granted = workspacePermissionsFromStaffTemplate("CUSTOMER_SERVICE", "STAFF");
    const actor = {
      sessionUserId: "user-1",
      dataUserId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "CUSTOMER_SERVICE" as const,
      email: "cs@example.com",
      granted,
    };

    expect(canLookupRewardsBalance(actor, "gift_cards")).toBe(true);
    expect(canLookupRewardsBalance(actor, "loyalty")).toBe(true);
  });

  it("allows customer-service staff loyalty balance lookup via customers.read", () => {
    const granted = workspacePermissionsFromStaffTemplate("CUSTOMER_SERVICE", "STAFF");
    const actor = {
      sessionUserId: "user-1",
      dataUserId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "CUSTOMER_SERVICE" as const,
      email: "cs@example.com",
      granted,
    };

    expect(canLookupRewardsBalance(actor, "loyalty")).toBe(true);
  });

  it("blocks loyalty balance lookup for kitchen staff without POS or CRM access", () => {
    const granted = workspacePermissionsFromStaffTemplate("LINE_COOK", "STAFF");
    const actor = {
      sessionUserId: "user-1",
      dataUserId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "LINE_COOK" as const,
      email: "cook@example.com",
      granted,
    };

    expect(canLookupRewardsBalance(actor, "gift_cards")).toBe(false);
    expect(canLookupRewardsBalance(actor, "loyalty")).toBe(false);
  });

  it("allows marketing staff loyalty balance lookups", () => {
    const granted = workspacePermissionsFromStaffTemplate("MARKETING", "STAFF");
    const actor = {
      sessionUserId: "user-1",
      dataUserId: "owner-1",
      workspaceId: "ws-1",
      workspaceRole: "STAFF" as const,
      staffRoleType: "MARKETING" as const,
      email: "marketing@example.com",
      granted,
    };

    expect(canLookupRewardsBalance(actor, "loyalty")).toBe(true);
    expect(canLookupRewardsBalance(actor, "gift_cards")).toBe(true);
  });
});
