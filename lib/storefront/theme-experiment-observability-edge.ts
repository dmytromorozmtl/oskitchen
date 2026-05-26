import { logger } from "@/lib/logger";

export type MiddlewareArmSource = "edge" | "cookie" | "none";

const ARM_ASSIGNED_SAMPLE_RATE = Number(process.env.THEME_EXPERIMENT_ARM_LOG_SAMPLE ?? "0.02");

/** Sampled assignment log for Vercel Log Drain (filter: alert_type = theme_experiment_arm_assigned). */
export function logThemeExperimentArmAssigned(
  fields: Record<string, string | number | boolean | null | undefined>,
) {
  if (ARM_ASSIGNED_SAMPLE_RATE <= 0) return;
  if (Math.random() > ARM_ASSIGNED_SAMPLE_RATE) return;
  logger.info("theme_experiment_arm_assigned", {
    alert_type: "theme_experiment_arm_assigned",
    component: "theme_experiment",
    ...fields,
  });
}

/** Structured logs for experiment edge pipeline (5C observability). */
export function logThemeExperimentObservability(
  event: string,
  fields: Record<string, string | number | boolean | null | undefined>,
) {
  logger.info(`theme_experiment_${event}`, {
    ...fields,
    component: "theme_experiment",
  });
}
