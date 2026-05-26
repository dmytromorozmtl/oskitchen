import { THEME_EXPERIMENT_COOKIE, type ThemeExperimentArm } from "@/lib/storefront/theme-experiment";

/** Read kos_ab_theme from document.cookie (client only). */
export function readThemeExperimentArmFromCookie(): ThemeExperimentArm | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${THEME_EXPERIMENT_COOKIE}=([^;]+)`));
  const v = m?.[1];
  return v === "draft" || v === "published" ? v : null;
}
