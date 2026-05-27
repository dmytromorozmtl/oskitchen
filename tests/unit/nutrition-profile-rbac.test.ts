import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const productFindFirst = vi.hoisted(() => vi.fn());
const nutritionProfileUpsert = vi.hoisted(() => vi.fn());

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

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  productByIdWhereForOwner: vi.fn().mockResolvedValue({ id: "product-1" }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findFirst: productFindFirst,
      update: vi.fn(),
    },
    nutritionProfile: {
      upsert: nutritionProfileUpsert,
    },
  },
}));

import { upsertNutritionProfileAction } from "@/actions/nutrition-profile";

const PRODUCT_ID = "11111111-1111-4111-8111-111111111111";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("nutrition profile actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "actor-1", email: "owner@example.com" },
      dataUserId: "owner-1",
    });
    productFindFirst.mockResolvedValue({
      id: PRODUCT_ID,
      menu: { userId: "owner-1" },
    });
    nutritionProfileUpsert.mockResolvedValue({});
  });

  it("denies upsertNutritionProfileAction without products.edit and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("productId", PRODUCT_ID);
    formData.set("calories", "420");
    formData.set("allergens", "Milk");

    const result = await upsertNutritionProfileAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("products.edit");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(nutritionProfileUpsert).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "nutrition_profile.permission_denied",
        metadata: expect.objectContaining({
          operation: "nutrition_profile.upsert",
          requiredPermission: "products.edit",
        }),
      }),
    );
  });

  it("allows upsertNutritionProfileAction when products.edit is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("productId", PRODUCT_ID);
    formData.set("calories", "420");
    formData.set("protein", "0");
    formData.set("carbs", "0");
    formData.set("fat", "0");
    formData.set("fiber", "0");
    formData.set("sugar", "0");
    formData.set("sodium", "0");
    formData.set("totalFat", "0");
    formData.set("saturatedFat", "0");
    formData.set("transFat", "0");
    formData.set("cholesterol", "0");
    formData.set("totalCarbohydrate", "0");
    formData.set("dietaryFiber", "0");
    formData.set("totalSugars", "0");
    formData.set("addedSugars", "0");
    formData.set("vitaminDMcg", "0");
    formData.set("calciumMg", "0");
    formData.set("ironMg", "0");
    formData.set("potassiumMg", "0");
    formData.set("allergens", "Milk");
    formData.set("ingredientsText", "");
    formData.set("reheatingInstructions", "");
    formData.set("servingSize", "");
    formData.set("servingSizeUnit", "");
    formData.set("notes", "");
    formData.set("supplierDocumentRef", "");
    formData.set("labResultRef", "");
    formData.set("sourceType", "MANUAL");

    const result = await upsertNutritionProfileAction(formData);

    expect(result).toEqual({ ok: true });
    expect(requireTenantActor).toHaveBeenCalled();
    expect(nutritionProfileUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { productId: PRODUCT_ID },
        create: expect.objectContaining({
          productId: PRODUCT_ID,
          allergens: "Milk",
          calories: 420,
        }),
      }),
    );
  });
});
