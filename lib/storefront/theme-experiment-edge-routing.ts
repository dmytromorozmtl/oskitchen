import { edgeConfigKeyForStore } from "@/lib/storefront/theme-experiment-edge-config";
export const THEME_EXPERIMENT_ROUTING_PREFIX = "theme-exp-routing:";

export type ThemeExperimentEdgeRouting = {
  /** Primary Edge Config key holding experiment payload. */
  configKey: string;
  workspaceId: string | null;
  /** Legacy slug-only key (migration / rollback). */
  legacyKey: string;
};

export function edgeRoutingKeyForStore(storeSlug: string): string {
  return `${THEME_EXPERIMENT_ROUTING_PREFIX}${storeSlug}`;
}

export function buildThemeExperimentEdgeRouting(input: {
  storeSlug: string;
  workspaceId?: string | null;
}): ThemeExperimentEdgeRouting {
  const legacyKey = edgeConfigKeyForStore(input.storeSlug);
  const configKey = edgeConfigKeyForStore(input.storeSlug, input.workspaceId);
  return {
    configKey,
    workspaceId: input.workspaceId?.trim() || null,
    legacyKey,
  };
}

export function parseThemeExperimentEdgeRouting(raw: unknown): ThemeExperimentEdgeRouting | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const configKey = typeof o.configKey === "string" ? o.configKey : "";
  const legacyKey = typeof o.legacyKey === "string" ? o.legacyKey : "";
  if (!configKey) return null;
  return {
    configKey,
    legacyKey: legacyKey || configKey,
    workspaceId: typeof o.workspaceId === "string" ? o.workspaceId : null,
  };
}
