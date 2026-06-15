import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const productFindFirst = vi.hoisted(() => vi.fn());
const ingredientDeclarationUpsert = vi.hoisted(() => vi.fn());
const appendLabelVerificationEvent = vi.hoisted(() => vi.fn());

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

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn().mockResolvedValue("ws-1"),
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  productByIdWhereForOwner: vi.fn().mockResolvedValue({ id: "product-1" }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findFirst: productFindFirst,
    },
    ingredientDeclaration: {
      upsert: ingredientDeclarationUpsert,
    },
  },
}));

vi.mock("@/services/nutrition-labels/label-verification-log", () => ({
  appendLabelVerificationEvent,
}));

import { upsertIngredientDeclarationFormAction } from "@/actions/ingredient-declaration";

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

describe("ingredient declaration actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "actor-1", email: "owner@example.com" },
      dataUserId: "owner-1",
    });
    productFindFirst.mockResolvedValue({
      id: PRODUCT_ID,
      ingredients: null,
      menu: { userId: "owner-1" },
    });
    ingredientDeclarationUpsert.mockResolvedValue({});
    appendLabelVerificationEvent.mockResolvedValue(undefined);
  });

  it("denies upsertIngredientDeclarationFormAction without products.edit and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("productId", PRODUCT_ID);
    formData.set("ingredientsText", "Water, salt, flour");
    formData.set("sourceType", "MANUAL");

    await upsertIngredientDeclarationFormAction(formData);

    expect(requireMutationPermission).toHaveBeenCalledWith("products.edit");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(ingredientDeclarationUpsert).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ingredient_declaration.permission_denied",
        metadata: expect.objectContaining({
          operation: "ingredient_declaration.upsert",
          requiredPermission: "products.edit",
        }),
      }),
    );
  });

  it("allows upsertIngredientDeclarationFormAction when products.edit is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("productId", PRODUCT_ID);
    formData.set("ingredientsText", "Water, salt, flour");
    formData.set("sourceType", "MANUAL");

    await upsertIngredientDeclarationFormAction(formData);

    expect(requireTenantActor).toHaveBeenCalled();
    expect(ingredientDeclarationUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { productId: PRODUCT_ID },
        create: expect.objectContaining({
          ingredientsText: "Water, salt, flour",
          sourceType: "MANUAL",
        }),
      }),
    );
    expect(appendLabelVerificationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "owner-1",
        productId: PRODUCT_ID,
        profileType: "INGREDIENTS",
        action: "UPSERT",
      }),
    );
  });
});
