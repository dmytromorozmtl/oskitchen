import type { PartnerImplementationStage } from "@prisma/client";

/** Canonical ordering for pipeline / Kanban columns. */
export const IMPLEMENTATION_PIPELINE_ORDER: readonly PartnerImplementationStage[] = [
  "DISCOVERY",
  "CONTRACT_SIGNED",
  "DATA_MIGRATION",
  "MENU_SETUP",
  "INTEGRATIONS",
  "STAFF_SETUP",
  "TRAINING",
  "QA",
  "SOFT_LAUNCH",
  "GO_LIVE",
  "STABILIZATION",
  "EXPANSION",
] as const;

export function implementationStageIndex(stage: PartnerImplementationStage): number {
  return IMPLEMENTATION_PIPELINE_ORDER.indexOf(stage);
}
