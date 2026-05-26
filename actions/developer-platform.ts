"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

import { auditLog } from "@/services/audit/audit-service";
import { requireDeveloperCenterAccess } from "@/lib/developer/developer-permissions";
import { getProductionLaunchGaps } from "@/lib/env";
import type { IncidentSeverity, IncidentStatus } from "@/lib/developer/incident-severity";
import { INCIDENT_SEVERITIES, INCIDENT_STATUSES } from "@/lib/developer/incident-severity";

function isSeverity(v: string): v is IncidentSeverity {
  return (INCIDENT_SEVERITIES as readonly string[]).includes(v);
}

function isStatus(v: string): v is IncidentStatus {
  return (INCIDENT_STATUSES as readonly string[]).includes(v);
}

export async function createPlatformIncidentAction(formData: FormData): Promise<void> {
  try {
    const ctx = await requireDeveloperCenterAccess();
    const title = String(formData.get("title") ?? "").trim().slice(0, 200);
    if (!title) return;
    const severityRaw = String(formData.get("severity") ?? "medium");
    const statusRaw = String(formData.get("status") ?? "investigating");
    const severity = isSeverity(severityRaw) ? severityRaw : "medium";
    const status = isStatus(statusRaw) ? statusRaw : "investigating";
    const affected = String(formData.get("affectedSystems") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20);
    const mitigation = String(formData.get("mitigation") ?? "").trim().slice(0, 4000) || undefined;
    const visibility = String(formData.get("visibility") ?? "internal") === "public" ? "public" : "internal";

    const incidentId = randomUUID();

    await auditLog({
      actor: { userId: ctx.userId, email: ctx.email ?? null, role: ctx.role },
      action: "platform.incident.open",
      category: "DEVELOPER",
      source: "USER",
      severity:
        severity === "critical"
          ? "CRITICAL"
          : severity === "high"
            ? "WARNING"
            : "INFO",
      entity: { type: "platform_incident", id: incidentId, label: title },
      metadata: {
        incidentId,
        title,
        severity,
        status,
        affectedSystems: affected,
        mitigation,
        visibility,
      },
    });

    revalidatePath("/dashboard/developer");
    revalidatePath("/dashboard/developer/incidents");
  } catch {
    /* ignore */
  }
}

export async function validateEnvironmentNowAction(_formData?: FormData): Promise<void> {
  try {
    const ctx = await requireDeveloperCenterAccess();
    const gaps = getProductionLaunchGaps();
    await auditLog({
      actor: { userId: ctx.userId, email: ctx.email ?? null, role: ctx.role },
      action: "developer.environment.validate",
      category: "DEVELOPER",
      source: "USER",
      entity: { type: "environment", id: "validation", label: "Environment validation" },
      metadata: { gapCount: gaps.length },
    });
    revalidatePath("/dashboard/developer");
    revalidatePath("/dashboard/developer/health");
  } catch {
    /* ignore */
  }
}

export async function recordDeveloperToolInvocationAction(input: {
  toolId: string;
  detail?: string;
}): Promise<void> {
  const ctx = await requireDeveloperCenterAccess();
  await auditLog({
    actor: { userId: ctx.userId, email: ctx.email ?? null, role: ctx.role },
    action: `developer.tool.${input.toolId}`,
    category: "DEVELOPER",
    source: "USER",
    entity: { type: "developer_tool", id: input.toolId },
    metadata: input.detail ? { detail: input.detail.slice(0, 500) } : undefined,
  });
  revalidatePath("/dashboard/developer/tools");
  revalidatePath("/dashboard/developer/logs");
}

export async function recordDeveloperPingAction(_formData?: FormData): Promise<void> {
  await recordDeveloperToolInvocationAction({
    toolId: "ping",
    detail: "manual developer console ping",
  });
}
