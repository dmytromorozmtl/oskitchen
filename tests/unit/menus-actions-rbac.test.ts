import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const menuFindFirst = vi.hoisted(() => vi.fn());
const menuDeleteMany = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

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
  menuListWhereForOwner: vi.fn().mockResolvedValue({ userId: "owner-1" }),
}));

vi.mock("@/lib/plans", () => ({
  countMenusForUser: vi.fn().mockResolvedValue(0),
  getEffectivePlan: vi.fn().mockResolvedValue({ limits: { maxMenus: null } }),
}));

vi.mock("@/lib/lifecycle-events", () => ({
  recordLifecycleEventSafe: vi.fn(),
}));

vi.mock("@/lib/usage", () => ({
  trackUsageEvent: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    menu: {
      findFirst: menuFindFirst,
      deleteMany: menuDeleteMany,
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
    storefrontSettings: { findFirst: vi.fn().mockResolvedValue(null) },
  },
}));

import { createMenu, deleteMenu } from "@/actions/menus";

const MENU_ID = "11111111-1111-4111-8111-111111111111";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("menus actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "actor-1", email: "owner@example.com" },
      userId: "owner-1",
      workspaceId: "ws-1",
    });
    menuFindFirst.mockResolvedValue({ id: MENU_ID, catalogOnly: false });
    menuDeleteMany.mockResolvedValue({ count: 1 });
  });

  it("denies createMenu without products.edit and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("title", "Spring menu");
    formData.set("startDate", "2026-05-01");
    formData.set("endDate", "2026-05-31");
    formData.set("preorderDeadline", "2026-04-28");
    formData.set("collectionSlug", "");

    const result = await createMenu(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("products.edit");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "menus.permission_denied",
        metadata: expect.objectContaining({
          operation: "menus.create",
          requiredPermission: "products.edit",
        }),
      }),
    );
  });

  it("denies deleteMenu without products.edit and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const result = await deleteMenu(MENU_ID);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(menuDeleteMany).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "menus.delete" }),
      }),
    );
  });

  it("allows deleteMenu when products.edit is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const result = await deleteMenu(MENU_ID);

    expect(result).toEqual({ ok: true });
    expect(requireTenantActor).toHaveBeenCalled();
    expect(menuFindFirst).toHaveBeenCalled();
    expect(menuDeleteMany).toHaveBeenCalled();
  });
});
