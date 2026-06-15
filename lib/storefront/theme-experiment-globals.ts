/** Edge-safe flags — no Prisma imports (middleware bundle). */

export const STOREFRONT_THEME_EXPERIMENT_FEATURE_KEY = "storefront.theme_experiment";

export function isThemeExperimentGloballyDisabled(): boolean {
  return process.env.THEME_EXPERIMENT_DISABLED === "1";
}
