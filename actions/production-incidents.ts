"use server";

import { KitchenTaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  ensurePlatformOwnerBootstrap,
  getPlatformRolesForUser,
  isSuperAdminEmail,
  requirePlatformRole,
} from "@/lib/platform-admin";
import { safeError } from "@/lib/security";
import {
  acknowledgeCronIncident,
  clearCronIncidentAcknowledgement,
} from "@/services/cron/cron-execution-evidence";
import { updateProductionIncidentRemediationTaskStatusForPlatform } from "@/services/incidents/production-incident-platform-task-service";
import {
  PRODUCTION_INCIDENT_MANAGER_ROLES,
  PRODUCTION_INCIDENT_REMEDIATION_CONTROL_STATUSES,
  PRODUCTION_INCIDENT_REVIEW_STATUSES,
  PRODUCTION_INCIDENT_ROOT_CAUSE_CATEGORIES,
  updateProductionIncidentRemediationControl,
  updateProductionIncidentReview,
  updateProductionIncidentWorkflow,
  type ProductionIncidentRemediationControlStatus,
  type ProductionIncidentReviewStatus,
  type ProductionIncidentRootCauseCategory,
  type ProductionIncidentWorkflowStatus,
} from "@/services/incidents/production-incident-rollup-service";
import { isAllowedProductionCronSlug } from "@/services/cron/production-manifest";

export async function canManageProductionIncidentsForUser(user: {
  id: string;
  email?: string | null;
}): Promise<boolean> {
  await ensurePlatformOwnerBootstrap(user.id, user.email ?? "");
  if (isSuperAdminEmail(user.email)) return true;
  const roles = await getPlatformRolesForUser(user.id);
  return roles.some((role) => PRODUCTION_INCIDENT_MANAGER_ROLES.includes(role));
}

const workflowSchema = z.object({
  incidentId: z.string().uuid(),
  workflowStatus: z.enum(["OPEN", "ACKNOWLEDGED", "MONITORING", "RESOLVED"]),
  assignedToId: z.string().uuid().nullable().optional(),
  resolutionSummary: z.string().max(2000).nullable().optional(),
});

const reviewSchema = z.object({
  incidentId: z.string().uuid(),
  reviewStatus: z.enum(PRODUCTION_INCIDENT_REVIEW_STATUSES),
  rootCauseCategory: z.enum(PRODUCTION_INCIDENT_ROOT_CAUSE_CATEGORIES).nullable().optional(),
  remediationOwnerId: z.string().uuid().nullable().optional(),
  remediationDueOn: z.string().nullable().optional(),
  reviewSummary: z.string().max(4000).nullable().optional(),
});

const remediationControlSchema = z.object({
  incidentId: z.string().uuid(),
  remediationControlStatus: z.enum(PRODUCTION_INCIDENT_REMEDIATION_CONTROL_STATUSES),
  remediationSnoozedUntilOn: z.string().nullable().optional(),
  remediationControlSummary: z.string().max(2000).nullable().optional(),
});

const remediationTaskStatusSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING", "DONE"]),
});

function parseDateOnlyToEndOfDayUtc(value: string | null): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error("Remediation due date must use YYYY-MM-DD format.");
  }
  const [, year, month, day] = match;
  const parsed = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999),
  );
  if (
    parsed.getUTCFullYear() !== Number(year) ||
    parsed.getUTCMonth() !== Number(month) - 1 ||
    parsed.getUTCDate() !== Number(day)
  ) {
    throw new Error("Remediation due date is invalid.");
  }
  return parsed;
}

function revalidateProductionIncidentSurfaces(rawSlug?: string | null) {
  revalidatePath("/dashboard/system-health");
  revalidatePath("/dashboard/system-health/incidents");
  revalidatePath("/dashboard/system-health/cron-execution");
  revalidatePath("/dashboard/error-recovery");
  revalidatePath("/platform/dashboard");
  revalidatePath("/platform/health");
  revalidatePath("/platform/error-recovery");
  revalidatePath("/platform/incidents");
  revalidatePath("/platform/webhooks");
  if (rawSlug) {
    revalidatePath(`/dashboard/system-health/cron-execution/${rawSlug}`);
  }
}

export async function updateProductionIncidentWorkflowForm(
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
  try {
    const user = await requirePlatformRole(PRODUCTION_INCIDENT_MANAGER_ROLES);
    const parsed = workflowSchema.parse({
      incidentId: formData.get("incidentId"),
      workflowStatus: formData.get("workflowStatus"),
      assignedToId: (formData.get("assignedToId") as string) || null,
      resolutionSummary: (formData.get("resolutionSummary") as string) || null,
    });

    const result = await updateProductionIncidentWorkflow({
      incidentId: parsed.incidentId,
      actorUserId: user.id,
      workflowStatus: parsed.workflowStatus as ProductionIncidentWorkflowStatus,
      assignedToId: parsed.assignedToId ?? null,
      resolutionSummary: parsed.resolutionSummary ?? null,
    });
    if ("error" in result) return result;

    if (result.incident.source === "critical_cron") {
      const rawSlug = result.incident.metadataJson?.slug;
      if (typeof rawSlug === "string" && isAllowedProductionCronSlug(rawSlug)) {
        if (parsed.workflowStatus === "OPEN") {
          const syncResult = await clearCronIncidentAcknowledgement({
            slug: rawSlug,
            actorUserId: user.id,
          });
          if ("error" in syncResult) return syncResult;
        } else {
          const syncResult = await acknowledgeCronIncident({
            slug: rawSlug,
            acknowledgedByUserId: user.id,
          });
          if ("error" in syncResult) return syncResult;
        }
      }
    }

    revalidateProductionIncidentSurfaces(
      result.incident.source === "critical_cron" &&
        typeof result.incident.metadataJson?.slug === "string"
        ? result.incident.metadataJson.slug
        : null,
    );
    return { ok: true };
  } catch (error) {
    return { error: safeError(error) };
  }
}

export async function updateProductionIncidentReviewForm(
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
  try {
    const user = await requirePlatformRole(PRODUCTION_INCIDENT_MANAGER_ROLES);
    const parsed = reviewSchema.parse({
      incidentId: formData.get("incidentId"),
      reviewStatus: formData.get("reviewStatus"),
      rootCauseCategory: (formData.get("rootCauseCategory") as string) || null,
      remediationOwnerId: (formData.get("remediationOwnerId") as string) || null,
      remediationDueOn: (formData.get("remediationDueOn") as string) || null,
      reviewSummary: (formData.get("reviewSummary") as string) || null,
    });
    const remediationDueAt = parseDateOnlyToEndOfDayUtc(parsed.remediationDueOn ?? null);

    const result = await updateProductionIncidentReview({
      incidentId: parsed.incidentId,
      actorUserId: user.id,
      reviewStatus: parsed.reviewStatus as ProductionIncidentReviewStatus,
      rootCauseCategory:
        (parsed.rootCauseCategory as ProductionIncidentRootCauseCategory | null) ?? null,
      remediationOwnerId: parsed.remediationOwnerId ?? null,
      remediationDueAt,
      reviewSummary: parsed.reviewSummary ?? null,
    });
    if ("error" in result) return result;

    revalidateProductionIncidentSurfaces();
    return { ok: true };
  } catch (error) {
    return { error: safeError(error) };
  }
}

export async function updateProductionIncidentRemediationControlForm(
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
  try {
    const user = await requirePlatformRole(PRODUCTION_INCIDENT_MANAGER_ROLES);
    const parsed = remediationControlSchema.parse({
      incidentId: formData.get("incidentId"),
      remediationControlStatus: formData.get("remediationControlStatus"),
      remediationSnoozedUntilOn:
        (formData.get("remediationSnoozedUntilOn") as string) || null,
      remediationControlSummary:
        (formData.get("remediationControlSummary") as string) || null,
    });
    const remediationSnoozedUntil = parseDateOnlyToEndOfDayUtc(
      parsed.remediationSnoozedUntilOn ?? null,
    );

    const result = await updateProductionIncidentRemediationControl({
      incidentId: parsed.incidentId,
      actorUserId: user.id,
      remediationControlStatus:
        parsed.remediationControlStatus as ProductionIncidentRemediationControlStatus,
      remediationSnoozedUntil,
      remediationControlSummary: parsed.remediationControlSummary ?? null,
    });
    if ("error" in result) return result;

    revalidateProductionIncidentSurfaces();
    return { ok: true };
  } catch (error) {
    return { error: safeError(error) };
  }
}

export async function updateProductionIncidentRemediationTaskStatusForm(
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
  try {
    const user = await requirePlatformRole(PRODUCTION_INCIDENT_MANAGER_ROLES);
    const parsed = remediationTaskStatusSchema.parse({
      taskId: formData.get("taskId"),
      status: formData.get("status"),
    });

    const result = await updateProductionIncidentRemediationTaskStatusForPlatform({
      taskId: parsed.taskId,
      to: parsed.status as KitchenTaskStatus,
      actorUserId: user.id,
      performedBy: user.email ?? null,
    });
    if ("error" in result) return result;

    revalidatePath(`/platform/tasks/remediation/${parsed.taskId}`);
    revalidatePath(`/dashboard/tasks/${parsed.taskId}`);
    revalidateProductionIncidentSurfaces();
    return { ok: true };
  } catch (error) {
    return { error: safeError(error) };
  }
}

export async function updateProductionIncidentWorkflowFormAction(
  formData: FormData,
): Promise<void> {
  await updateProductionIncidentWorkflowForm(formData);
}

export async function updateProductionIncidentReviewFormAction(
  formData: FormData,
): Promise<void> {
  await updateProductionIncidentReviewForm(formData);
}

export async function updateProductionIncidentRemediationControlFormAction(
  formData: FormData,
): Promise<void> {
  await updateProductionIncidentRemediationControlForm(formData);
}

export async function updateProductionIncidentRemediationTaskStatusFormAction(
  formData: FormData,
): Promise<void> {
  await updateProductionIncidentRemediationTaskStatusForm(formData);
}
