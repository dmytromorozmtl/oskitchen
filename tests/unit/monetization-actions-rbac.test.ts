import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const canUseFeature = vi.hoisted(() => vi.fn());
const getBillingAccess = vi.hoisted(() => vi.fn());
const prismaCreate = vi.hoisted(() => vi.fn());
const prismaUpdateMany = vi.hoisted(() => vi.fn());
const prismaUpdate = vi.hoisted(() => vi.fn());
const logIntegrationPermissionDenied = vi.hoisted(() => vi.fn());
const logSettingsPermissionDenied = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({ requireMutationPermission }));
vi.mock("@/lib/scope/require-tenant-actor", () => ({ requireTenantActor }));
vi.mock("@/lib/plans/feature-registry", () => ({ canUseFeature }));
vi.mock("@/lib/billing/access", () => ({ getBillingAccess }));
vi.mock("@/lib/billing/dev-bypass", () => ({ isBillingBypassed: () => false }));
vi.mock("@/services/integrations/integration-permission-audit", () => ({
  logIntegrationPermissionDenied,
}));
vi.mock("@/services/settings/settings-permission-audit", () => ({
  logSettingsPermissionDenied,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    apiKey: {
      create: prismaCreate,
      updateMany: prismaUpdateMany,
    },
    kitchenSettings: {
      update: prismaUpdate,
    },
    subscription: {
      findUnique: vi.fn().mockResolvedValue({ plan: "ENTERPRISE" }),
    },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import {
  createApiKeyForm,
  revokeApiKeyById,
  saveBrandingSettingsForm,
} from "@/actions/monetization";

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

describe("monetization actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logIntegrationPermissionDenied.mockResolvedValue(undefined);
    logSettingsPermissionDenied.mockResolvedValue(undefined);
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "owner-session" },
      dataUserId: "owner-1",
    });
    canUseFeature.mockResolvedValue({ allowed: true });
    getBillingAccess.mockResolvedValue({ hasPaidSubscription: true, devBypass: false });
    prismaCreate.mockResolvedValue({ id: "key-1" });
    prismaUpdateMany.mockResolvedValue({ count: 1 });
    prismaUpdate.mockResolvedValue({});
  });

  it("denies API key creation without integrations.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("name", "Production");

    const result = await createApiKeyForm(formData);

    expect(result).toEqual({ error: "You do not have permission to perform this action." });
    expect(requireMutationPermission).toHaveBeenCalledWith("integrations.manage");
    expect(logIntegrationPermissionDenied).toHaveBeenCalledWith(
      deniedActor,
      expect.objectContaining({
        operation: "monetization.api_key.create",
        requiredPermission: "integrations.manage",
      }),
    );
    expect(prismaCreate).not.toHaveBeenCalled();
  });

  it("denies API key revoke without integrations.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    await revokeApiKeyById("11111111-1111-4111-8111-111111111111");

    expect(logIntegrationPermissionDenied).toHaveBeenCalledWith(
      deniedActor,
      expect.objectContaining({
        operation: "monetization.api_key.revoke",
      }),
    );
    expect(prismaUpdateMany).not.toHaveBeenCalled();
  });

  it("creates API key when integrations.manage is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("name", "Production");

    const result = await createApiKeyForm(formData);

    expect(result.ok).toBe(true);
    expect(prismaCreate).toHaveBeenCalledTimes(1);
  });

  it("denies branding save without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("brandColorHex", "#111111");

    await saveBrandingSettingsForm(formData);

    expect(requireMutationPermission).toHaveBeenCalledWith("workspace.settings");
    expect(logSettingsPermissionDenied).toHaveBeenCalledWith(
      deniedActor,
      expect.objectContaining({
        operation: "monetization.branding.save",
        requiredPermission: "workspace.settings",
      }),
    );
    expect(prismaUpdate).not.toHaveBeenCalled();
  });

  it("saves branding when workspace.settings is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("brandColorHex", "#111111");

    await saveBrandingSettingsForm(formData);

    expect(prismaUpdate).toHaveBeenCalledTimes(1);
  });
});
