import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const productFindFirst = vi.hoisted(() => vi.fn());
const allergenProfileUpsert = vi.hoisted(() => vi.fn());
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

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  productByIdWhereForOwner: vi.fn().mockResolvedValue({ id: "product-1" }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findFirst: productFindFirst,
    },
    allergenProfile: {
      upsert: allergenProfileUpsert,
    },
  },
}));

vi.mock("@/services/nutrition-labels/label-verification-log", () => ({
  appendLabelVerificationEvent,
}));

import { upsertAllergenProfileFormAction } from "@/actions/allergen-profile";

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

describe("allergen profile actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "actor-1", email: "owner@example.com" },
      dataUserId: "owner-1",
    });
    productFindFirst.mockResolvedValue({
      id: PRODUCT_ID,
      allergens: "Milk",
      menu: { userId: "owner-1" },
    });
    allergenProfileUpsert.mockResolvedValue({});
    appendLabelVerificationEvent.mockResolvedValue(undefined);
  });

  it("denies upsertAllergenProfileFormAction without products.edit and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("productId", PRODUCT_ID);
    formData.set("containsCsv", "Milk");
    formData.set("sourceType", "MANUAL");

    await upsertAllergenProfileFormAction(formData);

    expect(requireMutationPermission).toHaveBeenCalledWith("products.edit");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(allergenProfileUpsert).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "allergen_profile.permission_denied",
        metadata: expect.objectContaining({
          operation: "allergen_profile.upsert",
          requiredPermission: "products.edit",
        }),
      }),
    );
  });

  it("allows upsertAllergenProfileFormAction when products.edit is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("productId", PRODUCT_ID);
    formData.set("containsCsv", "Milk, Tree Nuts");
    formData.set("mayContainCsv", "");
    formData.set("freeFromCsv", "");
    formData.set("notes", "");
    formData.set("sourceType", "MANUAL");

    await upsertAllergenProfileFormAction(formData);

    expect(requireTenantActor).toHaveBeenCalled();
    expect(allergenProfileUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { productId: PRODUCT_ID },
        create: expect.objectContaining({
          containsJson: ["milk", "tree_nuts"],
          sourceType: "MANUAL",
        }),
      }),
    );
    expect(appendLabelVerificationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "owner-1",
        productId: PRODUCT_ID,
        profileType: "ALLERGEN",
        action: "UPSERT",
      }),
    );
  });
});
