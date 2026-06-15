import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/support/support-permissions", () => ({
  userWorkspaceIds: vi.fn(),
}));

import {
  assertUserCanAccessWorkspace,
  userHasWorkspaceAccess,
  WorkspaceAccessDeniedError,
} from "@/lib/scope/assert-user-workspace-access";
import { userWorkspaceIds } from "@/lib/support/support-permissions";

describe("userHasWorkspaceAccess", () => {
  it("returns true when workspace is in the allowed list", async () => {
    vi.mocked(userWorkspaceIds).mockResolvedValue(["ws-a", "ws-b"]);
    await expect(userHasWorkspaceAccess("user-1", "ws-b")).resolves.toBe(true);
  });

  it("returns false when workspace is not allowed", async () => {
    vi.mocked(userWorkspaceIds).mockResolvedValue(["ws-a"]);
    await expect(userHasWorkspaceAccess("user-1", "ws-x")).resolves.toBe(false);
  });
});

describe("assertUserCanAccessWorkspace", () => {
  it("resolves when allowed", async () => {
    vi.mocked(userWorkspaceIds).mockResolvedValue(["ws-a"]);
    await expect(assertUserCanAccessWorkspace("user-1", "ws-a")).resolves.toBeUndefined();
  });

  it("throws WorkspaceAccessDeniedError when not allowed", async () => {
    vi.mocked(userWorkspaceIds).mockResolvedValue([]);
    await expect(assertUserCanAccessWorkspace("user-1", "ws-a")).rejects.toBeInstanceOf(WorkspaceAccessDeniedError);
  });
});
