import type { TemplateRollbackPlan } from "@/lib/templates/template-apply";

/**
 * Pure helper that parses a stored `rollback_json` payload and
 * returns a typed `TemplateRollbackPlan`. The actual rollback work
 * lives in `services/templates/template-service.ts`.
 */
export function parseRollbackPlan(input: unknown): TemplateRollbackPlan | null {
  if (!input || typeof input !== "object") return null;
  const r = input as Record<string, unknown>;
  if (!Array.isArray(r.appliedSections) || !Array.isArray(r.pinnedModuleKeys)) {
    return null;
  }
  return {
    appliedSections: r.appliedSections as TemplateRollbackPlan["appliedSections"],
    pinnedModuleKeys: (r.pinnedModuleKeys as string[]) ?? [],
    generatedTaskIds: Array.isArray(r.generatedTaskIds) ? (r.generatedTaskIds as string[]) : [],
    previousBusinessMode: (r.previousBusinessMode as string | null) ?? null,
    changedBusinessMode: Boolean(r.changedBusinessMode),
    seededPlaybookIds: Array.isArray(r.seededPlaybookIds)
      ? (r.seededPlaybookIds as string[])
      : [],
  };
}

export function rollbackAvailability(
  plan: TemplateRollbackPlan | null,
): "full" | "partial" | "none" {
  if (!plan) return "none";
  // Always at least partial — we can always un-pin modules and delete tasks
  if (plan.changedBusinessMode || plan.pinnedModuleKeys.length || plan.generatedTaskIds.length) {
    return "full";
  }
  return "partial";
}
