import { Prisma } from "@prisma/client";
import type { TemplateApplyMode, TemplateApplicationStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  kitchenModulePreferenceListWhereForOwner,
  kitchenTaskListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import {
  playbookListWhereForOwner,
  templateApplicationByIdWhereForOwner,
  templateApplicationListWhereForOwner,
} from "@/lib/scope/workspace-training-scope";
import { buildTemplatePreview } from "@/lib/templates/template-preview";
import { emptyRollbackPlan, type TemplateRollbackPlan } from "@/lib/templates/template-apply";
import { parseRollbackPlan } from "@/lib/templates/template-rollback";
import {
  WORKSPACE_TEMPLATE_REGISTRY,
  findTemplateByKey,
} from "@/lib/templates/template-registry";
import type {
  TemplateApplyInput,
  TemplateApplyResult,
  TemplatePreview,
  TemplatePreviewChange,
  TemplateSectionKey,
  WorkspaceTemplateSeed,
} from "@/lib/templates/template-types";
import { ensureSystemPlaybooks } from "@/services/playbooks/playbook-service";

type Scope = { userId: string; email: string | null };

/**
 * Upsert every registry entry into the `workspace_templates` table.
 * Idempotent; safe to call on every page load.
 */
export async function ensureWorkspaceTemplates(): Promise<void> {
  await Promise.all(
    WORKSPACE_TEMPLATE_REGISTRY.map((seed) =>
      prisma.workspaceTemplate.upsert({
        where: { key: seed.key },
        create: {
          key: seed.key,
          title: seed.title,
          description: seed.description,
          category: seed.category,
          businessModesJson: seed.businessModes as Prisma.InputJsonValue,
          version: seed.version,
          systemTemplate: true,
          active: true,
          templateJson: seed as unknown as Prisma.InputJsonValue,
        },
        update: {
          title: seed.title,
          description: seed.description,
          category: seed.category,
          businessModesJson: seed.businessModes as Prisma.InputJsonValue,
          version: seed.version,
          templateJson: seed as unknown as Prisma.InputJsonValue,
        },
      }),
    ),
  );
}

export async function listSystemTemplates() {
  await ensureWorkspaceTemplates();
  return prisma.workspaceTemplate.findMany({
    where: { active: true },
    orderBy: { title: "asc" },
  });
}

export async function getTemplate(key: string) {
  await ensureWorkspaceTemplates();
  return prisma.workspaceTemplate.findUnique({ where: { key } });
}

async function loadContext(scope: Scope) {
  const [moduleScope, playbookScope] = await Promise.all([
    kitchenModulePreferenceListWhereForOwner(scope.userId),
    playbookListWhereForOwner(scope.userId),
  ]);
  const [settings, pins, playbooks] = await Promise.all([
    prisma.kitchenSettings.findUnique({
      where: { userId: scope.userId },
      select: { businessType: true },
    }),
    prisma.kitchenModulePreference.findMany({
      where: { AND: [moduleScope, { pinned: true }] },
      select: { moduleKey: true },
    }),
    prisma.playbook.findMany({
      where: { AND: [playbookScope, { systemTemplate: true }] },
      select: { slug: true },
    }),
  ]);
  return {
    currentBusinessMode: settings?.businessType ?? null,
    existingPinnedModuleKeys: pins.map((p) => p.moduleKey),
    existingPlaybookSlugs: playbooks.map((p) => p.slug ?? "").filter(Boolean),
  };
}

export async function previewTemplate(
  scope: Scope,
  templateKey: string,
  sections: TemplateSectionKey[],
): Promise<{ template: WorkspaceTemplateSeed; preview: TemplatePreview }> {
  const template = findTemplateByKey(templateKey);
  if (!template) throw new Error("Template not found");
  const ctx = await loadContext(scope);
  const preview = buildTemplatePreview(template, ctx, sections);
  await prisma.templateApplication.create({
    data: {
      userId: scope.userId,
      templateKey: template.key,
      templateVersion: template.version,
      status: "PREVIEWED",
      applyMode: "PREVIEW_ONLY",
      selectedSectionsJson: sections as unknown as Prisma.InputJsonValue,
      previewJson: preview as unknown as Prisma.InputJsonValue,
    },
  });
  return { template, preview };
}

export async function applyTemplate(
  scope: Scope,
  input: TemplateApplyInput,
): Promise<TemplateApplyResult> {
  const template = findTemplateByKey(input.templateKey);
  if (!template) throw new Error("Template not found");

  const ctx = await loadContext(scope);
  const preview = buildTemplatePreview(template, ctx, input.selectedSections);

  if (preview.counts.conflicts > 0 && !input.acknowledgeConflicts) {
    throw new Error("Acknowledge conflicts before applying");
  }

  const application = await prisma.templateApplication.create({
    data: {
      userId: scope.userId,
      templateKey: template.key,
      templateVersion: template.version,
      status: "APPLYING",
      applyMode: input.applyMode,
      selectedSectionsJson: input.selectedSections as unknown as Prisma.InputJsonValue,
      previewJson: preview as unknown as Prisma.InputJsonValue,
      appliedBy: scope.email ?? "user",
    },
  });

  await recordEvent(scope, application.id, "apply_started", {
    templateKey: template.key,
    selectedSections: input.selectedSections,
  });

  const rollback: TemplateRollbackPlan = emptyRollbackPlan();
  const resultChanges: TemplatePreviewChange[] = [];
  const errors: string[] = [];
  const wants = new Set(input.selectedSections);

  // --- business_mode ---
  if (wants.has("business_mode") && template.primaryBusinessMode) {
    try {
      if (ctx.currentBusinessMode === null) {
        await prisma.kitchenSettings.upsert({
          where: { userId: scope.userId },
          create: { userId: scope.userId, businessType: template.primaryBusinessMode },
          update: { businessType: template.primaryBusinessMode },
        });
        rollback.changedBusinessMode = true;
        rollback.previousBusinessMode = null;
        resultChanges.push({
          section: "business_mode",
          action: "update",
          summary: `Set business mode to ${template.primaryBusinessMode}`,
        });
      } else if (ctx.currentBusinessMode === template.primaryBusinessMode) {
        resultChanges.push({
          section: "business_mode",
          action: "skip",
          summary: "Business mode unchanged",
        });
      } else if (input.overwriteBusinessMode) {
        await prisma.kitchenSettings.update({
          where: { userId: scope.userId },
          data: { businessType: template.primaryBusinessMode },
        });
        rollback.changedBusinessMode = true;
        rollback.previousBusinessMode = ctx.currentBusinessMode;
        resultChanges.push({
          section: "business_mode",
          action: "update",
          summary: `Business mode changed (${ctx.currentBusinessMode} → ${template.primaryBusinessMode})`,
        });
      } else {
        resultChanges.push({
          section: "business_mode",
          action: "skip",
          summary: "Business mode already set; overwrite not granted",
        });
      }
      rollback.appliedSections.push("business_mode");
    } catch (e) {
      errors.push(`business_mode: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  // --- module_pins ---
  if (wants.has("module_pins") && template.sections.modulePins.length > 0) {
    const pins = template.sections.modulePins;
    const existingPrefs = await prisma.kitchenModulePreference.findMany({
      where: {
        userId: scope.userId,
        moduleKey: { in: pins.map((pin) => pin.moduleKey) },
      },
    });
    const prefByKey = new Map(existingPrefs.map((pref) => [pref.moduleKey, pref]));

    await Promise.all(
      pins.map(async (pin) => {
        try {
          const existing = prefByKey.get(pin.moduleKey);
          if (existing?.pinned) {
            return;
          }
          if (existing) {
            await prisma.kitchenModulePreference.update({
              where: { id: existing.id },
              data: { pinned: true },
            });
          } else {
            await prisma.kitchenModulePreference.create({
              data: {
                userId: scope.userId,
                moduleKey: pin.moduleKey,
                enabled: true,
                pinned: true,
              },
            });
          }
          rollback.pinnedModuleKeys.push(pin.moduleKey);
          resultChanges.push({
            section: "module_pins",
            action: "create",
            summary: `Pinned ${pin.moduleKey}`,
          });
        } catch (e) {
          errors.push(`module_pin ${pin.moduleKey}: ${e instanceof Error ? e.message : "failed"}`);
        }
      }),
    );
    rollback.appliedSections.push("module_pins");
  }

  // --- playbooks ---
  if (wants.has("playbooks")) {
    try {
      const playbookScope = await playbookListWhereForOwner(scope.userId);
      const beforeIds = (
        await prisma.playbook.findMany({
          where: { AND: [playbookScope, { systemTemplate: true }] },
          select: { id: true, slug: true },
        })
      ).reduce<Record<string, string>>((acc, p) => {
        if (p.slug) acc[p.slug] = p.id;
        return acc;
      }, {});
      await ensureSystemPlaybooks(scope);
      const afterIds = (
        await prisma.playbook.findMany({
          where: { AND: [playbookScope, { systemTemplate: true }] },
          select: { id: true, slug: true },
        })
      ).reduce<Record<string, string>>((acc, p) => {
        if (p.slug) acc[p.slug] = p.id;
        return acc;
      }, {});
      for (const slug of template.sections.playbookSlugs) {
        if (!beforeIds[slug] && afterIds[slug]) {
          rollback.seededPlaybookIds.push(afterIds[slug]);
          resultChanges.push({
            section: "playbooks",
            action: "create",
            summary: `Seeded playbook ${slug}`,
          });
        } else {
          resultChanges.push({
            section: "playbooks",
            action: "skip",
            summary: `Playbook ${slug} already present`,
          });
        }
      }
      rollback.appliedSections.push("playbooks");
    } catch (e) {
      errors.push(`playbooks: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  // --- setup_tasks ---
  if (wants.has("setup_tasks") && template.sections.setupTasks.length > 0) {
    await Promise.all(
      template.sections.setupTasks.map(async (seed) => {
        try {
          const task = await prisma.kitchenTask.create({
            data: {
              userId: scope.userId,
              title: seed.title,
              description: seed.description ?? `From template: ${template.title}`,
              taskType: "ADMIN",
              status: "OPEN",
              priority: seed.priority ?? "MEDIUM",
              sourceType: "IMPLEMENTATION",
              sourceId: null,
              sourceLabel: `Template: ${template.title}`,
              estimatedMinutes: seed.estimatedMinutes ?? null,
              metadataJson: {
                templateKey: template.key,
                templateApplicationId: application.id,
                actionRoute: seed.actionRoute,
              } as Prisma.InputJsonValue,
            },
            select: { id: true },
          });
          rollback.generatedTaskIds.push(task.id);
          resultChanges.push({
            section: "setup_tasks",
            action: "create",
            summary: `Created task: ${seed.title}`,
          });
        } catch (e) {
          errors.push(`setup_task ${seed.title}: ${e instanceof Error ? e.message : "failed"}`);
        }
      }),
    );
    rollback.appliedSections.push("setup_tasks");
  }

  // sample_data: only intent recorded — actual menu category creation
  // would happen via Import Center or Demo Hub. We record an explicit
  // "skipped (delegated)" so the rollback log is clean.
  if (wants.has("sample_data")) {
    resultChanges.push({
      section: "sample_data",
      action: "skip",
      summary:
        "Use Demo Hub or Import Center for sample data — template does not write sample rows directly.",
    });
    rollback.appliedSections.push("sample_data");
  }

  const finalStatus: TemplateApplicationStatus = errors.length === 0 ? "APPLIED" : "PARTIALLY_APPLIED";
  await prisma.$transaction(async (tx) => {
    await tx.templateApplication.update({
      where: { id: application.id },
      data: {
        status: finalStatus,
        resultJson: { changes: resultChanges, errors } as unknown as Prisma.InputJsonValue,
        rollbackJson: rollback as unknown as Prisma.InputJsonValue,
        appliedAt: new Date(),
      },
    });
    await tx.templateApplicationEvent.create({
      data: {
        applicationId: application.id,
        userId: scope.userId,
        eventType: "apply_finished",
        performedBy: scope.email ?? "user",
        metadataJson: { status: finalStatus, errors } as Prisma.InputJsonValue,
      },
    });
  });

  return {
    applicationId: application.id,
    status: finalStatus,
    changes: resultChanges,
    errors,
  };
}

export async function rollbackApplication(
  scope: Scope,
  applicationId: string,
): Promise<{ ok: boolean; reverted: number; errors: string[] }> {
  const app = await prisma.templateApplication.findFirst({
    where: { id: applicationId, userId: scope.userId },
  });
  if (!app) throw new Error("Application not found");
  if (app.status !== "APPLIED" && app.status !== "PARTIALLY_APPLIED") {
    throw new Error(`Cannot rollback an application in status ${app.status}`);
  }
  const plan = parseRollbackPlan(app.rollbackJson);
  if (!plan) throw new Error("No rollback plan available");

  const errors: string[] = [];
  let reverted = 0;

  const [pinnedPrefs, taskScope] = await Promise.all([
    plan.pinnedModuleKeys.length > 0
      ? prisma.kitchenModulePreference.findMany({
          where: {
            userId: scope.userId,
            moduleKey: { in: plan.pinnedModuleKeys },
            pinned: true,
          },
        })
      : Promise.resolve([]),
    kitchenTaskListWhereForOwner(scope.userId),
  ]);
  const scopedTasks =
    plan.generatedTaskIds.length > 0
      ? await prisma.kitchenTask.findMany({
          where: { AND: [taskScope, { id: { in: plan.generatedTaskIds } }] },
          select: { id: true, status: true },
        })
      : [];

  await Promise.all(
    pinnedPrefs.map(async (pref) => {
      try {
        await prisma.kitchenModulePreference.update({
          where: { id: pref.id },
          data: { pinned: false },
        });
        reverted++;
      } catch (e) {
        errors.push(`unpin ${pref.moduleKey}: ${e instanceof Error ? e.message : "failed"}`);
      }
    }),
  );

  await Promise.all(
    scopedTasks.map(async (task) => {
      try {
        if (task.status === "OPEN") {
          await prisma.kitchenTask.delete({ where: { id: task.id } });
          reverted++;
        } else {
          errors.push(`task ${task.id}: status=${task.status} (kept)`);
        }
      } catch (e) {
        errors.push(`task ${task.id}: ${e instanceof Error ? e.message : "failed"}`);
      }
    }),
  );

  // 3) Revert business mode
  if (plan.changedBusinessMode) {
    try {
      await prisma.kitchenSettings.update({
        where: { userId: scope.userId },
        data: { businessType: plan.previousBusinessMode as never },
      });
      reverted++;
    } catch (e) {
      errors.push(`business_mode: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  // 4) Mark seeded playbooks inactive (do not delete — runs may reference them)
  if (plan.seededPlaybookIds.length > 0) {
    await Promise.all(
      plan.seededPlaybookIds.map(async (playbookId) => {
        try {
          await prisma.playbook.update({
            where: { id: playbookId },
            data: { active: false, status: "ARCHIVED" },
          });
          reverted++;
        } catch (e) {
          errors.push(`playbook ${playbookId}: ${e instanceof Error ? e.message : "failed"}`);
        }
      }),
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.templateApplication.update({
      where: { id: app.id },
      data: {
        status: "ROLLED_BACK",
        rolledBackAt: new Date(),
      },
    });
    await tx.templateApplicationEvent.create({
      data: {
        applicationId: app.id,
        userId: scope.userId,
        eventType: "rolled_back",
        performedBy: scope.email ?? "user",
        metadataJson: { reverted, errors } as Prisma.InputJsonValue,
      },
    });
  });

  return { ok: true, reverted, errors };
}

async function recordEvent(
  scope: Scope,
  applicationId: string,
  eventType: string,
  metadata: Record<string, unknown>,
): Promise<void> {
  try {
    await prisma.templateApplicationEvent.create({
      data: {
        applicationId,
        userId: scope.userId,
        eventType,
        performedBy: scope.email ?? "user",
        metadataJson: metadata as Prisma.InputJsonValue,
      },
    });
  } catch {
    // never block on audit
  }
}

export async function listApplications(scope: Scope, limit = 50) {
  return prisma.templateApplication.findMany({
    where: await templateApplicationListWhereForOwner(scope.userId),
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      template: { select: { title: true, key: true } },
    },
  });
}

export async function getApplication(scope: Scope, id: string) {
  return prisma.templateApplication.findFirst({
    where: await templateApplicationByIdWhereForOwner(scope.userId, id),
    include: {
      template: { select: { title: true, key: true } },
      events: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
}

export async function getTemplateKpis(scope: Scope) {
  const appScope = await templateApplicationListWhereForOwner(scope.userId);
  const [appliedCount, previewCount, lastApplied] = await Promise.all([
    prisma.templateApplication.count({
      where: { AND: [appScope, { status: { in: ["APPLIED", "PARTIALLY_APPLIED"] } }] },
    }),
    prisma.templateApplication.count({
      where: { AND: [appScope, { status: "PREVIEWED" }] },
    }),
    prisma.templateApplication.findFirst({
      where: {
        AND: [appScope, { status: { in: ["APPLIED", "PARTIALLY_APPLIED"] } }],
      },
      orderBy: { appliedAt: "desc" },
      select: { templateKey: true, appliedAt: true },
    }),
  ]);
  return {
    available: WORKSPACE_TEMPLATE_REGISTRY.length,
    appliedCount,
    previewCount,
    lastAppliedKey: lastApplied?.templateKey ?? null,
    lastAppliedAt: lastApplied?.appliedAt ?? null,
  };
}

export { previewTemplate as _previewTemplate };

// Re-export the mode of an apply for downstream cell rendering
export type { TemplateApplyMode };
