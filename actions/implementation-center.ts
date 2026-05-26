"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type {
  ImplementationChecklistStatus,
  ImplementationPhaseStatus,
  ImplementationStatus,
} from "@prisma/client";

import { createImplementationActorScope } from "@/lib/implementation/implementation-actor-scope";
import { canMarkReady } from "@/lib/implementation/go-live-readiness";
import { canUseImplementation } from "@/lib/implementation/implementation-permissions";
import type { ImplementationActorScope } from "@/lib/implementation/implementation-types";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { safeError } from "@/lib/security";
import {
  addRisk,
  assignChecklistItem,
  createImplementationProjectV2,
  generateTasksFromChecklist,
  parseBusinessType,
  previewTasksFromChecklist,
  resolveRisk,
  updateChecklistItemStatus,
  updatePhaseStatus,
  updateProjectStatus,
} from "@/services/implementation/implementation-service";
import { runReadinessChecks } from "@/services/implementation/readiness-service";

function ownerScope(
  actor: Awaited<ReturnType<typeof requireWorkspacePermissionActor>>,
): ImplementationActorScope & {
  userId: string;
  sessionUserId: string;
  workspaceId?: string | null;
  email: string | null;
} {
  return createImplementationActorScope(actor);
}

function revalidateAll(projectId?: string | null) {
  revalidatePath("/dashboard/implementation");
  if (projectId) revalidatePath(`/dashboard/implementation/${projectId}`);
  revalidatePath("/dashboard/go-live");
  revalidatePath("/dashboard/today");
}

const optionalString = z
  .string()
  .trim()
  .max(1024)
  .transform((v) => (v.length === 0 ? null : v))
  .nullable()
  .optional();

const createSchema = z.object({
  businessName: z.string().trim().min(1).max(255),
  businessType: optionalString,
  currentPlatform: optionalString,
  weeklyOrderVolume: z
    .string()
    .trim()
    .max(10)
    .transform((v) => (v.length === 0 ? null : Number(v)))
    .pipe(z.number().int().nonnegative().nullable())
    .optional()
    .nullable(),
  targetGoLiveDate: optionalString,
  assignedOwner: optionalString,
  notes: optionalString,
  systems: z.array(z.string()).optional(),
  fulfillment: z.array(z.string()).optional(),
  migrationScope: z.array(z.string()).optional(),
  moduleScope: z.array(z.string()).optional(),
  integrations: z.array(z.string()).optional(),
  trainingRoles: z.array(z.string()).optional(),
});

export async function createImplementationProjectAction(input: unknown) {
  try {
    const actor = await requireWorkspacePermissionActor();
    const scope = ownerScope(actor);
    if (!canUseImplementation(scope, "implementation.create")) {
      return { error: "Not authorized" };
    }

    const data = createSchema.parse(input);

    const project = await createImplementationProjectV2({
      userId: scope.userId,
      createdById: scope.sessionUserId,
      performedBy: scope.email,
      businessName: data.businessName,
      businessType: parseBusinessType(data.businessType ?? null),
      currentPlatform: data.currentPlatform ?? null,
      weeklyOrderVolume: data.weeklyOrderVolume ?? null,
      targetGoLiveDate:
        data.targetGoLiveDate && data.targetGoLiveDate.length > 0
          ? new Date(data.targetGoLiveDate)
          : null,
      assignedOwner: data.assignedOwner ?? null,
      notes: data.notes ?? null,
      systems: data.systems ?? [],
      fulfillment: data.fulfillment ?? [],
      migrationScope: data.migrationScope ?? [],
      moduleScope: data.moduleScope ?? [],
      integrations: data.integrations ?? [],
      trainingRoles: data.trainingRoles ?? [],
    });

    revalidateAll(project.id);
    return { ok: true as const, projectId: project.id };
  } catch (error) {
    return { error: safeError(error) };
  }
}

const statusSchema = z.object({
  projectId: z.string().uuid(),
  status: z.enum([
    "DISCOVERY",
    "SETUP",
    "MIGRATION",
    "TRAINING",
    "TESTING",
    "READY_FOR_GO_LIVE",
    "LIVE",
    "POST_LAUNCH",
    "BLOCKED",
    "CANCELLED",
  ]),
  reason: optionalString,
});

export async function updateImplementationStatusAction(input: unknown) {
  try {
    const actor = await requireWorkspacePermissionActor();
    const scope = ownerScope(actor);
    if (!canUseImplementation(scope, "implementation.edit")) {
      return { error: "Not authorized" };
    }
    const data = statusSchema.parse(input);
    const project = await updateProjectStatus({
      userId: scope.userId,
      projectId: data.projectId,
      status: data.status as ImplementationStatus,
      performedBy: scope.email,
      reason: data.reason ?? null,
    });
    revalidateAll(project.id);
    return { ok: true as const };
  } catch (error) {
    return { error: safeError(error) };
  }
}

const checklistStatusSchema = z.object({
  projectId: z.string().uuid(),
  itemId: z.string().uuid(),
  status: z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "DONE", "SKIPPED"]),
  blockerReason: optionalString,
});

export async function updateChecklistItemAction(input: unknown) {
  try {
    const actor = await requireWorkspacePermissionActor();
    const scope = ownerScope(actor);
    if (!canUseImplementation(scope, "implementation.complete_checklist")) {
      return { error: "Not authorized" };
    }
    const data = checklistStatusSchema.parse(input);
    await updateChecklistItemStatus({
      userId: scope.userId,
      projectId: data.projectId,
      itemId: data.itemId,
      status: data.status as ImplementationChecklistStatus,
      blockerReason: data.blockerReason ?? null,
      performedBy: scope.email,
    });
    revalidateAll(data.projectId);
    return { ok: true as const };
  } catch (error) {
    return { error: safeError(error) };
  }
}

const assignSchema = z.object({
  projectId: z.string().uuid(),
  itemId: z.string().uuid(),
  assignedToId: z.string().uuid().nullable().optional(),
  dueAt: optionalString,
});

export async function assignChecklistItemAction(input: unknown) {
  try {
    const actor = await requireWorkspacePermissionActor();
    const scope = ownerScope(actor);
    if (!canUseImplementation(scope, "implementation.assign")) {
      return { error: "Not authorized" };
    }
    const data = assignSchema.parse(input);
    await assignChecklistItem({
      userId: scope.userId,
      projectId: data.projectId,
      itemId: data.itemId,
      assignedToId: data.assignedToId ?? null,
      dueAt: data.dueAt ? new Date(data.dueAt) : null,
      performedBy: scope.email,
    });
    revalidateAll(data.projectId);
    return { ok: true as const };
  } catch (error) {
    return { error: safeError(error) };
  }
}

const phaseStatusSchema = z.object({
  projectId: z.string().uuid(),
  phaseId: z.string().uuid(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "BLOCKED", "COMPLETED", "SKIPPED"]),
});

export async function updatePhaseStatusAction(input: unknown) {
  try {
    const actor = await requireWorkspacePermissionActor();
    const scope = ownerScope(actor);
    if (!canUseImplementation(scope, "implementation.edit")) {
      return { error: "Not authorized" };
    }
    const data = phaseStatusSchema.parse(input);
    await updatePhaseStatus({
      userId: scope.userId,
      projectId: data.projectId,
      phaseId: data.phaseId,
      status: data.status as ImplementationPhaseStatus,
      performedBy: scope.email,
    });
    revalidateAll(data.projectId);
    return { ok: true as const };
  } catch (error) {
    return { error: safeError(error) };
  }
}

const riskAddSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().trim().min(1).max(255),
  mitigation: optionalString,
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export async function addImplementationRiskAction(input: unknown) {
  try {
    const actor = await requireWorkspacePermissionActor();
    const scope = ownerScope(actor);
    if (!canUseImplementation(scope, "implementation.edit")) {
      return { error: "Not authorized" };
    }
    const data = riskAddSchema.parse(input);
    await addRisk({
      userId: scope.userId,
      projectId: data.projectId,
      title: data.title,
      mitigation: data.mitigation ?? null,
      severity: data.severity ?? "medium",
      performedBy: scope.email,
    });
    revalidateAll(data.projectId);
    return { ok: true as const };
  } catch (error) {
    return { error: safeError(error) };
  }
}

const riskResolveSchema = z.object({
  projectId: z.string().uuid(),
  riskId: z.string().uuid(),
});

export async function resolveImplementationRiskAction(input: unknown) {
  try {
    const actor = await requireWorkspacePermissionActor();
    const scope = ownerScope(actor);
    if (!canUseImplementation(scope, "implementation.edit")) {
      return { error: "Not authorized" };
    }
    const data = riskResolveSchema.parse(input);
    await resolveRisk({
      userId: scope.userId,
      projectId: data.projectId,
      riskId: data.riskId,
      performedBy: scope.email,
    });
    revalidateAll(data.projectId);
    return { ok: true as const };
  } catch (error) {
    return { error: safeError(error) };
  }
}

const readinessSchema = z.object({
  projectId: z.string().uuid(),
});

export async function runReadinessAction(input: unknown) {
  try {
    const actor = await requireWorkspacePermissionActor();
    const scope = ownerScope(actor);
    if (!canUseImplementation(scope, "implementation.run_readiness")) {
      return { error: "Not authorized" };
    }
    const data = readinessSchema.parse(input);
    const snapshot = await runReadinessChecks({
      userId: scope.userId,
      projectId: data.projectId,
      performedBy: scope.email,
    });
    revalidateAll(data.projectId);
    return { ok: true as const, snapshot };
  } catch (error) {
    return { error: safeError(error) };
  }
}

const previewTasksSchema = z.object({ projectId: z.string().uuid() });

export async function previewImplementationTasksAction(input: unknown) {
  try {
    const actor = await requireWorkspacePermissionActor();
    const scope = ownerScope(actor);
    if (!canUseImplementation(scope, "implementation.generate_tasks")) {
      return { error: "Not authorized" };
    }
    const data = previewTasksSchema.parse(input);
    const preview = await previewTasksFromChecklist({ userId: scope.userId, projectId: data.projectId });
    return { ok: true as const, preview };
  } catch (error) {
    return { error: safeError(error) };
  }
}

const generateTasksSchema = z.object({
  projectId: z.string().uuid(),
  itemIds: z.array(z.string().uuid()).min(1).max(200),
});

export async function generateImplementationTasksAction(input: unknown) {
  try {
    const actor = await requireWorkspacePermissionActor();
    const scope = ownerScope(actor);
    if (!canUseImplementation(scope, "implementation.generate_tasks")) {
      return { error: "Not authorized" };
    }
    const data = generateTasksSchema.parse(input);
    const result = await generateTasksFromChecklist({
      userId: scope.userId,
      projectId: data.projectId,
      itemIds: data.itemIds,
      performedBy: scope.email,
    });
    revalidateAll(data.projectId);
    return { ok: true as const, ...result };
  } catch (error) {
    return { error: safeError(error) };
  }
}

const goLiveSchema = z.object({ projectId: z.string().uuid() });

export async function markGoLiveAction(input: unknown) {
  try {
    const actor = await requireWorkspacePermissionActor();
    const scope = ownerScope(actor);
    if (!canUseImplementation(scope, "implementation.go_live")) {
      return { error: "Not authorized" };
    }
    const data = goLiveSchema.parse(input);

    const snapshot = await runReadinessChecks({
      userId: scope.userId,
      projectId: data.projectId,
      performedBy: scope.email,
    });

    if (!canMarkReady(snapshot)) {
      const outstanding = snapshot.checks
        .filter((check) => check.status !== "PASS")
        .map((check) => check.title)
        .slice(0, 4);
      return {
        error:
          snapshot.band === "blocked"
            ? `Required checks failing: ${snapshot.blockers.join("; ")}`
            : `Readiness is still ${snapshot.band}. Resolve outstanding checks before marking LIVE: ${outstanding.join("; ")}`,
      };
    }

    const project = await updateProjectStatus({
      userId: scope.userId,
      projectId: data.projectId,
      status: "LIVE",
      performedBy: scope.email,
      reason: "Manual mark live",
    });
    revalidateAll(project.id);
    return { ok: true as const };
  } catch (error) {
    return { error: safeError(error) };
  }
}
