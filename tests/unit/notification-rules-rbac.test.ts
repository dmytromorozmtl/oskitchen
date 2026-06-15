import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const prismaUpdateMany = vi.hoisted(() => vi.fn());
const prismaCount = vi.hoisted(() => vi.fn());
const prismaCreateMany = vi.hoisted(() => vi.fn());
const logSettingsPermissionDenied = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({ requireMutationPermission }));
vi.mock("@/lib/scope/require-tenant-actor", () => ({ requireTenantActor }));
vi.mock("@/services/settings/settings-permission-audit", () => ({ logSettingsPermissionDenied }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    notificationRule: {
      updateMany: prismaUpdateMany,
      count: prismaCount,
      createMany: prismaCreateMany,
    },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import {
  seedNotificationRulesAction,
  toggleNotificationRuleAction,
} from "@/actions/notification-rules";

const deniedActor = {
  userId: "owner-1",
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("notification rules actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logSettingsPermissionDenied.mockResolvedValue(undefined);
    requireTenantActor.mockResolvedValue({ userId: "owner-1" });
    prismaUpdateMany.mockResolvedValue({ count: 1 });
    prismaCount.mockResolvedValue(0);
    prismaCreateMany.mockResolvedValue({ count: 5 });
  });

  it("denies toggle without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("id", "11111111-1111-4111-8111-111111111111");
    formData.set("enabled", "true");

    const result = await toggleNotificationRuleAction(formData);

    expect(result).toEqual({ error: "You do not have permission to perform this action." });
    expect(requireMutationPermission).toHaveBeenCalledWith("workspace.settings");
    expect(logSettingsPermissionDenied).toHaveBeenCalledWith(
      deniedActor,
      expect.objectContaining({
        requiredPermission: "workspace.settings",
        operation: "notification_rules.toggle",
      }),
    );
    expect(prismaUpdateMany).not.toHaveBeenCalled();
  });

  it("denies seed without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("confirm", "seed");

    const result = await seedNotificationRulesAction(formData);

    expect(result).toEqual({ error: "You do not have permission to perform this action." });
    expect(logSettingsPermissionDenied).toHaveBeenCalledWith(
      deniedActor,
      expect.objectContaining({
        operation: "notification_rules.seed",
      }),
    );
    expect(prismaCreateMany).not.toHaveBeenCalled();
  });

  it("allows toggle when workspace.settings is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("id", "11111111-1111-4111-8111-111111111111");
    formData.set("enabled", "false");

    const result = await toggleNotificationRuleAction(formData);

    expect(result).toEqual({ ok: true });
    expect(prismaUpdateMany).toHaveBeenCalledTimes(1);
  });
});
