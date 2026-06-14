import type { BetaProgramStage } from "@prisma/client";

const FUNNEL_STEPS: { step: string; stages: BetaProgramStage[] }[] = [
  { step: "Applied", stages: ["NEW", "REVIEWING"] },
  { step: "Qualified", stages: ["QUALIFIED", "WAITLISTED", "APPROVED"] },
  { step: "Invited", stages: ["INVITED"] },
  { step: "Onboarding", stages: ["ONBOARDING"] },
  { step: "Activated", stages: ["ACTIVATED", "POWER_USER"] },
  { step: "Paid", stages: ["CONVERTED"] },
];

export function buildBetaLifecycleFunnel(stageCounts: Map<BetaProgramStage, number>) {
  return FUNNEL_STEPS.map(({ step, stages }) => ({
    step,
    count: stages.reduce((acc, s) => acc + (stageCounts.get(s) ?? 0), 0),
  }));
}

export function cohortActivationRate(params: {
  membersInCohort: number;
  activatedOrBeyond: number;
}): number {
  if (params.membersInCohort <= 0) return 0;
  return Math.round((params.activatedOrBeyond / params.membersInCohort) * 1000) / 10;
}
