import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const runGlobalSearchForUser = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/services/search/global-search-service", () => ({
  runGlobalSearchForUser,
}));

import { runGlobalSearch } from "@/actions/global-search";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("global search action RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    runGlobalSearchForUser.mockResolvedValue({
      hits: [{ kind: "order", id: "o-1", title: "Order", subtitle: null, href: "/x" }],
      truncated: false,
    });
  });

  it("denies search without workspace.view and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const result = await runGlobalSearch("jane");

    expect(result).toEqual({ hits: [], truncated: false });
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "global_search.permission_denied",
        metadata: expect.objectContaining({
          operation: "global_search.run",
          requiredPermission: "workspace.view",
        }),
      }),
    );
    expect(runGlobalSearchForUser).not.toHaveBeenCalled();
  });

  it("searches owner workspace scope using dataUserId not session user id", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: true,
      actor: deniedActor,
    });

    await runGlobalSearch("jane");

    expect(runGlobalSearchForUser).toHaveBeenCalledWith("owner-1", "jane");
    expect(runGlobalSearchForUser).not.toHaveBeenCalledWith("staff-1", expect.anything());
  });
});
