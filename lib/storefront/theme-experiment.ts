import type { StorefrontPublicPayload } from "@/lib/storefront/public-access";
import {
  armFromTrafficBucket,
  stableBucketPercent,
  THEME_EXPERIMENT_ARM_HEADER,
} from "@/lib/storefront/theme-experiment-bucket";

export const THEME_EXPERIMENT_COOKIE = "kos_ab_theme";
export { THEME_EXPERIMENT_ARM_HEADER };

export type ThemeExperimentConfig = {
  enabled?: boolean;
  /** Theme preset id applied to draft arm */
  draftPresetId?: string;
  /** 0–100: share of guests who see draft theme tokens */
  trafficPercent?: number;
};

export type ThemeExperimentArm = "published" | "draft";

export function parseThemeExperimentConfig(raw: unknown): ThemeExperimentConfig | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (o.enabled !== true) return null;
  return {
    enabled: true,
    draftPresetId: typeof o.draftPresetId === "string" ? o.draftPresetId : undefined,
    trafficPercent:
      typeof o.trafficPercent === "number" && o.trafficPercent >= 0 && o.trafficPercent <= 100
        ? o.trafficPercent
        : 50,
  };
}

/** Resolve which theme arm a guest should see; may suggest a new cookie value. */
export function resolveThemeExperimentArm(input: {
  config: ThemeExperimentConfig | null;
  cookieValue: string | null | undefined;
  /** Middleware-assigned arm for this request (before Set-Cookie is visible to RSC). */
  requestArm?: string | null | undefined;
  /** Deterministic bucket when visitor id is known (edge / API assigner). */
  visitorId?: string | null | undefined;
}): { arm: ThemeExperimentArm; setCookie?: ThemeExperimentArm } {
  const cfg = input.config;
  if (!cfg?.enabled) return { arm: "published" };

  const fromRequest =
    input.requestArm === "draft" || input.requestArm === "published" ? input.requestArm : null;
  if (fromRequest) return { arm: fromRequest };

  const existing = input.cookieValue === "draft" || input.cookieValue === "published" ? input.cookieValue : null;
  if (existing) return { arm: existing };

  const pct = cfg.trafficPercent ?? 50;
  const visitorId = input.visitorId?.trim();
  if (visitorId) {
    const arm = armFromTrafficBucket(stableBucketPercent(visitorId), pct);
    return { arm, setCookie: arm };
  }

  const arm: ThemeExperimentArm = Math.random() * 100 < pct ? "draft" : "published";
  return { arm, setCookie: arm };
}

export function shouldUseDraftThemeForExperiment(
  sf: StorefrontPublicPayload,
  arm: ThemeExperimentArm,
  previewDraftNav: boolean,
): boolean {
  if (previewDraftNav) return true;
  if (arm === "draft") return true;
  return false;
}
