import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn().mockResolvedValue("ws-test"),
}));

import {
  analyticsSnapshotListWhereForOwner,
  channelFeeRuleListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { legacyAwareOwnerScope } from "@/tests/helpers/owner-scoped-where";

describe("Phase 14 scoped where helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("analyticsSnapshotListWhereForOwner scopes by workspaceId", async () => {
    const where = await analyticsSnapshotListWhereForOwner("user-1");
    expect(where).toEqual(legacyAwareOwnerScope("user-1", "ws-test"));
  });

  it("channelFeeRuleListWhereForOwner scopes by workspaceId", async () => {
    const where = await channelFeeRuleListWhereForOwner("user-1");
    expect(where).toEqual(legacyAwareOwnerScope("user-1", "ws-test"));
  });
});
