import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  channelConflictWhereForOwner,
  channelImportBatchByIdWhereForOwner,
  channelImportBatchListWhereForOwner,
} from "@/lib/scope/channel-import-scope";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn(),
}));

import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

describe("channel-import-scope", () => {
  beforeEach(() => {
    vi.mocked(resolveOwnerWorkspaceId).mockReset();
  });

  it("channelImportBatchListWhereForOwner uses workspaceId when workspace exists", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-1");
    await expect(channelImportBatchListWhereForOwner("owner-1")).resolves.toEqual({
      workspaceId: "ws-1",
    });
  });

  it("channelImportBatchByIdWhereForOwner ANDs batch id", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue(null);
    await expect(channelImportBatchByIdWhereForOwner("owner-1", "batch-1")).resolves.toEqual({
      AND: [{ userId: "owner-1" }, { id: "batch-1" }],
    });
  });

  it("channelConflictWhereForOwner uses workspaceId when workspace exists", async () => {
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-1");
    await expect(channelConflictWhereForOwner("owner-1")).resolves.toEqual({
      workspaceId: "ws-1",
    });
  });
});
