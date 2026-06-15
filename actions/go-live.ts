"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserProfile } from "@/lib/auth";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { resolveGoLiveActorScope } from "@/lib/go-live/resolve-go-live-actor-scope";
import {
  canUseGoLive,
  type GoLiveCapability,
} from "@/lib/go-live/go-live-permissions";
import { workspacePermissionForGoLiveCapability } from "@/lib/go-live/go-live-mutation-permission";
import { logGoLivePermissionDenied } from "@/services/go-live/go-live-permission-audit";
import { IMPLEMENTATION_INTEGRATIONS } from "@/lib/implementation/implementation-types";
import {
  createIncident,
  createProject,
  createRollbackPlan,
  recordApproval,
  refreshAutoValidation,
  runSimulationForProject,
  transitionStatus,
  updateChecklistItem,
  updateIncident,
} from "@/services/go-live/go-live-service";
import type {
  BusinessType,
  GoLiveApprovalType,
  GoLiveBlockerSeverity,
  GoLiveChecklistStatus,
  GoLiveIncidentCategory,
  GoLiveIncidentSeverity,
  GoLiveIncidentStatus,
  GoLiveLaunchMode,
  GoLiveLaunchStatus,
  GoLiveSimulationType,
} from "@prisma/client";

const BUSINESS_TYPES = [
  "MEAL_PREP", "CATERING", "GHOST_KITCHEN", "CLOUD_KITCHEN", "MULTI_BRAND",
  "BAKERY", "RESTAURANT", "CAFE", "BAR", "OTHER",
] as const;

const LAUNCH_MODES = ["PILOT", "SOFT", "FULL", "PHASED"] as const;
const LAUNCH_STATUSES = [
  "NOT_STARTED", "IN_PROGRESS", "NEEDS_REVIEW", "BLOCKED", "READY", "APPROVED",
  "LIVE", "POST_LAUNCH_MONITORING", "ROLLBACK_MODE", "COMPLETED",
] as const;
const CHECKLIST_STATUSES = ["TODO", "IN_PROGRESS", "NEEDS_REVIEW", "BLOCKED", "DONE", "WAIVED"] as const;
const APPROVAL_TYPES = ["OPERATIONS", "KITCHEN", "FINANCE", "INTEGRATIONS", "SUPPORT", "OWNERSHIP"] as const;
const SIMULATION_TYPES = [
  "LUNCH_RUSH", "MEAL_PREP_BATCH", "CATERING_EVENT", "MULTI_LOCATION_DAY",
  "DELIVERY_SURGE", "HOLIDAY_VOLUME", "GHOST_KITCHEN_SPIKE", "CUSTOM",
] as const;
const INCIDENT_SEVERITIES = ["INFO", "WARNING", "MAJOR", "CRITICAL"] as const;
const INCIDENT_CATEGORIES = [
  "INTEGRATIONS", "KITCHEN", "PACKING", "ROUTES", "STAFFING",
  "PAYMENTS", "STOREFRONT", "ANALYTICS", "IMPORTS", "PERMISSIONS", "OTHER",
] as const;
const INCIDENT_STATUSES = ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
const BLOCKER_SEVERITIES = ["INFO", "WARNING", "HIGH_RISK", "CRITICAL"] as const;

async function gate(capability: GoLiveCapability) {
  const required = workspacePermissionForGoLiveCapability(capability);
  const access = await requireMutationPermission(required);
  const profile = await requireUserProfile();
  if (!access.ok) {
    await logGoLivePermissionDenied(access.actor, {
      requiredPermission: required,
      operation: capability,
      goLiveCapability: capability,
    });
    throw new Error(access.error);
  }
  const scope = resolveGoLiveActorScope({
    workspaceRole: access.actor.workspaceRole,
    email: access.actor.email,
    profileRole: profile.role ?? null,
    profileEmail: profile.email ?? null,
    platformBypass: access.actor.platformBypass,
  });
  if (!canUseGoLive(scope, capability)) {
    await logGoLivePermissionDenied(access.actor, {
      requiredPermission: required,
      operation: capability,
      goLiveCapability: capability,
    });
    throw new Error(`You do not have permission to ${capability}.`);
  }
  return { userId: access.actor.userId, profileId: profile.id };
}

const createProjectSchema = z.object({
  brandId: z.string().uuid().nullable().optional(),
  locationId: z.string().uuid().nullable().optional(),
  businessType: z.enum(BUSINESS_TYPES).nullable().optional(),
  launchDate: z.string().nullable().optional(),
  launchMode: z.enum(LAUNCH_MODES).optional(),
  goLiveOwnerId: z.string().uuid().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  integrations: z.array(z.string()).optional(),
});

export async function createGoLiveProjectAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("go-live.create");
  const parsed = createProjectSchema.parse({
    brandId: (formData.get("brandId") as string) || null,
    locationId: (formData.get("locationId") as string) || null,
    businessType: (formData.get("businessType") as string) || null,
    launchDate: (formData.get("launchDate") as string) || null,
    launchMode: (formData.get("launchMode") as string) || undefined,
    goLiveOwnerId: (formData.get("goLiveOwnerId") as string) || null,
    notes: (formData.get("notes") as string) || null,
    integrations: formData
      .getAll("integrations")
      .map((value) => String(value))
      .filter((value) => IMPLEMENTATION_INTEGRATIONS.some((entry) => entry.key === value)),
  });
  const project = await createProject({
    userId,
    performedById: profileId,
    brandId: parsed.brandId ?? null,
    locationId: parsed.locationId ?? null,
    businessType: (parsed.businessType ?? null) as BusinessType | null,
    launchDate: parsed.launchDate ? new Date(parsed.launchDate) : null,
    launchMode: (parsed.launchMode ?? "SOFT") as GoLiveLaunchMode,
    goLiveOwnerId: parsed.goLiveOwnerId ?? null,
    notes: parsed.notes ?? null,
    integrations: parsed.integrations ?? [],
  });
  await refreshAutoValidation(userId, project.id);
  revalidatePath("/dashboard/go-live");
}

const refreshSchema = z.object({ projectId: z.string().uuid() });

export async function refreshValidationAction(formData: FormData): Promise<void> {
  const { userId } = await gate("go-live.edit");
  const parsed = refreshSchema.parse({ projectId: formData.get("projectId") });
  await refreshAutoValidation(userId, parsed.projectId);
  revalidatePath("/dashboard/go-live");
  revalidatePath(`/dashboard/go-live/projects/${parsed.projectId}`);
}

const checklistSchema = z.object({
  projectId: z.string().uuid(),
  itemId: z.string().uuid(),
  status: z.enum(CHECKLIST_STATUSES).optional(),
  assignedToId: z.string().uuid().nullable().optional(),
  dueAt: z.string().nullable().optional(),
  blockerSeverity: z.enum(BLOCKER_SEVERITIES).nullable().optional(),
});

export async function updateChecklistItemAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("go-live.checklist.update");
  const parsed = checklistSchema.parse({
    projectId: formData.get("projectId"),
    itemId: formData.get("itemId"),
    status: (formData.get("status") as string) || undefined,
    assignedToId: (formData.get("assignedToId") as string) || null,
    dueAt: (formData.get("dueAt") as string) || null,
    blockerSeverity: (formData.get("blockerSeverity") as string) || null,
  });
  const res = await updateChecklistItem({
    userId,
    performedById: profileId,
    projectId: parsed.projectId,
    itemId: parsed.itemId,
    status: parsed.status as GoLiveChecklistStatus | undefined,
    assignedToId: parsed.assignedToId ?? null,
    dueAt: parsed.dueAt ? new Date(parsed.dueAt) : null,
    blockerSeverity: (parsed.blockerSeverity as GoLiveBlockerSeverity | null) ?? null,
  });
  if (!res.ok) throw new Error(res.error ?? "Could not update checklist item.");
  await refreshAutoValidation(userId, parsed.projectId);
  revalidatePath(`/dashboard/go-live/projects/${parsed.projectId}`);
}

const simSchema = z.object({
  projectId: z.string().uuid(),
  simulationType: z.enum(SIMULATION_TYPES),
});

export async function runSimulationAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("go-live.simulate");
  const parsed = simSchema.parse({
    projectId: formData.get("projectId"),
    simulationType: formData.get("simulationType"),
  });
  const res = await runSimulationForProject({
    userId,
    performedById: profileId,
    projectId: parsed.projectId,
    simulationType: parsed.simulationType as GoLiveSimulationType,
  });
  if (!res.ok) throw new Error(res.error);
  revalidatePath(`/dashboard/go-live/projects/${parsed.projectId}`);
}

const approvalSchema = z.object({
  projectId: z.string().uuid(),
  approvalType: z.enum(APPROVAL_TYPES),
  notes: z.string().max(800).nullable().optional(),
  confirm: z.literal(true),
});

export async function recordApprovalAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("go-live.approve");
  const parsed = approvalSchema.parse({
    projectId: formData.get("projectId"),
    approvalType: formData.get("approvalType"),
    notes: (formData.get("notes") as string) || null,
    confirm: formData.get("confirm") === "true",
  });
  const res = await recordApproval({
    userId,
    performedById: profileId,
    projectId: parsed.projectId,
    approvalType: parsed.approvalType as GoLiveApprovalType,
    notes: parsed.notes ?? null,
  });
  if (!res.ok) throw new Error(res.error);
  revalidatePath(`/dashboard/go-live/projects/${parsed.projectId}`);
}

const incidentCreateSchema = z.object({
  projectId: z.string().uuid(),
  severity: z.enum(INCIDENT_SEVERITIES),
  category: z.enum(INCIDENT_CATEGORIES),
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(4000),
});

export async function createIncidentAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("go-live.incident.create");
  const parsed = incidentCreateSchema.parse({
    projectId: formData.get("projectId"),
    severity: formData.get("severity"),
    category: formData.get("category"),
    title: formData.get("title"),
    description: formData.get("description"),
  });
  const res = await createIncident({
    userId,
    performedById: profileId,
    projectId: parsed.projectId,
    severity: parsed.severity as GoLiveIncidentSeverity,
    category: parsed.category as GoLiveIncidentCategory,
    title: parsed.title,
    description: parsed.description,
  });
  if (!res.ok) throw new Error(res.error);
  revalidatePath(`/dashboard/go-live/projects/${parsed.projectId}`);
}

const incidentUpdateSchema = z.object({
  projectId: z.string().uuid(),
  incidentId: z.string().uuid(),
  status: z.enum(INCIDENT_STATUSES).optional(),
  resolution: z.string().max(4000).nullable().optional(),
  assignedToId: z.string().uuid().nullable().optional(),
});

export async function updateIncidentAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("go-live.incident.resolve");
  const parsed = incidentUpdateSchema.parse({
    projectId: formData.get("projectId"),
    incidentId: formData.get("incidentId"),
    status: (formData.get("status") as string) || undefined,
    resolution: (formData.get("resolution") as string) || null,
    assignedToId: (formData.get("assignedToId") as string) || null,
  });
  const res = await updateIncident({
    userId,
    performedById: profileId,
    projectId: parsed.projectId,
    incidentId: parsed.incidentId,
    status: parsed.status as GoLiveIncidentStatus | undefined,
    resolution: parsed.resolution ?? null,
    assignedToId: parsed.assignedToId ?? null,
  });
  if (!res.ok) throw new Error(res.error);
  revalidatePath(`/dashboard/go-live/projects/${parsed.projectId}`);
}

const rollbackSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(255),
  triggerCondition: z.string().min(1).max(2000),
  steps: z.string().min(1),
  ownerId: z.string().uuid().nullable().optional(),
});

export async function createRollbackPlanAction(formData: FormData): Promise<void> {
  const { userId, profileId } = await gate("go-live.rollback");
  const parsed = rollbackSchema.parse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    triggerCondition: formData.get("triggerCondition"),
    steps: formData.get("steps"),
    ownerId: (formData.get("ownerId") as string) || null,
  });
  const lines = parsed.steps
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const steps = lines.map((line, idx) => ({
    order: idx + 1,
    title: line.length > 80 ? line.slice(0, 80) : line,
    description: line,
    module: "general",
  }));
  const res = await createRollbackPlan({
    userId,
    performedById: profileId,
    projectId: parsed.projectId,
    title: parsed.title,
    triggerCondition: parsed.triggerCondition,
    steps,
    ownerId: parsed.ownerId ?? null,
  });
  if (!res.ok) throw new Error(res.error);
  revalidatePath(`/dashboard/go-live/projects/${parsed.projectId}`);
}

const statusSchema = z.object({
  projectId: z.string().uuid(),
  target: z.enum(LAUNCH_STATUSES),
  override: z.boolean().optional(),
  confirm: z.literal(true),
});

export async function transitionLaunchStatusAction(formData: FormData): Promise<void> {
  const target = String(formData.get("target") ?? "");
  const requiresSuperGate = target === "APPROVED" || target === "LIVE" || target === "ROLLBACK_MODE";
  const capability: GoLiveCapability = target === "ROLLBACK_MODE" ? "go-live.rollback" : target === "LIVE" ? "go-live.launch" : "go-live.approve";
  const { userId, profileId } = await gate(capability);
  const parsed = statusSchema.parse({
    projectId: formData.get("projectId"),
    target,
    override: formData.get("override") === "true",
    confirm: formData.get("confirm") === "true",
  });
  if (requiresSuperGate && parsed.override) {
    await gate("go-live.unlock");
  }
  const res = await transitionStatus({
    userId,
    performedById: profileId,
    projectId: parsed.projectId,
    target: parsed.target as GoLiveLaunchStatus,
    override: parsed.override,
  });
  if (!res.ok) throw new Error(res.error ?? "Could not change launch status.");
  revalidatePath(`/dashboard/go-live/projects/${parsed.projectId}`);
  revalidatePath("/dashboard/go-live");
}
