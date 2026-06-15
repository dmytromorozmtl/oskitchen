import { beforeEach, describe, expect, it, vi } from "vitest";

const recordAuditLog = vi.hoisted(() => vi.fn());

vi.mock("@/lib/audit-log", () => ({ recordAuditLog }));

import { logDomainMutationDenied } from "@/lib/permissions/log-domain-mutation-denied";

describe("logDomainMutationDenied", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recordAuditLog.mockResolvedValue(undefined);
  });

  it("writes workspace-scoped denial audit fields", async () => {
    await logDomainMutationDenied({
      action: "routes.permission_denied",
      entityType: "DeliveryRoute",
      actor: {
        sessionUserId: "sess-1",
        workspaceId: "ws-1",
        dataUserId: "owner-1",
        workspaceRole: "OWNER",
        granted: [],
      },
      metadata: { operation: "routes.mutate", requiredPermission: "routes.manage" },
    });

    expect(recordAuditLog).toHaveBeenCalledWith({
      userId: "sess-1",
      workspaceId: "ws-1",
      action: "routes.permission_denied",
      entityType: "DeliveryRoute",
      metadata: { operation: "routes.mutate", requiredPermission: "routes.manage" },
    });
  });
});
