import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildOwnerScopedWhere,
  buildProductOwnerScopedWhere,
  integrationConnectionByProviderWhereForOwner,
  orderListWhereForOwner,
  ownerScopedAnd,
  productListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { IntegrationProvider } from "@prisma/client";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn(),
}));

import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

describe("workspace-resource-scope", () => {
  const prevLegacy = process.env.WORKSPACE_SCOPE_LEGACY_OR;

  beforeEach(() => {
    vi.mocked(resolveOwnerWorkspaceId).mockReset();
    delete process.env.WORKSPACE_SCOPE_LEGACY_OR;
  });

  afterEach(() => {
    if (prevLegacy === undefined) delete process.env.WORKSPACE_SCOPE_LEGACY_OR;
    else process.env.WORKSPACE_SCOPE_LEGACY_OR = prevLegacy;
  });

  it("buildOwnerScopedWhere uses workspaceId when workspace exists", () => {
    expect(buildOwnerScopedWhere("owner-1", "ws-1")).toEqual({ workspaceId: "ws-1" });
  });

  it("buildOwnerScopedWhere supports legacy OR when env set", () => {
    process.env.WORKSPACE_SCOPE_LEGACY_OR = "1";
    expect(buildOwnerScopedWhere("owner-1", "ws-1")).toEqual({
      OR: [{ workspaceId: "ws-1" }, { userId: "owner-1", workspaceId: null }],
    });
  });

  it("buildOwnerScopedWhere falls back to userId only", () => {
    expect(buildOwnerScopedWhere("owner-1", null)).toEqual({ userId: "owner-1" });
  });

  it("ownerScopedAnd merges extra filters when workspace exists", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-1");
    await expect(ownerScopedAnd("owner-1", { status: "OPEN" })).resolves.toEqual({
      AND: [{ workspaceId: "ws-1" }, { status: "OPEN" }],
    });
  });

  it("ownerScopedAnd merges extra filters without workspace", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue(null);
    await expect(ownerScopedAnd("owner-1", { status: "OPEN" })).resolves.toEqual({
      AND: [{ userId: "owner-1" }, { status: "OPEN" }],
    });
  });

  it("orderListWhereForOwner resolves workspace", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-9");
    await expect(orderListWhereForOwner("owner-1")).resolves.toEqual({ workspaceId: "ws-9" });
  });

  it("buildProductOwnerScopedWhere uses workspaceId", () => {
    expect(buildProductOwnerScopedWhere("owner-1", "ws-1")).toEqual({ workspaceId: "ws-1" });
  });

  it("buildProductOwnerScopedWhere falls back to menu owner", () => {
    expect(buildProductOwnerScopedWhere("owner-1", null)).toEqual({
      menu: { userId: "owner-1" },
    });
  });

  it("productListWhereForOwner resolves workspace", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-9");
    await expect(productListWhereForOwner("owner-1")).resolves.toEqual({ workspaceId: "ws-9" });
  });

  it("integrationConnectionByProviderWhereForOwner includes provider", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue(null);
    await expect(
      integrationConnectionByProviderWhereForOwner("owner-1", IntegrationProvider.SHOPIFY),
    ).resolves.toEqual({
      AND: [{ userId: "owner-1" }, { provider: IntegrationProvider.SHOPIFY }],
    });
  });
});
