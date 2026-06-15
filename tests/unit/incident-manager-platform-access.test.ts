import { beforeEach, describe, expect, it, vi } from "vitest";

const getPlatformRolesForUser = vi.hoisted(() => vi.fn());
const ensurePlatformOwnerBootstrap = vi.hoisted(() => vi.fn());

vi.mock("@/lib/platform-admin", () => ({
  getPlatformRolesForUser,
  ensurePlatformOwnerBootstrap,
  requirePlatformRole: vi.fn(),
}));

vi.mock("@/services/cron/cron-execution-evidence", () => ({
  acknowledgeCronIncident: vi.fn(),
  clearCronIncidentAcknowledgement: vi.fn(),
}));

vi.mock("@/services/incidents/production-incident-rollup-service", () => ({
  PRODUCTION_INCIDENT_MANAGER_ROLES: [
    "SUPER_ADMIN",
    "PLATFORM_ADMIN",
    "SUPPORT_ADMIN",
    "IMPLEMENTATION_ADMIN",
  ],
  loadProductionIncidentRollup: vi.fn(),
  loadProductionIncidentBySourceKey: vi.fn(),
  updateProductionIncidentWorkflow: vi.fn(),
  updateProductionIncidentReview: vi.fn(),
  updateProductionIncidentRemediationControl: vi.fn(),
  PRODUCTION_INCIDENT_REVIEW_STATUSES: [],
  PRODUCTION_INCIDENT_REMEDIATION_CONTROL_STATUSES: [],
  PRODUCTION_INCIDENT_ROOT_CAUSE_CATEGORIES: [],
}));

vi.mock("@/services/incidents/production-incident-platform-task-service", () => ({
  updateProductionIncidentRemediationTaskStatusForPlatform: vi.fn(),
}));

vi.mock("@/services/cron/production-manifest", () => ({
  isAllowedProductionCronSlug: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { canManageCronIncidentsForUser } from "@/actions/cron-incidents";
import { canManageProductionIncidentsForUser } from "@/actions/production-incidents";

describe("incident manager platform access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ensurePlatformOwnerBootstrap.mockResolvedValue(undefined);
  });

  it("denies cron incident management when bootstrap email lacks platform role row", async () => {
    getPlatformRolesForUser.mockResolvedValue([]);

    await expect(
      canManageCronIncidentsForUser({
        id: "user-1",
        email: "workspace.moroz@gmail.com",
      }),
    ).resolves.toBe(false);
    expect(ensurePlatformOwnerBootstrap).toHaveBeenCalledWith(
      "user-1",
      "workspace.moroz@gmail.com",
    );
  });

  it("allows cron incident management when SUPER_ADMIN role row exists", async () => {
    getPlatformRolesForUser.mockResolvedValue(["SUPER_ADMIN"]);

    await expect(
      canManageCronIncidentsForUser({
        id: "user-1",
        email: "ops@example.com",
      }),
    ).resolves.toBe(true);
  });

  it("allows cron incident management for support admin role row", async () => {
    getPlatformRolesForUser.mockResolvedValue(["SUPPORT_ADMIN"]);

    await expect(
      canManageCronIncidentsForUser({
        id: "user-2",
        email: "support@example.com",
      }),
    ).resolves.toBe(true);
  });

  it("denies production incident management when bootstrap email lacks platform role row", async () => {
    getPlatformRolesForUser.mockResolvedValue([]);

    await expect(
      canManageProductionIncidentsForUser({
        id: "user-1",
        email: "workspace.moroz@gmail.com",
      }),
    ).resolves.toBe(false);
  });

  it("allows production incident management when platform admin role row exists", async () => {
    getPlatformRolesForUser.mockResolvedValue(["PLATFORM_ADMIN"]);

    await expect(
      canManageProductionIncidentsForUser({
        id: "user-3",
        email: "platform@example.com",
      }),
    ).resolves.toBe(true);
  });
});
