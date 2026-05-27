import { beforeEach, describe, expect, it, vi } from "vitest";

const requireIntegrationsActor = vi.hoisted(() => vi.fn());

vi.mock("@/lib/integrations/require-integrations-actor", () => ({
  requireIntegrationsActor,
}));

import { forceUberEatsMenuSyncAction } from "@/actions/integration-menu-sync";

describe("integration menu sync RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies menu sync without integrations.manage", async () => {
    requireIntegrationsActor.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
    });

    await expect(forceUberEatsMenuSyncAction()).resolves.toEqual({
      ok: false,
      error: "You do not have permission to perform this action.",
    });
    expect(requireIntegrationsActor).toHaveBeenCalledWith({
      operation: "integrations.force_uber_eats_menu_sync",
    });
  });
});
