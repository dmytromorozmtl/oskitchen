import { beforeEach, describe, expect, it, vi } from "vitest";

import { WorkspaceAccessDeniedError } from "@/lib/scope/assert-user-workspace-access";

vi.mock("@/lib/scope/resolve-tenant-data-user-id", () => ({
  resolveTenantDataUserId: vi.fn(),
}));

import { resolveTenantDataUserId } from "@/lib/scope/resolve-tenant-data-user-id";
import { resolveTenantDataUserIdSafe } from "@/lib/scope/resolve-tenant-data-user-id-safe";

describe("resolveTenantDataUserIdSafe", () => {
  beforeEach(() => {
    vi.mocked(resolveTenantDataUserId).mockReset();
  });

  it("returns resolved owner id when access succeeds", async () => {
    vi.mocked(resolveTenantDataUserId).mockResolvedValue("owner-1");
    await expect(resolveTenantDataUserIdSafe("member-1")).resolves.toBe("owner-1");
  });

  it("falls back to session id on workspace access denial", async () => {
    vi.mocked(resolveTenantDataUserId).mockRejectedValue(new WorkspaceAccessDeniedError());
    await expect(resolveTenantDataUserIdSafe("member-1")).resolves.toBe("member-1");
  });
});
