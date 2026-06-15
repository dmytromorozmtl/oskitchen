import { beforeEach, describe, expect, it, vi } from "vitest";

const requirePlatformRole = vi.hoisted(() => vi.fn());
const acknowledgeCronIncident = vi.hoisted(() => vi.fn());
const clearCronIncidentAcknowledgement = vi.hoisted(() => vi.fn());
const loadProductionIncidentRollup = vi.hoisted(() => vi.fn());
const loadProductionIncidentBySourceKey = vi.hoisted(() => vi.fn());
const updateProductionIncidentWorkflow = vi.hoisted(() => vi.fn());
const revalidatePath = vi.hoisted(() => vi.fn());

vi.mock("@/lib/platform-admin", () => ({
  requirePlatformRole,
  isSuperAdminEmail: vi.fn((email: string | null | undefined) => email === "root@example.com"),
  getPlatformRolesForUser: vi.fn(async () => ["PLATFORM_ADMIN"]),
  ensurePlatformOwnerBootstrap: vi.fn(async () => undefined),
}));

vi.mock("@/services/cron/cron-execution-evidence", () => ({
  acknowledgeCronIncident,
  clearCronIncidentAcknowledgement,
}));
vi.mock("@/services/incidents/production-incident-rollup-service", () => ({
  loadProductionIncidentRollup,
  loadProductionIncidentBySourceKey,
  updateProductionIncidentWorkflow,
}));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

import {
  acknowledgeCronIncidentForm,
  clearCronIncidentAcknowledgementForm,
} from "@/actions/cron-incidents";

describe("cron incidents actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePlatformRole.mockResolvedValue({ id: "platform-user-1", email: "ops@example.com" });
    acknowledgeCronIncident.mockResolvedValue({ ok: true, incidentMarker: "failed:2026-05-25T16:00:00.000Z" });
    clearCronIncidentAcknowledgement.mockResolvedValue({ ok: true, incidentMarker: "failed:2026-05-25T16:00:00.000Z" });
    loadProductionIncidentRollup.mockResolvedValue({ items: [], summary: {}, timeline: [] });
    loadProductionIncidentBySourceKey.mockResolvedValue({
      id: "incident-1",
      source: "critical_cron",
      sourceKey: "critical-cron:webhook-jobs:failed:2026-05-25T16:00:00.000Z",
      workflowStatus: "OPEN",
      assignedToId: "owner-1",
      metadataJson: { slug: "webhook-jobs" },
    });
    updateProductionIncidentWorkflow.mockResolvedValue({
      ok: true,
      incident: {
        id: "incident-1",
        source: "critical_cron",
        sourceKey: "critical-cron:webhook-jobs:failed:2026-05-25T16:00:00.000Z",
        workflowStatus: "ACKNOWLEDGED",
        assignedToId: "owner-1",
        metadataJson: { slug: "webhook-jobs" },
      },
    });
  });

  it("acknowledges a valid production cron incident and revalidates ops pages", async () => {
    const formData = new FormData();
    formData.set("slug", "webhook-jobs");

    await expect(acknowledgeCronIncidentForm(formData)).resolves.toEqual({ ok: true });
    expect(acknowledgeCronIncident).toHaveBeenCalledWith({
      slug: "webhook-jobs",
      acknowledgedByUserId: "platform-user-1",
    });
    expect(updateProductionIncidentWorkflow).toHaveBeenCalledWith({
      incidentId: "incident-1",
      actorUserId: "platform-user-1",
      workflowStatus: "ACKNOWLEDGED",
      assignedToId: "owner-1",
      resolutionSummary: null,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/system-health/cron-execution");
  });

  it("rejects unknown cron slugs", async () => {
    const formData = new FormData();
    formData.set("slug", "not-a-real-cron");

    await expect(acknowledgeCronIncidentForm(formData)).resolves.toEqual({
      error: "Unknown production cron.",
    });
    expect(acknowledgeCronIncident).not.toHaveBeenCalled();
  });

  it("clears acknowledgement for a valid production cron incident", async () => {
    const formData = new FormData();
    formData.set("slug", "doordash-sync");

    await expect(clearCronIncidentAcknowledgementForm(formData)).resolves.toEqual({ ok: true });
    expect(clearCronIncidentAcknowledgement).toHaveBeenCalledWith({
      slug: "doordash-sync",
      actorUserId: "platform-user-1",
    });
    expect(updateProductionIncidentWorkflow).toHaveBeenCalledWith({
      incidentId: "incident-1",
      actorUserId: "platform-user-1",
      workflowStatus: "OPEN",
      assignedToId: "owner-1",
      resolutionSummary: null,
    });
  });
});
