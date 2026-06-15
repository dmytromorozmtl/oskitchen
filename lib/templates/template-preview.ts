import type { BusinessType } from "@prisma/client";

import type {
  TemplatePreview,
  TemplatePreviewChange,
  TemplateSectionKey,
  WorkspaceTemplateSeed,
} from "@/lib/templates/template-types";

type ContextShape = {
  currentBusinessMode: BusinessType | null;
  existingPinnedModuleKeys: string[];
  existingPlaybookSlugs: string[];
};

/**
 * Pure preview builder. Given a workspace snapshot + a template,
 * return a list of changes with action="create"/"update"/"skip"/"noop".
 *
 * No DB writes happen here.
 */
export function buildTemplatePreview(
  template: WorkspaceTemplateSeed,
  ctx: ContextShape,
  sections: TemplateSectionKey[],
): TemplatePreview {
  const changes: TemplatePreviewChange[] = [];
  const wants = new Set(sections);

  if (wants.has("business_mode")) {
    if (!template.primaryBusinessMode) {
      changes.push({
        section: "business_mode",
        action: "noop",
        summary: "Template does not declare a business mode",
      });
    } else if (ctx.currentBusinessMode === null) {
      changes.push({
        section: "business_mode",
        action: "update",
        summary: `Set business mode to ${template.primaryBusinessMode}`,
      });
    } else if (ctx.currentBusinessMode === template.primaryBusinessMode) {
      changes.push({
        section: "business_mode",
        action: "skip",
        summary: `Business mode already set to ${template.primaryBusinessMode}`,
      });
    } else {
      changes.push({
        section: "business_mode",
        action: "update",
        summary: `Change business mode ${ctx.currentBusinessMode} → ${template.primaryBusinessMode}`,
        conflict: "Existing business mode differs — explicit overwrite required",
      });
    }
  }

  if (wants.has("module_pins")) {
    const toCreate = template.sections.modulePins.filter(
      (p) => !ctx.existingPinnedModuleKeys.includes(p.moduleKey),
    );
    const skipped = template.sections.modulePins.length - toCreate.length;
    if (toCreate.length === 0) {
      changes.push({
        section: "module_pins",
        action: "skip",
        summary: `All ${template.sections.modulePins.length} module pins already exist`,
      });
    } else {
      changes.push({
        section: "module_pins",
        action: "create",
        summary: `Pin ${toCreate.length} modules`,
        detail: toCreate.map((p) => p.moduleKey).join(", "),
      });
      if (skipped > 0) {
        changes.push({
          section: "module_pins",
          action: "skip",
          summary: `${skipped} already pinned`,
        });
      }
    }
  }

  if (wants.has("module_visibility")) {
    changes.push({
      section: "module_visibility",
      action: "noop",
      summary: "Visibility unchanged — only pinning is applied",
      detail: "Disabled modules stay disabled. Use Settings → Modules to override.",
    });
  }

  if (wants.has("playbooks")) {
    const toSeed = template.sections.playbookSlugs.filter(
      (s) => !ctx.existingPlaybookSlugs.includes(s),
    );
    if (toSeed.length === 0) {
      changes.push({
        section: "playbooks",
        action: "skip",
        summary: "Recommended playbooks already exist",
      });
    } else {
      changes.push({
        section: "playbooks",
        action: "create",
        summary: `Seed ${toSeed.length} playbook(s)`,
        detail: toSeed.join(", "),
      });
    }
  }

  if (wants.has("setup_tasks")) {
    if (template.sections.setupTasks.length === 0) {
      changes.push({
        section: "setup_tasks",
        action: "noop",
        summary: "No setup tasks declared",
      });
    } else {
      changes.push({
        section: "setup_tasks",
        action: "create",
        summary: `Create ${template.sections.setupTasks.length} setup tasks`,
      });
    }
  }

  if (wants.has("storefront_defaults") && template.sections.storefrontHints) {
    changes.push({
      section: "storefront_defaults",
      action: "update",
      summary: "Set storefront theme defaults",
      detail: JSON.stringify(template.sections.storefrontHints),
    });
  }

  if (wants.has("report_pack")) {
    const keys = template.sections.reportPackKeys ?? [];
    changes.push({
      section: "report_pack",
      action: keys.length === 0 ? "noop" : "create",
      summary: keys.length === 0 ? "No report pack" : `Pin ${keys.length} reports`,
      detail: keys.join(", ") || undefined,
    });
  }

  if (wants.has("import_templates")) {
    const keys = template.sections.importTemplateKeys ?? [];
    changes.push({
      section: "import_templates",
      action: keys.length === 0 ? "noop" : "create",
      summary:
        keys.length === 0 ? "No import templates" : `Reference ${keys.length} import templates`,
      detail: keys.join(", ") || undefined,
    });
  }

  if (wants.has("sample_data")) {
    const cats = template.sections.sampleMenuCategories ?? [];
    if (cats.length === 0) {
      changes.push({
        section: "sample_data",
        action: "noop",
        summary: "No sample data declared",
      });
    } else {
      changes.push({
        section: "sample_data",
        action: "create",
        summary: `Create ${cats.length} empty menu categories (opt-in)`,
        detail: cats.join(", "),
      });
    }
  }

  const counts = changes.reduce(
    (acc, c) => {
      if (c.action === "create") acc.create++;
      else if (c.action === "update") acc.update++;
      else if (c.action === "skip") acc.skip++;
      if (c.conflict) acc.conflicts++;
      return acc;
    },
    { create: 0, update: 0, skip: 0, conflicts: 0 },
  );

  return {
    templateKey: template.key,
    templateVersion: template.version,
    generatedAt: new Date().toISOString(),
    businessMode: template.primaryBusinessMode,
    changes,
    counts,
    rollback: {
      available: "full",
      reason:
        "Pinned modules can be un-pinned; setup tasks can be deleted; business mode can be reverted to its prior value.",
    },
  };
}
