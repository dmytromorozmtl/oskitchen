import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const productFindFirst = vi.hoisted(() => vi.fn());
const productDelete = vi.hoisted(() => vi.fn());

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
  menuByIdWhereForOwner: vi.fn().mockResolvedValue({ id: "menu-1" }),
  productByIdWhereForOwner: vi.fn().mockResolvedValue({ id: "product-1" }),
  productByIdWhereForOwnerWithMenuFallback: vi.fn().mockResolvedValue({ id: "product-1" }),
}));

vi.mock("@/lib/storefront/revalidate-storefront-dashboard", () => ({
  revalidateStorefrontDashboardAndPublic: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    menu: { findFirst: vi.fn() },
    product: {
      findFirst: productFindFirst,
      delete: productDelete,
      create: vi.fn(),
      update: vi.fn(),
    },
    productionTask: { create: vi.fn() },
    storefrontSettings: { findFirst: vi.fn().mockResolvedValue(null) },
    $transaction: vi.fn(),
  },
}));

import { createProduct, deleteProduct } from "@/actions/products";

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

describe("products actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      userId: "owner-1",
      workspaceId: "ws-1",
    });
    productFindFirst.mockResolvedValue({ id: PRODUCT_ID });
    productDelete.mockResolvedValue({ id: PRODUCT_ID });
  });

  it("denies createProduct without products.edit and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("menuId", "22222222-2222-4222-8222-222222222222");
    formData.set("title", "Soup");
    formData.set("price", "12");

    const result = await createProduct(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("products.edit");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "products.permission_denied",
        metadata: expect.objectContaining({
          operation: "products.create",
          requiredPermission: "products.edit",
        }),
      }),
    );
  });

  it("denies deleteProduct without products.edit and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const result = await deleteProduct(PRODUCT_ID);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(productDelete).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "products.delete" }),
      }),
    );
  });

  it("allows deleteProduct when products.edit is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const result = await deleteProduct(PRODUCT_ID);

    expect(result).toEqual({ ok: true, data: undefined });
    expect(requireTenantActor).toHaveBeenCalled();
    expect(productFindFirst).toHaveBeenCalled();
    expect(productDelete).toHaveBeenCalledWith({ where: { id: PRODUCT_ID } });
  });
});
