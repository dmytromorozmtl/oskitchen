"use server";

import { revalidatePath } from "next/cache";

import { requirePlatformRole, getPlatformRolesForUser, ensurePlatformOwnerBootstrap } from "@/lib/platform-admin";
import { safeError } from "@/lib/security";
import {
  acknowledgeCronIncident,
  clearCronIncidentAcknowledgement,
} from "@/services/cron/cron-execution-evidence";
import {
  loadProductionIncidentBySourceKey,
  loadProductionIncidentRollup,
  updateProductionIncidentWorkflow,
} from "@/services/incidents/production-incident-rollup-service";
import { buildCriticalCronIncidentSourceKey } from "@/services/incidents/production-incident-source-keys";
import { isAllowedProductionCronSlug } from "@/services/cron/production-manifest";
import type { PlatformRole } from "@prisma/client";

const CRON_INCIDENT_MANAGER_ROLES: PlatformRole[] = [
  "SUPER_ADMIN",
  "PLATFORM_ADMIN",
  "SUPPORT_ADMIN",
  "IMPLEMENTATION_ADMIN",
];

export async function canManageCronIncidentsForUser(user: {
  id: string;
  email?: string | null;
}): Promise<boolean> {
  await ensurePlatformOwnerBootstrap(user.id, user.email ?? "");
  const roles = await getPlatformRolesForUser(user.id);
  return roles.some((role) => CRON_INCIDENT_MANAGER_ROLES.includes(role));
}

export async function acknowledgeCronIncidentForm(
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
  try {
    const user = await requirePlatformRole(CRON_INCIDENT_MANAGER_ROLES);
    const rawSlug = String(formData.get("slug") ?? "").trim();
    if (!isAllowedProductionCronSlug(rawSlug)) {
      return { error: "Unknown production cron." };
    }
    const result = await acknowledgeCronIncident({
      slug: rawSlug,
      acknowledgedByUserId: user.id,
    });
    if ("error" in result) return result;
    await loadProductionIncidentRollup();
    const incident = await loadProductionIncidentBySourceKey(
      buildCriticalCronIncidentSourceKey(rawSlug, result.incidentMarker),
    );
    if (incident) {
      const workflowResult = await updateProductionIncidentWorkflow({
        incidentId: incident.id,
        actorUserId: user.id,
        workflowStatus: "ACKNOWLEDGED",
        assignedToId: incident.assignedToId,
        resolutionSummary: null,
      });
      if ("error" in workflowResult) return workflowResult;
    }
    revalidatePath("/dashboard/system-health");
    revalidatePath("/dashboard/system-health/cron-execution");
    revalidatePath(`/dashboard/system-health/cron-execution/${rawSlug}`);
    revalidatePath("/dashboard/system-health/incidents");
    revalidatePath("/dashboard/error-recovery");
    return { ok: true };
  } catch (error) {
    return { error: safeError(error) };
  }
}

export async function clearCronIncidentAcknowledgementForm(
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
  try {
    const user = await requirePlatformRole(CRON_INCIDENT_MANAGER_ROLES);
    const rawSlug = String(formData.get("slug") ?? "").trim();
    if (!isAllowedProductionCronSlug(rawSlug)) {
      return { error: "Unknown production cron." };
    }
    const result = await clearCronIncidentAcknowledgement({
      slug: rawSlug,
      actorUserId: user.id,
    });
    if ("error" in result) return result;
    if (result.incidentMarker) {
      await loadProductionIncidentRollup();
      const incident = await loadProductionIncidentBySourceKey(
        buildCriticalCronIncidentSourceKey(rawSlug, result.incidentMarker),
      );
      if (incident) {
        const workflowResult = await updateProductionIncidentWorkflow({
          incidentId: incident.id,
          actorUserId: user.id,
          workflowStatus: "OPEN",
          assignedToId: incident.assignedToId,
          resolutionSummary: null,
        });
        if ("error" in workflowResult) return workflowResult;
      }
    }
    revalidatePath("/dashboard/system-health");
    revalidatePath("/dashboard/system-health/cron-execution");
    revalidatePath(`/dashboard/system-health/cron-execution/${rawSlug}`);
    revalidatePath("/dashboard/system-health/incidents");
    revalidatePath("/dashboard/error-recovery");
    return { ok: true };
  } catch (error) {
    return { error: safeError(error) };
  }
}

export async function acknowledgeCronIncidentFormAction(formData: FormData): Promise<void> {
  await acknowledgeCronIncidentForm(formData);
}

export async function clearCronIncidentAcknowledgementFormAction(
  formData: FormData,
): Promise<void> {
  await clearCronIncidentAcknowledgementForm(formData);
}
