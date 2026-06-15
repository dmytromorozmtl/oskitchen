import { beforeEach, describe, expect, it, vi } from "vitest";

const requireIntegrationsActor = vi.hoisted(() => vi.fn());
const prismaFindFirst = vi.hoisted(() => vi.fn());
const pushMenu = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/integrations/require-integrations-actor", () => ({
  requireIntegrationsActor,
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  integrationConnectionByProviderWhereForOwner: vi.fn().mockResolvedValue({ userId: "owner-1" }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    integrationConnection: { findFirst: prismaFindFirst },
  },
}));

vi.mock("@/services/integrations/uber-eats/uber-eats-service", () => ({
  syncMenuToUberEats: pushMenu,
}));

vi.mock("@/services/integrations/uber-eats/menu-sync.service", () => ({
  UberEatsMenuSyncService: class MockUberEatsMenuSyncService {
    pushMenu = pushMenu;
  },
}));

import { forceUberEatsMenuSyncAction } from "@/actions/integration-menu-sync";

describe("integration menu sync RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaFindFirst.mockResolvedValue({
      externalStoreId: "store-1",
    });
    pushMenu.mockResolvedValue({ categoriesCount: 1, itemsCount: 2, message: "ok" });
  });

  it("denies Uber Eats menu sync without integrations.manage", async () => {
    requireIntegrationsActor.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
    });

    const result = await forceUberEatsMenuSyncAction();

    expect(result.ok).toBe(false);
    expect(requireIntegrationsActor).toHaveBeenCalledWith({
      operation: "integrations.force_uber_eats_menu_sync",
    });
    expect(pushMenu).not.toHaveBeenCalled();
  });

  it("allows sync when integrations.manage passes", async () => {
    requireIntegrationsActor.mockResolvedValue({
      ok: true,
      actor: { dataUserId: "owner-1", userId: "owner-1", workspaceId: "ws-1" },
    });

    const result = await forceUberEatsMenuSyncAction();

    expect(result.ok).toBe(true);
    expect(pushMenu).toHaveBeenCalled();
  });
});
