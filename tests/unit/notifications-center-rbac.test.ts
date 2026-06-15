import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const logSettingsPermissionDenied = vi.hoisted(() => vi.fn());
const sendNotification = vi.hoisted(() => vi.fn());
const retryNotification = vi.hoisted(() => vi.fn());
const cancelQueuedNotification = vi.hoisted(() => vi.fn());
const installDefaultRules = vi.hoisted(() => vi.fn());
const updateRule = vi.hoisted(() => vi.fn());
const getSystemTemplate = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({ requireMutationPermission }));
vi.mock("@/lib/scope/require-tenant-actor", () => ({ requireTenantActor }));
vi.mock("@/services/settings/settings-permission-audit", () => ({ logSettingsPermissionDenied }));
vi.mock("@/services/notifications/notification-service", () => ({
  sendNotification,
  retryNotification,
  cancelQueuedNotification,
}));
vi.mock("@/services/notifications/reminder-service", () => ({
  installDefaultRules,
  updateRule,
}));
vi.mock("@/lib/notifications/template-registry", () => ({ getSystemTemplate }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import {
  cancelNotificationAction,
  installDefaultRulesAction,
  retryNotificationAction,
  sendTestEmailAction,
  updateRuleAction,
} from "@/actions/notifications-center";

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

describe("notifications center actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logSettingsPermissionDenied.mockResolvedValue(undefined);
    requireTenantActor.mockResolvedValue({ userId: "owner-1" });
    sendNotification.mockResolvedValue({ ok: true, status: "SENT" });
    retryNotification.mockResolvedValue({ ok: true, status: "RETRYING" });
    cancelQueuedNotification.mockResolvedValue({ ok: true });
    installDefaultRules.mockResolvedValue({ created: 3 });
    updateRule.mockResolvedValue({ ok: true });
    getSystemTemplate.mockReturnValue({
      category: "TRANSACTIONAL",
      variables: [{ key: "name", label: "Name", example: "Alex", required: false }],
    });
  });

  it("denies send test email without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("templateKey", "order_confirmation");
    formData.set("recipient", "test@example.com");

    const result = await sendTestEmailAction(formData);

    expect(result).toEqual({ ok: false, error: "You do not have permission to perform this action." });
    expect(requireMutationPermission).toHaveBeenCalledWith("workspace.settings");
    expect(logSettingsPermissionDenied).toHaveBeenCalledWith(
      deniedActor,
      expect.objectContaining({
        requiredPermission: "workspace.settings",
        operation: "notifications_center.send_test_email",
      }),
    );
    expect(sendNotification).not.toHaveBeenCalled();
  });

  it("denies retry without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("logId", "11111111-1111-4111-8111-111111111111");

    const result = await retryNotificationAction(formData);

    expect(result).toEqual({ ok: false, error: "You do not have permission to perform this action." });
    expect(logSettingsPermissionDenied).toHaveBeenCalledWith(
      deniedActor,
      expect.objectContaining({ operation: "notifications_center.retry" }),
    );
    expect(retryNotification).not.toHaveBeenCalled();
  });

  it("denies install defaults without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const result = await installDefaultRulesAction();

    expect(result).toEqual({ ok: false, error: "You do not have permission to perform this action." });
    expect(logSettingsPermissionDenied).toHaveBeenCalledWith(
      deniedActor,
      expect.objectContaining({ operation: "notifications_center.install_defaults" }),
    );
    expect(installDefaultRules).not.toHaveBeenCalled();
  });

  it("allows send test email when workspace.settings is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("templateKey", "order_confirmation");
    formData.set("recipient", "test@example.com");

    const result = await sendTestEmailAction(formData);

    expect(result).toEqual({ ok: true, status: "SENT", providerMessageId: null });
    expect(sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "owner-1",
        recipient: "test@example.com",
      }),
    );
  });

  it("allows update rule when workspace.settings is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("id", "11111111-1111-4111-8111-111111111111");
    formData.set("enabled", "true");

    const result = await updateRuleAction(formData);

    expect(result).toEqual({ ok: true });
    expect(updateRule).toHaveBeenCalledTimes(1);
  });

  it("allows cancel when workspace.settings is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("logId", "11111111-1111-4111-8111-111111111111");

    const result = await cancelNotificationAction(formData);

    expect(result).toEqual({ ok: true });
    expect(cancelQueuedNotification).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      "owner-1",
    );
  });
});
