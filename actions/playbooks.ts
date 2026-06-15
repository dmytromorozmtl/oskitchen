"use server";


import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import type { PlaybookRunStepStatus, PlaybookTriggerType, PlaybookType } from "@prisma/client";

import { requireUserProfile } from "@/lib/auth";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import {
  createPlaybookActorScope,
  type PlaybookTenantScope,
} from "@/lib/playbooks/playbook-actor-scope";
import { workspacePermissionForPlaybookCapability } from "@/lib/playbooks/playbook-permission-keys";
import { canUsePlaybooks } from "@/lib/playbooks/playbook-permissions";
import type { PlaybookCapability } from "@/lib/playbooks/playbook-types";
import { prisma } from "@/lib/prisma";
import { logPlaybookPermissionDenied } from "@/services/playbooks/playbook-permission-audit";
import {
  cancelRun,
  completeRun,
  createPlaybookFromSeed,
  ensureSystemPlaybooks,
  recordPlaybookEvent,
  startPlaybookRun,
  transitionRunStep,
  archivePlaybook,
} from "@/services/playbooks/playbook-service";
import { generateTasksForRun } from "@/services/playbooks/playbook-task-generator";

const PATH = "/dashboard/playbooks";

async function authorize(
  capability: PlaybookCapability,
): Promise<{ ok: true; scope: PlaybookTenantScope } | { ok: false; error: string }> {
  const required = workspacePermissionForPlaybookCapability(capability);
  const access = await requireMutationPermission(required);
  let profile: { role: string | null } | null = null;
  try {
    profile = await requireUserProfile();
  } catch {
    profile = null;
  }
  if (!access.ok) {
    await logPlaybookPermissionDenied(access.actor, {
      requiredPermission: required,
      operation: capability,
      playbookCapability: capability,
    });
    return { ok: false, error: access.error ?? "Forbidden" };
  }
  const scope = createPlaybookActorScope(access.actor, profile?.role ?? null);
  if (!canUsePlaybooks(scope, capability)) {
    await logPlaybookPermissionDenied(access.actor, {
      requiredPermission: required,
      operation: capability,
      playbookCapability: capability,
    });
    return { ok: false, error: "Forbidden" };
  }
  return { ok: true, scope };
}

export async function ensureSystemPlaybooksAction(): Promise<{ ok: boolean; error?: string }> {
  try {
    const auth = await authorize("playbooks.view");
    if (!auth.ok) return { ok: false, error: auth.error };
    await ensureSystemPlaybooks(auth.scope);
    revalidatePath(PATH);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unable to seed" };
  }
}

const startSchema = z.object({
  playbookId: z.string().uuid(),
  brandId: z.string().uuid().nullish(),
  locationId: z.string().uuid().nullish(),
  dueAt: z.string().datetime().nullish(),
  title: z.string().max(255).nullish(),
  generateTasks: z.boolean().optional().default(false),
});

export async function startRunAction(
  input: z.infer<typeof startSchema>,
): Promise<{ ok: boolean; runId?: string; error?: string }> {
  try {
    const auth = await authorize("playbooks.run");
    if (!auth.ok) return { ok: false, error: auth.error };
    const { scope } = auth;
    const parsed = startSchema.parse(input);
    const owned = await prisma.playbook.findFirst({
      where: { id: parsed.playbookId, userId: scope.userId },
      select: { id: true },
    });
    if (!owned) return { ok: false, error: "Playbook not found" };
    const settings = await prisma.kitchenSettings.findUnique({
      where: { userId: scope.userId },
      select: { businessType: true },
    });
    const run = await startPlaybookRun(scope, {
      playbookId: parsed.playbookId,
      brandId: parsed.brandId ?? null,
      locationId: parsed.locationId ?? null,
      dueAt: parsed.dueAt ? new Date(parsed.dueAt) : null,
      title: parsed.title ?? null,
      businessMode: settings?.businessType ?? null,
      generateTasks: parsed.generateTasks,
    });
    revalidatePath(PATH);
    revalidatePath(`${PATH}/runs/${run.id}`);
    return { ok: true, runId: run.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unable to start" };
  }
}

const transitionSchema = z.object({
  runStepId: z.string().uuid(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "BLOCKED", "COMPLETED", "SKIPPED"]),
  blockedReason: z.string().max(2000).nullish(),
  notes: z.string().max(2000).nullish(),
  runId: z.string().uuid(),
});

export async function transitionStepAction(
  input: z.infer<typeof transitionSchema>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const auth = await authorize("playbooks.complete_step");
    if (!auth.ok) return { ok: false, error: auth.error };
    const parsed = transitionSchema.parse(input);
    await transitionRunStep(auth.scope, parsed.runStepId, parsed.status as PlaybookRunStepStatus, {
      blockedReason: parsed.blockedReason ?? null,
      notes: parsed.notes ?? null,
    });
    revalidatePath(`${PATH}/runs/${parsed.runId}`);
    revalidatePath(PATH);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unable to update step" };
  }
}

export async function generateTasksAction(
  input: { runId: string },
): Promise<{ ok: boolean; created?: number; error?: string }> {
  try {
    const auth = await authorize("playbooks.generate_tasks");
    if (!auth.ok) return { ok: false, error: auth.error };
    const runId = z.string().uuid().parse(input.runId);
    const result = await generateTasksForRun(auth.scope, runId);
    revalidatePath(`${PATH}/runs/${runId}`);
    revalidatePath(PATH);
    return { ok: true, created: result.created };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unable to generate tasks" };
  }
}

export async function completeRunAction(
  input: { runId: string },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const auth = await authorize("playbooks.run");
    if (!auth.ok) return { ok: false, error: auth.error };
    const runId = z.string().uuid().parse(input.runId);
    await completeRun(auth.scope, runId);
    revalidatePath(`${PATH}/runs/${runId}`);
    revalidatePath(PATH);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unable to complete" };
  }
}

export async function cancelRunAction(
  input: { runId: string; reason?: string },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const auth = await authorize("playbooks.run");
    if (!auth.ok) return { ok: false, error: auth.error };
    const runId = z.string().uuid().parse(input.runId);
    await cancelRun(auth.scope, runId, input.reason);
    revalidatePath(`${PATH}/runs/${runId}`);
    revalidatePath(PATH);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unable to cancel" };
  }
}

const stepBuilderSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  recommendedRole: z.string().max(64).optional(),
  moduleKey: z.string().max(80).optional(),
  actionRoute: z.string().max(512).optional(),
  estimatedMinutes: z.coerce.number().int().nonnegative().max(1440).optional(),
  required: z.boolean().optional().default(true),
});

const customSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(2000),
  type: z.enum([
    "DAILY_OPERATIONS",
    "WEEKLY_CYCLE",
    "EVENT_WORKFLOW",
    "PREORDER_WORKFLOW",
    "SERVICE_SHIFT",
    "PRODUCTION_DAY",
    "PACKING_DAY",
    "DELIVERY_DAY",
    "OPENING_CHECKLIST",
    "CLOSING_CHECKLIST",
    "INCIDENT_RESPONSE",
    "ONBOARDING",
    "GO_LIVE",
  ] as const),
  businessModes: z.array(z.string()).max(20).optional().default([]),
  recommendedModules: z.array(z.string()).max(30).optional().default([]),
  defaultRoles: z.array(z.string()).max(20).optional().default([]),
  triggerType: z.enum([
    "MANUAL",
    "DAILY",
    "WEEKLY",
    "EVENT_DATE",
    "MENU_CUTOFF",
    "PRODUCTION_DATE",
    "ORDER_VOLUME",
    "INCIDENT",
  ] as const),
  recurrenceRule: z.string().max(255).optional().nullable(),
  steps: z.array(stepBuilderSchema).min(1).max(50),
});

export async function createCustomPlaybookAction(
  input: z.infer<typeof customSchema>,
): Promise<{ ok: boolean; playbookId?: string; error?: string }> {
  try {
    const auth = await authorize("playbooks.create_custom");
    if (!auth.ok) return { ok: false, error: auth.error };
    const parsed = customSchema.parse(input);
    const slug = slugify(parsed.title) || `custom-${Date.now()}`;
    const created = await createPlaybookFromSeed(
      auth.scope,
      {
        slug,
        title: parsed.title,
        description: parsed.description,
        type: parsed.type as PlaybookType,
        businessModes: parsed.businessModes as never,
        recommendedModules: parsed.recommendedModules as never,
        defaultRoles: parsed.defaultRoles,
        triggerType: parsed.triggerType as PlaybookTriggerType,
        recurrenceRule: parsed.recurrenceRule ?? undefined,
        steps: parsed.steps.map((s) => ({
          title: s.title,
          description: s.description,
          recommendedRole: s.recommendedRole,
          moduleKey: s.moduleKey as never,
          actionRoute: s.actionRoute,
          estimatedMinutes: s.estimatedMinutes,
          required: s.required ?? true,
        })),
      },
      { systemTemplate: false },
    );
    revalidatePath(PATH);
    return { ok: true, playbookId: created.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unable to create" };
  }
}

export async function archivePlaybookAction(
  input: { playbookId: string },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const auth = await authorize("playbooks.archive");
    if (!auth.ok) return { ok: false, error: auth.error };
    const playbookId = z.string().uuid().parse(input.playbookId);
    await archivePlaybook(auth.scope, playbookId);
    revalidatePath(PATH);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unable to archive" };
  }
}

const settingsSchema = z.object({
  playbookId: z.string().uuid(),
  active: z.boolean().optional(),
  recurrenceRule: z.string().max(255).nullable().optional(),
});

export async function updatePlaybookSettingsAction(
  input: z.infer<typeof settingsSchema>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const auth = await authorize("playbooks.edit");
    if (!auth.ok) return { ok: false, error: auth.error };
    const parsed = settingsSchema.parse(input);
    await prisma.playbook.updateMany({
      where: { id: parsed.playbookId, userId: auth.scope.userId },
      data: {
        active: parsed.active ?? undefined,
        recurrenceRule: parsed.recurrenceRule ?? undefined,
      },
    });
    await recordPlaybookEvent(auth.scope, "playbook_updated", {
      playbookId: parsed.playbookId,
      changes: parsed as unknown as Prisma.InputJsonValue,
    });
    revalidatePath(PATH);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unable to update" };
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}
