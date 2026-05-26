"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { canUseTemplates } from "@/lib/templates/template-permissions";
import type { TemplateActorScope, TemplateSectionKey } from "@/lib/templates/template-types";
import { ALL_TEMPLATE_SECTIONS } from "@/lib/templates/template-types";
import {
  applyTemplate,
  previewTemplate,
  rollbackApplication,
} from "@/services/templates/template-service";

const PATH = "/dashboard/templates";

function scopeFor(
  user: { id: string; email?: string | null },
  dataUserId: string,
): TemplateActorScope & {
  userId: string;
  email: string | null;
} {
  return {
    userId: dataUserId,
    email: user.email ?? null,
    isOwner: true,
    role: null,
  };
}

const sectionEnum = z.enum([
  "business_mode",
  "module_pins",
  "module_visibility",
  "playbooks",
  "setup_tasks",
  "storefront_defaults",
  "report_pack",
  "import_templates",
  "sample_data",
] as const);

const previewSchema = z.object({
  templateKey: z.string().min(1).max(120),
  sections: z.array(sectionEnum).optional(),
});

export async function previewTemplateAction(
  input: z.infer<typeof previewSchema>,
): Promise<{ ok: boolean; error?: string; counts?: { create: number; update: number; skip: number; conflicts: number } }> {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const scope = scopeFor(user, dataUserId);
    if (!canUseTemplates(scope, "templates.preview")) {
      return { ok: false, error: "Forbidden" };
    }
    const parsed = previewSchema.parse(input);
    const sections = (parsed.sections ?? ALL_TEMPLATE_SECTIONS) as TemplateSectionKey[];
    const { preview } = await previewTemplate(scope, parsed.templateKey, sections);
    revalidatePath(PATH);
    revalidatePath(`${PATH}/${parsed.templateKey}`);
    return { ok: true, counts: preview.counts };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unable to preview" };
  }
}

const applySchema = z.object({
  templateKey: z.string().min(1).max(120),
  applyMode: z.enum([
    "PREVIEW_ONLY",
    "APPLY_CONFIGURATION_ONLY",
    "APPLY_SAMPLE_DATA",
    "APPLY_SELECTED_MODULES",
    "APPLY_PLAYBOOKS_ONLY",
    "APPLY_IMPORT_TEMPLATES_ONLY",
  ] as const),
  selectedSections: z.array(sectionEnum).min(1),
  acknowledgeConflicts: z.boolean().optional().default(false),
  overwriteBusinessMode: z.boolean().optional().default(false),
});

export async function applyTemplateAction(
  input: z.infer<typeof applySchema>,
): Promise<{
  ok: boolean;
  applicationId?: string;
  status?: string;
  errors?: string[];
  error?: string;
}> {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const scope = scopeFor(user, dataUserId);
    if (!canUseTemplates(scope, "templates.apply")) {
      return { ok: false, error: "Forbidden" };
    }
    const parsed = applySchema.parse(input);
    const result = await applyTemplate(scope, {
      templateKey: parsed.templateKey,
      applyMode: parsed.applyMode,
      selectedSections: parsed.selectedSections as TemplateSectionKey[],
      acknowledgeConflicts: parsed.acknowledgeConflicts ?? false,
      overwriteBusinessMode: parsed.overwriteBusinessMode ?? false,
    });
    revalidatePath(PATH);
    revalidatePath(`${PATH}/${parsed.templateKey}`);
    return {
      ok: true,
      applicationId: result.applicationId,
      status: result.status,
      errors: result.errors,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unable to apply" };
  }
}

const rollbackSchema = z.object({
  applicationId: z.string().uuid(),
});

export async function rollbackTemplateAction(
  input: z.infer<typeof rollbackSchema>,
): Promise<{ ok: boolean; reverted?: number; errors?: string[]; error?: string }> {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const scope = scopeFor(user, dataUserId);
    if (!canUseTemplates(scope, "templates.rollback")) {
      return { ok: false, error: "Forbidden" };
    }
    const parsed = rollbackSchema.parse(input);
    const result = await rollbackApplication(scope, parsed.applicationId);
    revalidatePath(PATH);
    return { ok: true, reverted: result.reverted, errors: result.errors };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unable to rollback" };
  }
}
