import { beforeEach, describe, expect, it, vi } from "vitest";

const requirePlatformRole = vi.hoisted(() => vi.fn());
const updateProductionIncidentWorkflow = vi.hoisted(() => vi.fn());
const updateProductionIncidentReview = vi.hoisted(() => vi.fn());
const updateProductionIncidentRemediationControl = vi.hoisted(() => vi.fn());
const updateProductionIncidentRemediationTaskStatusForPlatform = vi.hoisted(() => vi.fn());
const acknowledgeCronIncident = vi.hoisted(() => vi.fn());
const clearCronIncidentAcknowledgement = vi.hoisted(() => vi.fn());
const revalidatePath = vi.hoisted(() => vi.fn());

vi.mock("@/lib/platform-admin", () => ({
  requirePlatformRole,
}));

vi.mock("@/services/incidents/production-incident-rollup-service", () => ({
  PRODUCTION_INCIDENT_MANAGER_ROLES: [
    "SUPER_ADMIN",
    "PLATFORM_ADMIN",
    "SUPPORT_ADMIN",
    "IMPLEMENTATION_ADMIN",
  ],
  PRODUCTION_INCIDENT_REVIEW_STATUSES: ["PENDING", "IN_REMEDIATION", "COMPLETED"],
  PRODUCTION_INCIDENT_REMEDIATION_CONTROL_STATUSES: [
    "TRACKING",
    "OWNER_ENGAGED",
    "SNOOZED",
    "REASSIGNMENT_REQUESTED",
  ],
  PRODUCTION_INCIDENT_ROOT_CAUSE_CATEGORIES: [
    "configuration",
    "code_regression",
    "dependency",
    "capacity",
    "data_integrity",
    "operator_error",
    "third_party",
    "unknown",
  ],
  updateProductionIncidentRemediationControl,
  updateProductionIncidentReview,
  updateProductionIncidentWorkflow,
}));
vi.mock("@/services/cron/cron-execution-evidence", () => ({
  acknowledgeCronIncident,
  clearCronIncidentAcknowledgement,
}));
vi.mock("@/services/incidents/production-incident-platform-task-service", () => ({
  updateProductionIncidentRemediationTaskStatusForPlatform,
}));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

import {
  updateProductionIncidentRemediationControlForm,
  updateProductionIncidentRemediationTaskStatusForm,
  updateProductionIncidentReviewForm,
  updateProductionIncidentWorkflowForm,
} from "@/actions/production-incidents";

describe("production incidents actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePlatformRole.mockResolvedValue({ id: "platform-user-1", email: "ops@example.com" });
    updateProductionIncidentWorkflow.mockResolvedValue({
      ok: true,
      incident: {
        id: "11111111-1111-1111-1111-111111111111",
        source: "startup_readiness",
        sourceKey: "startup:rate_limit",
        workflowStatus: "MONITORING",
        assignedToId: "22222222-2222-2222-2222-222222222222",
        metadataJson: null,
      },
    });
    updateProductionIncidentReview.mockResolvedValue({ ok: true });
    updateProductionIncidentRemediationControl.mockResolvedValue({ ok: true });
    updateProductionIncidentRemediationTaskStatusForPlatform.mockResolvedValue({ ok: true });
    acknowledgeCronIncident.mockResolvedValue({ ok: true, incidentMarker: "failed:2026-05-25T16:00:00.000Z" });
    clearCronIncidentAcknowledgement.mockResolvedValue({ ok: true, incidentMarker: "failed:2026-05-25T16:00:00.000Z" });
  });

  it("updates a valid production incident workflow and revalidates ops surfaces", async () => {
    const formData = new FormData();
    formData.set("incidentId", "11111111-1111-1111-1111-111111111111");
    formData.set("workflowStatus", "MONITORING");
    formData.set("assignedToId", "22222222-2222-2222-2222-222222222222");
    formData.set("resolutionSummary", "");

    await expect(updateProductionIncidentWorkflowForm(formData)).resolves.toEqual({ ok: true });
    expect(updateProductionIncidentWorkflow).toHaveBeenCalledWith({
      incidentId: "11111111-1111-1111-1111-111111111111",
      actorUserId: "platform-user-1",
      workflowStatus: "MONITORING",
      assignedToId: "22222222-2222-2222-2222-222222222222",
      resolutionSummary: null,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/system-health/incidents");
    expect(revalidatePath).toHaveBeenCalledWith("/platform/incidents");
  });

  it("rejects malformed workflow payloads", async () => {
    const formData = new FormData();
    formData.set("incidentId", "not-a-uuid");
    formData.set("workflowStatus", "OPEN");

    const result = await updateProductionIncidentWorkflowForm(formData);

    expect(result).toEqual({
      error: expect.stringContaining("Invalid"),
    });
    expect(updateProductionIncidentWorkflow).not.toHaveBeenCalled();
  });

  it("mirrors critical cron workflow updates back into heartbeat acknowledgement", async () => {
    updateProductionIncidentWorkflow.mockResolvedValue({
      ok: true,
      incident: {
        id: "11111111-1111-1111-1111-111111111111",
        source: "critical_cron",
        sourceKey: "critical-cron:webhook-jobs:failed:2026-05-25T16:00:00.000Z",
        workflowStatus: "ACKNOWLEDGED",
        assignedToId: null,
        metadataJson: { slug: "webhook-jobs" },
      },
    });

    const formData = new FormData();
    formData.set("incidentId", "11111111-1111-1111-1111-111111111111");
    formData.set("workflowStatus", "ACKNOWLEDGED");

    await expect(updateProductionIncidentWorkflowForm(formData)).resolves.toEqual({ ok: true });
    expect(acknowledgeCronIncident).toHaveBeenCalledWith({
      slug: "webhook-jobs",
      acknowledgedByUserId: "platform-user-1",
    });
  });

  it("updates incident review metadata and revalidates executive surfaces", async () => {
    const formData = new FormData();
    formData.set("incidentId", "11111111-1111-1111-1111-111111111111");
    formData.set("reviewStatus", "COMPLETED");
    formData.set("rootCauseCategory", "configuration");
    formData.set("remediationOwnerId", "22222222-2222-2222-2222-222222222222");
    formData.set("remediationDueOn", "2026-05-30");
    formData.set("reviewSummary", "Distributed limiter was misconfigured in production.");

    await expect(updateProductionIncidentReviewForm(formData)).resolves.toEqual({ ok: true });
    expect(updateProductionIncidentReview).toHaveBeenCalledWith({
      incidentId: "11111111-1111-1111-1111-111111111111",
      actorUserId: "platform-user-1",
      reviewStatus: "COMPLETED",
      rootCauseCategory: "configuration",
      remediationOwnerId: "22222222-2222-2222-2222-222222222222",
      remediationDueAt: new Date("2026-05-30T23:59:59.999Z"),
      reviewSummary: "Distributed limiter was misconfigured in production.",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/platform/dashboard");
    expect(revalidatePath).toHaveBeenCalledWith("/platform/incidents");
  });

  it("updates remediation controls with snooze semantics", async () => {
    const formData = new FormData();
    formData.set("incidentId", "11111111-1111-1111-1111-111111111111");
    formData.set("remediationControlStatus", "SNOOZED");
    formData.set("remediationSnoozedUntilOn", "2026-06-02");
    formData.set("remediationControlSummary", "Vendor maintenance window approved by platform.");

    await expect(updateProductionIncidentRemediationControlForm(formData)).resolves.toEqual({
      ok: true,
    });
    expect(updateProductionIncidentRemediationControl).toHaveBeenCalledWith({
      incidentId: "11111111-1111-1111-1111-111111111111",
      actorUserId: "platform-user-1",
      remediationControlStatus: "SNOOZED",
      remediationSnoozedUntil: new Date("2026-06-02T23:59:59.999Z"),
      remediationControlSummary: "Vendor maintenance window approved by platform.",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/platform/incidents");
  });

  it("updates platform remediation task status and revalidates linked surfaces", async () => {
    const formData = new FormData();
    formData.set("taskId", "33333333-3333-3333-3333-333333333333");
    formData.set("status", "DONE");

    await expect(updateProductionIncidentRemediationTaskStatusForm(formData)).resolves.toEqual({
      ok: true,
    });
    expect(updateProductionIncidentRemediationTaskStatusForPlatform).toHaveBeenCalledWith({
      taskId: "33333333-3333-3333-3333-333333333333",
      to: "DONE",
      actorUserId: "platform-user-1",
      performedBy: "ops@example.com",
    });
    expect(revalidatePath).toHaveBeenCalledWith(
      "/platform/tasks/remediation/33333333-3333-3333-3333-333333333333",
    );
    expect(revalidatePath).toHaveBeenCalledWith(
      "/dashboard/tasks/33333333-3333-3333-3333-333333333333",
    );
    expect(revalidatePath).toHaveBeenCalledWith("/platform/incidents");
  });
});
