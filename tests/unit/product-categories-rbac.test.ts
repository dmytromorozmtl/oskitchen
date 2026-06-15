import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const createCustomCategory = vi.hoisted(() => vi.fn());

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

vi.mock("@/services/products/category-service", () => ({
  createCustomCategory,
}));

import { createCustomCategoryAction } from "@/actions/product-categories";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("product categories actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({ dataUserId: "owner-1" });
    createCustomCategory.mockResolvedValue({
      ok: true,
      code: "CUSTOM_BOWLS",
      label: "Bowls",
    });
  });

  it("denies createCustomCategoryAction without products.edit and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("name", "Bowls");

    const result = await createCustomCategoryAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("products.edit");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(createCustomCategory).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "product_categories.permission_denied",
        metadata: expect.objectContaining({
          operation: "product_categories.create",
          requiredPermission: "products.edit",
        }),
      }),
    );
  });

  it("allows createCustomCategoryAction when products.edit is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("name", "Bowls");

    const result = await createCustomCategoryAction(formData);

    expect(result).toEqual({ ok: true, code: "CUSTOM_BOWLS", label: "Bowls" });
    expect(requireTenantActor).toHaveBeenCalled();
    expect(createCustomCategory).toHaveBeenCalledWith("owner-1", "Bowls");
  });
});
