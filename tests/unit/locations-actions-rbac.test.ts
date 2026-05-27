import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const updateLocation = vi.hoisted(() => vi.fn());
const createLocation = vi.hoisted(() => vi.fn());
const bulkAssignToLocation = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/services/locations/location-service", () => ({
  createLocation,
  updateLocation,
  bulkAssignToLocation,
}));

import {
  archiveLocationAction,
  bulkAssignAction,
  createFullLocationAction,
  updateLocationFulfillmentAction,
  updateLocationHoursAction,
  updateLocationProfileAction,
} from "@/actions/locations";

const LOCATION_ID = "11111111-1111-4111-8111-111111111111";
const TARGET_ID = "22222222-2222-4222-8222-222222222222";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("locations actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      dataUserId: "owner-1",
      sessionUser: { email: "manager@example.com" },
    });
    updateLocation.mockResolvedValue(undefined);
    createLocation.mockResolvedValue({ id: LOCATION_ID });
    bulkAssignToLocation.mockResolvedValue({ updated: 1 });
    recordAuditLog.mockResolvedValue(undefined);
  });

  it("denies updateLocationFulfillmentAction without routes.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("locationId", LOCATION_ID);
    formData.set("pickupEnabled", "on");
    formData.set("minOrderAmountCents", "1500");

    const result = await updateLocationFulfillmentAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("routes.manage");
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(updateLocation).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "locations.permission_denied",
        metadata: expect.objectContaining({
          operation: "locations.update_fulfillment",
          requiredPermission: "routes.manage",
        }),
      }),
    );
  });

  it("denies updateLocationProfileAction without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("locationId", LOCATION_ID);
    formData.set("name", "Main kitchen");

    const result = await updateLocationProfileAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("workspace.settings");
    expect(updateLocation).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "locations.update_profile" }),
      }),
    );
  });

  it("allows updateLocationFulfillmentAction when routes.manage is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("locationId", LOCATION_ID);
    formData.set("pickupEnabled", "on");
    formData.set("deliveryEnabled", "");
    formData.set("pickupInstructions", "");
    formData.set("deliveryInstructions", "");
    formData.set("pickupLeadMinutes", "");
    formData.set("deliveryLeadMinutes", "");
    formData.set("pickupCutoffMinutes", "");
    formData.set("deliveryCutoffMinutes", "");
    formData.set("minOrderAmountCents", "");
    formData.set("deliveryFeeCents", "500");
    formData.set("maxOrdersPerWindow", "");

    const result = await updateLocationFulfillmentAction(formData);

    expect(result).toEqual({ ok: true });
    expect(requireTenantActor).toHaveBeenCalled();
    expect(updateLocation).toHaveBeenCalledWith(
      { userId: "owner-1" },
      LOCATION_ID,
      expect.objectContaining({
        fulfillmentSettingsJson: expect.objectContaining({
          pickupEnabled: true,
          deliveryFeeCents: 500,
        }),
      }),
    );
  });

  it("denies updateLocationHoursAction for delivery hours without routes.manage and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("locationId", LOCATION_ID);
    formData.set("scope", "delivery");

    const result = await updateLocationHoursAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("routes.manage");
    expect(updateLocation).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "locations.update_hours.delivery" }),
      }),
    );
  });

  it("denies archiveLocationAction without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("locationId", LOCATION_ID);

    const result = await archiveLocationAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("workspace.settings");
    expect(updateLocation).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "locations.archive" }),
      }),
    );
  });

  it("allows archiveLocationAction when workspace.settings is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("locationId", LOCATION_ID);

    const result = await archiveLocationAction(formData);

    expect(result).toEqual({ ok: true });
    expect(requireTenantActor).toHaveBeenCalled();
    expect(updateLocation).toHaveBeenCalledWith(
      { userId: "owner-1" },
      LOCATION_ID,
      { status: "ARCHIVED" },
    );
  });

  it("denies createFullLocationAction without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("name", "Downtown kitchen");

    const result = await createFullLocationAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(requireMutationPermission).toHaveBeenCalledWith("workspace.settings");
    expect(createLocation).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "locations.create_full" }),
      }),
    );
  });

  it("denies bulkAssignAction without workspace.settings and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("target", "MENU");
    formData.set("targetIds", TARGET_ID);
    formData.set("locationId", LOCATION_ID);

    const result = await bulkAssignAction(formData);

    expect(result).toEqual({ error: "Forbidden" });
    expect(bulkAssignToLocation).not.toHaveBeenCalled();
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ operation: "locations.bulk_assign" }),
      }),
    );
  });

  it("allows bulkAssignAction when workspace.settings is granted", async () => {
    requireMutationPermission.mockResolvedValue({ ok: true, actor: deniedActor });

    const formData = new FormData();
    formData.set("target", "MENU");
    formData.set("targetIds", TARGET_ID);
    formData.set("locationId", LOCATION_ID);

    const result = await bulkAssignAction(formData);

    expect(result).toEqual({ ok: true, updated: 1 });
    expect(requireTenantActor).toHaveBeenCalled();
    expect(bulkAssignToLocation).toHaveBeenCalledWith(
      { userId: "owner-1" },
      "MENU",
      [TARGET_ID],
      LOCATION_ID,
      "manager@example.com",
    );
  });
});
