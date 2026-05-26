/** Edge sync must succeed before treating experiment save as OK (prod default when edge is on). */
export function isThemeExperimentEdgeStrict(): boolean {
  if (process.env.THEME_EXPERIMENT_EDGE_STRICT === "0") return false;
  if (process.env.THEME_EXPERIMENT_EDGE_STRICT === "1") return true;
  return (
    process.env.NODE_ENV === "production" && process.env.THEME_EXPERIMENT_EDGE === "1"
  );
}
