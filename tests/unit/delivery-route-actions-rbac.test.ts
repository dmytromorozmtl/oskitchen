import { beforeEach, describe, expect, it, vi } from "vitest";

const requireRouteMutation = vi.hoisted(() => vi.fn());
const createManualRoute = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

vi.mock("@/lib/routes/require-route-mutation", () => ({
  requireRouteMutation,
}));

vi.mock("@/services/routes/route-service", () => ({
  assignDriver: vi.fn(),
  createManualRoute,
  recordRouteEvent: vi.fn(),
  reorderStop: vi.fn(),
  updateStopStatus: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findMany: vi.fn() },
    deliveryRoute: { create: vi.fn(), findFirst: vi.fn() },
    deliveryStop: { create: vi.fn() },
    driverProfile: { create: vi.fn() },
    deliveryZone: { create: vi.fn() },
  },
}));

import { createManualRouteAction } from "@/actions/delivery-route";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "DRIVER" as const,
  email: "driver@example.com",
  granted: new Set<string>(),
  platformBypass: false,
  sessionUser: { id: "staff-1", email: "driver@example.com" },
  userId: "owner-1",
};

describe("delivery route actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createManualRoute.mockResolvedValue("route-1");
  });

  it("denies createManualRouteAction without routes.manage", async () => {
    requireRouteMutation.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("routeDate", "2026-06-01");
    formData.set("title", "Downtown");

    const result = await createManualRouteAction(formData);

    expect(result).toEqual({ error: "You do not have permission to perform this action." });
    expect(requireRouteMutation).toHaveBeenCalledWith({ operation: "delivery_route.create_manual" });
    expect(createManualRoute).not.toHaveBeenCalled();
  });

  it("allows createManualRouteAction when routes.manage passes", async () => {
    requireRouteMutation.mockResolvedValue({
      ok: true,
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("routeDate", "2026-06-15");
    formData.set("title", "");
    formData.set("driverName", "");
    formData.set("vehicleName", "");
    formData.set("brandId", "");
    formData.set("locationId", "");
    formData.set("zoneId", "");
    formData.set("mode", "");
    formData.set("notes", "");

    const result = await createManualRouteAction(formData);

    expect(result).toEqual({ ok: true, routeId: "route-1" });
    expect(createManualRoute).toHaveBeenCalled();
  });
});
