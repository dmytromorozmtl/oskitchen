/**
 * Absolute Final Task 28 — Pilot Week 1 roadmap (T-0 → T+7).
 *
 * @see docs/pilot-week1-roadmap.md
 * @see docs/pilot-week1-checklist.md
 * @see lib/commercial/pilot-week1-execution-phases-era21.ts
 */

export const PILOT_WEEK1_ROADMAP_POLICY_ID = "pilot-week1-roadmap-absolute-final-v1" as const;

export const PILOT_WEEK1_ROADMAP_DOC = "docs/pilot-week1-roadmap.md" as const;

export const PILOT_WEEK1_ROADMAP_REQUIRED_HEADINGS = [
  "Milestone timeline",
  "T-0 — Onboarding (Day 0)",
  "T+1 — KDS (Day 1)",
  "T+3 — First order (Day 3)",
  "T+7 — Briefing (Day 7)",
  "Human gate checklist",
] as const;

export const PILOT_WEEK1_ROADMAP_MILESTONES = [
  "T-0 onboarding",
  "T+1 KDS",
  "T+3 first order",
  "T+7 briefing",
] as const;

export const PILOT_WEEK1_ROADMAP_ROUTES = [
  "/dashboard/launch-wizard",
  "/dashboard/kitchen",
  "/dashboard/order-hub",
  "/dashboard/today",
] as const;

export const PILOT_WEEK1_ROADMAP_KPI_TARGETS = [
  "Orders/day",
  "Bump time (median)",
  "Health score",
] as const;

export const PILOT_WEEK1_ROADMAP_CI_SCRIPTS = ["test:ci:pilot-week1-roadmap"] as const;

export type PilotWeek1RoadmapDocAudit = {
  policyId: typeof PILOT_WEEK1_ROADMAP_POLICY_ID;
  missingHeadings: string[];
  milestoneCount: number;
  routeCount: number;
  kpiCount: number;
  passed: boolean;
};

export function auditPilotWeek1RoadmapDoc(source: string): PilotWeek1RoadmapDocAudit {
  const missingHeadings = PILOT_WEEK1_ROADMAP_REQUIRED_HEADINGS.filter(
    (heading) => !source.includes(heading),
  );
  const milestoneCount = PILOT_WEEK1_ROADMAP_MILESTONES.filter((milestone) =>
    source.includes(milestone),
  ).length;
  const routeCount = PILOT_WEEK1_ROADMAP_ROUTES.filter((route) => source.includes(route)).length;
  const kpiCount = PILOT_WEEK1_ROADMAP_KPI_TARGETS.filter((kpi) => source.includes(kpi)).length;

  return {
    policyId: PILOT_WEEK1_ROADMAP_POLICY_ID,
    missingHeadings,
    milestoneCount,
    routeCount,
    kpiCount,
    passed:
      missingHeadings.length === 0 &&
      milestoneCount === PILOT_WEEK1_ROADMAP_MILESTONES.length &&
      routeCount === PILOT_WEEK1_ROADMAP_ROUTES.length &&
      kpiCount === PILOT_WEEK1_ROADMAP_KPI_TARGETS.length,
  };
}
