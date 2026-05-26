import { beforeEach, describe, expect, it, vi } from "vitest";

import { WorkspaceAccessDeniedError } from "@/lib/scope/assert-user-workspace-access";
import { whereOwnedOrderForOwner } from "@/lib/scope/owned-order-guard";
import {
  assertOwnedByUser,
  whereOwnedByUser,
} from "@/lib/scope/user-owned-guards";
import { scopedIdWhere } from "@/lib/scope/tenant-scope";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn(),
}));

import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

describe("owned order guard", () => {
  beforeEach(() => {
    vi.mocked(resolveOwnerWorkspaceId).mockReset();
  });

  it("uses workspaceId when workspace present", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-1");
    await expect(whereOwnedOrderForOwner("u1", "o1")).resolves.toEqual({
      AND: [{ workspaceId: "ws-1" }, { id: "o1" }],
    });
  });

  it("uses owner userId only when workspace absent", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue(null);
    await expect(whereOwnedOrderForOwner("u1", "o1")).resolves.toEqual({
      AND: [{ userId: "u1" }, { id: "o1" }],
    });
  });
});

describe("cross-tenant denial helpers", () => {
  it("whereOwnedByUser binds id + userId", () => {
    expect(whereOwnedByUser("user-a", "order-1")).toEqual({ id: "order-1", userId: "user-a" });
  });

  it("assertOwnedByUser rejects foreign userId", () => {
    expect(() => assertOwnedByUser({ userId: "other" }, "user-a")).toThrow(WorkspaceAccessDeniedError);
    expect(() => assertOwnedByUser(null, "user-a")).toThrow(WorkspaceAccessDeniedError);
  });

  it("assertOwnedByUser passes for matching owner", () => {
    const row = { userId: "user-a", id: "pb-1" };
    assertOwnedByUser(row, "user-a");
    expect(row.id).toBe("pb-1");
  });

  it("scopedIdWhere prefers workspace when scoped", () => {
    expect(scopedIdWhere({ userId: "u1", workspaceId: "ws-9" }, "x")).toEqual({
      id: "x",
      workspaceId: "ws-9",
    });
  });
});
