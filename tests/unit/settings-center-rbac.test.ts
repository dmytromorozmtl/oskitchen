import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const logSettingsPermissionDenied = vi.hoisted(() => vi.fn());
const loadSettingsCenter = vi.hoisted(() => vi.fn());
const updateSettingsCenterSection = vi.hoisted(() => vi.fn());

vi.mock("@/lib/permissions/mutation-access", () => ({ requireMutationPermission }));
vi.mock("@/lib/scope/require-tenant-actor", () => ({ requireTenantActor }));
vi.mock("@/services/settings/settings-permission-audit", () => ({ logSettingsPermissionDenied }));
vi.mock("@/services/settings/settings-center-service", () => ({
  loadSettingsCenter,
  updateSettingsCenterSection,
  updateSettingsCenterSections: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    kitchenSettings: {
      upsert: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { saveOrderSettings, saveWorkspaceIdentity } from "@/actions/settings-center";

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

describe("settings center actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logSettingsPermissionDenied.mockResolvedValue(undefined);
    requireTenantActor.mockResolvedValue({ userId: "owner-1" });
    loadSettingsCenter.mockResolvedValue({
      payload: {
        workspaceIdentity: {
          legalName: null,
          doingBusinessAs: null,
          businessNumber: null,
          taxIds: { gst: null, qst: null, vat: null, other: null },
          supportEmail: null,
          supportPhone: null,
          website: null,
          socialLinks: {
            instagram: null,
            facebook: null,
            tiktok: null,
            x: null,
            linkedin: null,
          },
          invoiceFooter: null,
          operatingLanguage: "en",
          defaultTaxRulesNote: null,
        },
      },
    });
    updateSettingsCenterSection.mockResolvedValue(undefined);
  });

  it("denies workspace identity save without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const result = await saveWorkspaceIdentity({
      operatingLanguage: "en",
      taxIds: {},
      socialLinks: {},
    });

    expect(result).toEqual({ ok: false, error: "forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("workspace.settings");
    expect(logSettingsPermissionDenied).toHaveBeenCalledWith(
      deniedActor,
      expect.objectContaining({
        requiredPermission: "workspace.settings",
        operation: "settings.workspace_identity.save",
      }),
    );
    expect(updateSettingsCenterSection).not.toHaveBeenCalled();
  });

  it("denies order settings save without orders.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const result = await saveOrderSettings({
      autoConfirmManualOrders: true,
      requireApprovalForCateringOrders: false,
      minOrderValue: 0,
      allowedPaymentModes: ["card"],
      cancellationWindowHours: 24,
      refundWindowDays: 7,
      fraudCheckEnabled: false,
      delayedOrderEscalationMinutes: 30,
      preorderRequiresMenu: true,
    });

    expect(result).toEqual({ ok: false, error: "forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("orders.manage");
    expect(logSettingsPermissionDenied).toHaveBeenCalledWith(
      deniedActor,
      expect.objectContaining({
        requiredPermission: "orders.manage",
        operation: "settings.orders.save",
      }),
    );
    expect(updateSettingsCenterSection).not.toHaveBeenCalled();
  });

  it("allows order settings save when orders.manage is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const result = await saveOrderSettings({
      autoConfirmManualOrders: true,
      requireApprovalForCateringOrders: false,
      minOrderValue: 0,
      allowedPaymentModes: ["card"],
      cancellationWindowHours: 24,
      refundWindowDays: 7,
      fraudCheckEnabled: false,
      delayedOrderEscalationMinutes: 30,
      preorderRequiresMenu: true,
    });

    expect(result).toEqual({ ok: true, value: undefined });
    expect(updateSettingsCenterSection).toHaveBeenCalledWith(
      "owner-1",
      "orders",
      expect.objectContaining({ autoConfirmManualOrders: true }),
    );
  });
});
