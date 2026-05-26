import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import {
  isThemeExperimentGloballyDisabled,
  STOREFRONT_THEME_EXPERIMENT_FEATURE_KEY,
} from "@/lib/storefront/theme-experiment-globals";

export { isThemeExperimentGloballyDisabled, STOREFRONT_THEME_EXPERIMENT_FEATURE_KEY };

/** Per-storefront flag in `themeExperimentJson` (toggle on Advanced without redeploy). */
export function isExperimentPipelineEnabledInJson(raw: unknown): boolean {
  if (isThemeExperimentGloballyDisabled()) return false;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return true;
  const pipelineEnabled = (raw as Record<string, unknown>).pipelineEnabled;
  if (pipelineEnabled === false) return false;
  return true;
}

/** Workspace override in `workspace_feature_overrides` (feature_key = storefront.theme_experiment). */
export async function isThemeExperimentPipelineEnabledForWorkspace(
  workspaceId: string | null | undefined,
): Promise<boolean> {
  if (!workspaceId?.trim()) return true;
  const row = await prisma.workspaceFeatureOverride.findUnique({
    where: {
      workspaceId_featureKey: {
        workspaceId,
        featureKey: STOREFRONT_THEME_EXPERIMENT_FEATURE_KEY,
      },
    },
    select: { enabled: true },
  });
  if (row) return row.enabled;
  return true;
}

export async function isThemeExperimentPipelineActive(input: {
  workspaceId?: string | null;
  themeExperimentJson: unknown;
}): Promise<boolean> {
  if (!isExperimentPipelineEnabledInJson(input.themeExperimentJson)) return false;
  return isThemeExperimentPipelineEnabledForWorkspace(input.workspaceId);
}
