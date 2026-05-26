/** U1 feature flag — edge/middleware-safe (no node:crypto). */

export function isZkAssignmentFairnessEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_ZK_ASSIGNMENT_FAIRNESS === "1";
}
