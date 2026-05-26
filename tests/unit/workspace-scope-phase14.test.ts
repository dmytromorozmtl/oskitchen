import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn().mockResolvedValue("ws-test"),
}));

import {
  analyticsSnapshotListWhereForOwner,
  channelFeeRuleListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

describe("Phase 14 scoped where helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("analyticsSnapshotListWhereForOwner scopes by workspaceId", async () => {
    const where = await analyticsSnapshotListWhereForOwner("user-1");
    expect(where).toEqual({ workspaceId: "ws-test" });
  });

  it("channelFeeRuleListWhereForOwner scopes by workspaceId", async () => {
    const where = await channelFeeRuleListWhereForOwner("user-1");
    expect(where).toEqual({ workspaceId: "ws-test" });
  });
});
