import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    activationState: { findUnique: vi.fn() },
    menu: { count: vi.fn() },
    order: { count: vi.fn() },
    staffMember: { count: vi.fn() },
    storefrontSettings: { count: vi.fn() },
    usageEvent: { count: vi.fn() },
    integrationConnection: { count: vi.fn() },
  },
}));

vi.mock("@/lib/scope/workspace-order-scope", () => ({
  orderListWhereForOwner: vi.fn(),
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  menuListWhereForOwner: vi.fn(),
  staffMemberListWhereForOwner: vi.fn(),
  storefrontSettingsListWhereForOwner: vi.fn(),
  usageEventListWhereForOwner: vi.fn(),
  integrationConnectionListWhereForOwner: vi.fn(),
}));

vi.mock("@/lib/scope/resolve-owner-workspace-id", () => ({
  resolveOwnerWorkspaceId: vi.fn(),
}));

vi.mock("@/lib/enterprise/workspace-sso-admin-service", () => ({
  getWorkspaceSsoAdminView: vi.fn(),
}));

import { getWorkspaceSsoAdminView } from "@/lib/enterprise/workspace-sso-admin-service";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import {
  integrationConnectionListWhereForOwner,
  menuListWhereForOwner,
  staffMemberListWhereForOwner,
  storefrontSettingsListWhereForOwner,
  usageEventListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { loadGettingStartedStatus } from "@/services/onboarding/getting-started-status";

const scoped = { workspaceId: "ws-1" };

describe("loadGettingStartedStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(menuListWhereForOwner).mockResolvedValue(scoped);
    vi.mocked(orderListWhereForOwner).mockResolvedValue(scoped);
    vi.mocked(staffMemberListWhereForOwner).mockResolvedValue(scoped);
    vi.mocked(storefrontSettingsListWhereForOwner).mockResolvedValue(scoped);
    vi.mocked(usageEventListWhereForOwner).mockResolvedValue(scoped);
    vi.mocked(integrationConnectionListWhereForOwner).mockResolvedValue(scoped);
    vi.mocked(resolveOwnerWorkspaceId).mockResolvedValue("ws-1");
    vi.mocked(getWorkspaceSsoAdminView).mockResolvedValue({
      workspaceId: "ws-1",
      settings: null,
      ssoEntitlementEnabled: false,
      runtimeGateAllowed: false,
      configured: false,
      active: false,
    });
    vi.mocked(prisma.activationState.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.menu.count).mockResolvedValue(0);
    vi.mocked(prisma.order.count).mockResolvedValue(0);
    vi.mocked(prisma.staffMember.count).mockResolvedValue(0);
    vi.mocked(prisma.storefrontSettings.count).mockResolvedValue(0);
    vi.mocked(prisma.usageEvent.count).mockResolvedValue(0);
    vi.mocked(prisma.integrationConnection.count).mockResolvedValue(0);
  });

  it("scopes menu and order counts by owner workspace", async () => {
    await loadGettingStartedStatus("owner-1", new Date("2026-01-01"));
    expect(prisma.menu.count).toHaveBeenCalledWith({ where: scoped });
    expect(prisma.order.count).toHaveBeenCalledWith({ where: scoped });
    expect(prisma.usageEvent.count).toHaveBeenCalledWith({
      where: { AND: [scoped, { eventName: "pos_first_use" }] },
    });
    expect(prisma.integrationConnection.count).toHaveBeenCalled();
  });
});
