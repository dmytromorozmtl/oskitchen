import type { BetaProgramStage } from "@prisma/client";

/** Pipeline order for Kanban columns (left → right). */
export const BETA_PIPELINE_ORDER: readonly BetaProgramStage[] = [
  "NEW",
  "REVIEWING",
  "QUALIFIED",
  "WAITLISTED",
  "APPROVED",
  "INVITED",
  "ONBOARDING",
  "ACTIVATED",
  "POWER_USER",
  "CONVERTED",
  "CHURNED",
  "REJECTED",
] as const;

export const BETA_STAGE_LABEL: Record<BetaProgramStage, string> = {
  NEW: "New",
  REVIEWING: "Reviewing",
  QUALIFIED: "Qualified",
  WAITLISTED: "Waitlisted",
  APPROVED: "Approved",
  INVITED: "Invited",
  ONBOARDING: "Onboarding",
  ACTIVATED: "Activated",
  POWER_USER: "Power user",
  CONVERTED: "Converted",
  CHURNED: "Churned",
  REJECTED: "Rejected",
};

export function isTerminalBetaStage(stage: BetaProgramStage): boolean {
  return stage === "CONVERTED" || stage === "CHURNED" || stage === "REJECTED";
}
