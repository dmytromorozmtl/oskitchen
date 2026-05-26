"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import {
  BUILT_IN_TASK_TEMPLATES,
  instantiateTemplateChecklist,
} from "@/lib/tasks/task-templates";
import {
  KitchenTaskPriority,
  KitchenTaskSource,
  KitchenTaskStatus,
  KitchenTaskType,
} from "@prisma/client";
import {
  addComment,
  assignTask,
  createFollowUpTask,
  createTask,
  rescheduleTask,
  toggleChecklist,
  updatePriority,
  updateTaskStatus,
} from "@/services/tasks/task-service";

function revalidateAll(taskId?: string) {
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/tasks/today");
  revalidatePath("/dashboard/tasks/kanban");
  revalidatePath("/dashboard/tasks/list");
  revalidatePath("/dashboard/tasks/calendar");
  revalidatePath("/dashboard/tasks/my");
  revalidatePath("/dashboard/tasks/templates");
  revalidatePath("/dashboard/tasks/recurring");
  revalidatePath("/dashboard/tasks/reports");
  revalidatePath("/dashboard/calendar");
  revalidatePath("/dashboard/today");
  if (taskId) revalidatePath(`/dashboard/tasks/${taskId}`);
}

/* ============================ legacy preserved ============================ */

const createSchema = z.object({
  title: z.string().min(1).max(512),
  description: z.string().max(4000).optional().or(z.literal("")),
  taskType: z.nativeEnum(KitchenTaskType),
  assignedToId: z.string().uuid().optional().or(z.literal("")),
  dueAt: z.string().optional(),
});

export async function createKitchenTaskAction(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const parsed = createSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      taskType: formData.get("taskType"),
      assignedToId: formData.get("assignedToId"),
      dueAt: formData.get("dueAt"),
    });
    if (!parsed.success) return { error: "Check task fields." };
    const d = parsed.data;
    const aid = d.assignedToId?.trim();
    const assignedToId =
      aid && /^[0-9a-f-]{36}$/i.test(aid)
        ? (
            await prisma.staffMember.findFirst({
              where: { id: aid, userId },
              select: { id: true },
            })
          )?.id ?? null
        : null;

    const dueAt = d.dueAt && d.dueAt.length > 4 ? new Date(d.dueAt) : null;

    await createTask({
      userId,
      title: d.title,
      description: d.description || null,
      taskType: d.taskType,
      priority: KitchenTaskPriority.MEDIUM,
      assignedToId,
      dueAt,
      createdById: user.id,
      performedBy: user.email ?? null,
    });

    revalidateAll();
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateKitchenTaskStatusAction(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const id = String(formData.get("id") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Invalid task." };
    const status = String(formData.get("status") ?? "");
    if (!Object.values(KitchenTaskStatus).includes(status as KitchenTaskStatus)) {
      return { error: "Invalid status." };
    }
    await updateTaskStatus({ userId }, {
      taskId: id,
      to: status as KitchenTaskStatus,
      performedBy: user.email ?? null,
      performedByUserId: user.id,
    });
    revalidateAll(id);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createKitchenTaskFormAction(formData: FormData): Promise<void> {
  void (await createKitchenTaskAction(formData));
}

export async function updateKitchenTaskStatusFormAction(formData: FormData): Promise<void> {
  void (await updateKitchenTaskStatusAction(formData));
}

/* ============================ new actions ============================ */

const fullCreateSchema = z.object({
  title: z.string().min(1).max(512),
  description: z.string().max(4000).optional().or(z.literal("")),
  taskType: z.nativeEnum(KitchenTaskType),
  priority: z.nativeEnum(KitchenTaskPriority).optional(),
  status: z.nativeEnum(KitchenTaskStatus).optional(),
  assignedToId: z.string().uuid().optional().or(z.literal("")),
  assignedRole: z.string().max(64).optional().or(z.literal("")),
  brandId: z.string().uuid().optional().or(z.literal("")),
  locationId: z.string().uuid().optional().or(z.literal("")),
  dueAt: z.string().optional(),
  estimatedMinutes: z.string().optional().or(z.literal("")),
  recurrenceRule: z.string().max(255).optional().or(z.literal("")),
  tags: z.string().max(2000).optional().or(z.literal("")),
  templateSlug: z.string().max(120).optional().or(z.literal("")),
});

export async function createFullTaskAction(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const parsed = fullCreateSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      taskType: formData.get("taskType"),
      priority: formData.get("priority") || undefined,
      status: formData.get("status") || undefined,
      assignedToId: formData.get("assignedToId"),
      assignedRole: formData.get("assignedRole"),
      brandId: formData.get("brandId"),
      locationId: formData.get("locationId"),
      dueAt: formData.get("dueAt"),
      estimatedMinutes: formData.get("estimatedMinutes"),
      recurrenceRule: formData.get("recurrenceRule"),
      tags: formData.get("tags"),
      templateSlug: formData.get("templateSlug"),
    });
    if (!parsed.success) return { error: "Check task fields." };
    const d = parsed.data;

    const assignedToId =
      d.assignedToId && /^[0-9a-f-]{36}$/i.test(d.assignedToId)
        ? (
            await prisma.staffMember.findFirst({
              where: { id: d.assignedToId, userId },
              select: { id: true },
            })
          )?.id ?? null
        : null;

    const tags =
      d.tags && d.tags.trim()
        ? d.tags
            .split(/[,\n]+/)
            .map((t) => t.trim())
            .filter(Boolean)
        : null;

    const template = d.templateSlug
      ? BUILT_IN_TASK_TEMPLATES.find((t) => t.slug === d.templateSlug) ?? null
      : null;

    const taskId = await createTask({
      userId,
      title: d.title,
      description: d.description || template?.description || null,
      taskType: d.taskType,
      priority: d.priority ?? template?.priority ?? KitchenTaskPriority.MEDIUM,
      status: d.status,
      assignedToId,
      assignedRole: d.assignedRole || template?.assignedRole || null,
      brandId: d.brandId || null,
      locationId: d.locationId || null,
      dueAt: d.dueAt && d.dueAt.length > 4 ? new Date(d.dueAt) : null,
      estimatedMinutes:
        d.estimatedMinutes && Number(d.estimatedMinutes) > 0
          ? Number(d.estimatedMinutes)
          : template?.estimatedMinutes ?? null,
      tags,
      recurrenceRule: d.recurrenceRule || template?.recurrenceRule || null,
      checklist: template ? instantiateTemplateChecklist(template) : null,
      createdById: user.id,
      sourceType: KitchenTaskSource.MANUAL,
      sourceLabel: template ? `Template: ${template.title}` : null,
      performedBy: user.email ?? null,
    });

    revalidateAll();
    return { ok: true as const, taskId };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createFullTaskFormAction(formData: FormData): Promise<void> {
  const result = await createFullTaskAction(formData);
  if ("ok" in result && result.ok) redirect(`/dashboard/tasks/${result.taskId}`);
}

const assignSchema = z.object({
  taskId: z.string().uuid(),
  assignedToId: z.string().uuid().optional().or(z.literal("")),
  assignedRole: z.string().max(64).optional().or(z.literal("")),
});

export async function assignTaskAction(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const parsed = assignSchema.safeParse({
      taskId: formData.get("taskId"),
      assignedToId: formData.get("assignedToId"),
      assignedRole: formData.get("assignedRole"),
    });
    if (!parsed.success) return { error: "Invalid assignment." };
    await assignTask(
      { userId },
      parsed.data.taskId,
      parsed.data.assignedToId || null,
      parsed.data.assignedRole || null,
      user.email ?? null,
    );
    revalidateAll(parsed.data.taskId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function assignTaskFormAction(formData: FormData): Promise<void> {
  void (await assignTaskAction(formData));
}

const priSchema = z.object({
  taskId: z.string().uuid(),
  priority: z.nativeEnum(KitchenTaskPriority),
});

export async function updateTaskPriorityAction(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const parsed = priSchema.safeParse({
      taskId: formData.get("taskId"),
      priority: formData.get("priority"),
    });
    if (!parsed.success) return { error: "Invalid priority." };
    await updatePriority({ userId }, parsed.data.taskId, parsed.data.priority, user.email ?? null);
    revalidateAll(parsed.data.taskId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateTaskPriorityFormAction(formData: FormData): Promise<void> {
  void (await updateTaskPriorityAction(formData));
}

const rescheduleSchema = z.object({
  taskId: z.string().uuid(),
  dueAt: z.string().optional().or(z.literal("")),
});

export async function rescheduleTaskAction(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const parsed = rescheduleSchema.safeParse({
      taskId: formData.get("taskId"),
      dueAt: formData.get("dueAt"),
    });
    if (!parsed.success) return { error: "Invalid due date." };
    const due = parsed.data.dueAt && parsed.data.dueAt.length > 4 ? new Date(parsed.data.dueAt) : null;
    await rescheduleTask({ userId }, parsed.data.taskId, due, user.email ?? null);
    revalidateAll(parsed.data.taskId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function rescheduleTaskFormAction(formData: FormData): Promise<void> {
  void (await rescheduleTaskAction(formData));
}

const commentSchema = z.object({
  taskId: z.string().uuid(),
  content: z.string().min(1).max(4000),
});

export async function addTaskCommentAction(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const parsed = commentSchema.safeParse({
      taskId: formData.get("taskId"),
      content: formData.get("content"),
    });
    if (!parsed.success) return { error: "Comment is empty or too long." };
    await addComment({ userId }, parsed.data.taskId, user.id, user.email ?? null, parsed.data.content);
    revalidateAll(parsed.data.taskId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function addTaskCommentFormAction(formData: FormData): Promise<void> {
  void (await addTaskCommentAction(formData));
}

const checklistSchema = z.object({
  taskId: z.string().uuid(),
  itemId: z.string().min(1).max(64),
  completed: z.enum(["true", "false"]).transform((v) => v === "true"),
});

export async function toggleChecklistAction(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const parsed = checklistSchema.safeParse({
      taskId: formData.get("taskId"),
      itemId: formData.get("itemId"),
      completed: formData.get("completed"),
    });
    if (!parsed.success) return { error: "Invalid checklist toggle." };
    await toggleChecklist(
      { userId },
      parsed.data.taskId,
      parsed.data.itemId,
      parsed.data.completed,
      user.email ?? null,
    );
    revalidateAll(parsed.data.taskId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function toggleChecklistFormAction(formData: FormData): Promise<void> {
  void (await toggleChecklistAction(formData));
}

const applyTemplateSchema = z.object({
  templateSlug: z.string().min(1).max(120),
  dueAt: z.string().optional().or(z.literal("")),
});

export async function applyBuiltInTemplateAction(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const parsed = applyTemplateSchema.safeParse({
      templateSlug: formData.get("templateSlug"),
      dueAt: formData.get("dueAt"),
    });
    if (!parsed.success) return { error: "Pick a template." };
    const template = BUILT_IN_TASK_TEMPLATES.find((t) => t.slug === parsed.data.templateSlug);
    if (!template) return { error: "Unknown template." };

    const taskId = await createTask({
      userId,
      title: template.title,
      description: template.description,
      taskType: template.type,
      priority: template.priority,
      assignedRole: template.assignedRole ?? null,
      dueAt: parsed.data.dueAt && parsed.data.dueAt.length > 4 ? new Date(parsed.data.dueAt) : null,
      estimatedMinutes: template.estimatedMinutes ?? null,
      recurrenceRule: template.recurrenceRule ?? null,
      checklist: instantiateTemplateChecklist(template),
      sourceType: KitchenTaskSource.PLAYBOOK,
      sourceLabel: `Template: ${template.title}`,
      createdById: user.id,
      performedBy: user.email ?? null,
    });
    revalidateAll();
    return { ok: true as const, taskId };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function applyBuiltInTemplateFormAction(formData: FormData): Promise<void> {
  void (await applyBuiltInTemplateAction(formData));
}

/* ============================ integration helpers ============================ */

/**
 * Public helper invoked by other modules (routes, packing, alerts) to create a
 * follow-up task. Re-exported through actions so it can be used inline.
 */
export async function createIntegrationFollowUpTask(args: {
  title: string;
  source: KitchenTaskSource;
  sourceId?: string | null;
  sourceLabel?: string | null;
  priority?: KitchenTaskPriority;
  dueAt?: Date | null;
  description?: string | null;
}) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const taskId = await createFollowUpTask({
      userId,
      title: args.title,
      source: args.source,
      sourceId: args.sourceId ?? null,
      sourceLabel: args.sourceLabel ?? null,
      priority: args.priority,
      dueAt: args.dueAt ?? null,
      description: args.description ?? null,
      performedBy: user.email ?? null,
    });
    revalidateAll();
    return { ok: true as const, taskId };
  } catch (e) {
    return { error: safeError(e) };
  }
}
