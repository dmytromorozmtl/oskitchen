import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const kitchenSettingsUpdate = vi.hoisted(() => vi.fn());
const storefrontSettingsFindFirst = vi.hoisted(() => vi.fn());
const storefrontSettingsUpdate = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    kitchenSettings: {
      update: kitchenSettingsUpdate,
    },
    storefrontSettings: {
      findFirst: storefrontSettingsFindFirst,
      update: storefrontSettingsUpdate,
    },
  },
}));

import {
  updateNutritionPackingGatesAction,
  updateStorefrontLabelVisibilityAction,
} from "@/actions/nutrition-label-settings";

const STOREFRONT_ID = "11111111-1111-4111-8111-111111111111";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("nutrition label settings actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      dataUserId: "owner-1",
    });
    kitchenSettingsUpdate.mockResolvedValue({});
    storefrontSettingsFindFirst.mockResolvedValue({ id: STOREFRONT_ID });
    storefrontSettingsUpdate.mockResolvedValue({});
  });

  it("denies updateNutritionPackingGatesAction without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("blockAllergen", "on");
    formData.set("blockNutrition", "off");

    const result = await updateNutritionPackingGatesAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("workspace.settings");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(kitchenSettingsUpdate).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "nutrition_label_settings.permission_denied",
        metadata: expect.objectContaining({
          operation: "nutrition_label_settings.update_packing_gates",
          requiredPermission: "workspace.settings",
        }),
      }),
    );
  });

  it("denies updateStorefrontLabelVisibilityAction without storefront.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("publicNutrition", "on");
    formData.set("publicAllergens", "off");
    formData.set("publicIngredients", "off");

    const result = await updateStorefrontLabelVisibilityAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("storefront.manage");
    expect(storefrontSettingsUpdate).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          operation: "nutrition_label_settings.update_storefront_visibility",
          requiredPermission: "storefront.manage",
        }),
      }),
    );
  });

  it("allows updateNutritionPackingGatesAction when workspace.settings is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("blockAllergen", "on");
    formData.set("blockNutrition", "off");

    const result = await updateNutritionPackingGatesAction(formData);

    expect(result).toEqual({ ok: true });
    expect(requireTenantActor).toHaveBeenCalled();
    expect(kitchenSettingsUpdate).toHaveBeenCalledWith({
      where: { userId: "owner-1" },
      data: {
        blockPackingWithoutVerifiedAllergen: true,
        blockPackingWithoutVerifiedNutrition: false,
      },
    });
  });
});
