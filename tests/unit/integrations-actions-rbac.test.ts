import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const logIntegrationPermissionDenied = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/services/integrations/integration-permission-audit", () => ({
  logIntegrationPermissionDenied,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    integrationConnection: {
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/channels/credentials", () => ({
  logChannelCredentialAudit: vi.fn(),
}));

import { requireIntegrationsActor } from "@/lib/integrations/require-integrations-actor";
import { disconnectIntegration } from "@/actions/integrations";

const managerActor = {
  sessionUser: { id: "session-1", email: "manager@example.com" },
  sessionUserId: "session-1",
  userId: "owner-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  email: "manager@example.com",
  workspaceRole: "STAFF" as const,
  staffRoleType: "MANAGER" as const,
  granted: new Set(["integrations.manage"]),
};

describe("integrations actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logIntegrationPermissionDenied.mockResolvedValue(undefined);
  });

  it("audits denied integration mutations", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: managerActor,
    });

    const result = await requireIntegrationsActor({ operation: "integrations.disconnect" });

    expect(result).toEqual({
      ok: false,
      error: "You do not have permission to perform this action.",
    });
    expect(logIntegrationPermissionDenied).toHaveBeenCalledWith(
      managerActor,
      expect.objectContaining({
        operation: "integrations.disconnect",
        requiredPermission: "integrations.manage",
      }),
    );
  });

  it("blocks disconnectIntegration without integrations.manage", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: managerActor,
    });

    const fd = new FormData();
    fd.set("connectionId", "11111111-1111-4111-8111-111111111111");

    const result = await disconnectIntegration(fd);
    expect(result).toEqual({
      ok: false,
      error: "You do not have permission to perform this action.",
    });
  });
});
