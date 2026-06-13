import {
  CASE_STUDY_TEMPLATE_P2_50_CORE_SECTIONS,
  CASE_STUDY_TEMPLATE_P2_50_MILESTONES,
} from "@/lib/marketing/case-study-template-p2-50-policy";

export const CASE_STUDY_TEMPLATE_P2_50_DISCLAIMER =
  "Internal draft only — no published customer case study until publish gates pass (see docs/case-study-template.md)." as const;

export type CaseStudyMilestoneMetric = {
  key: string;
  label: string;
  w1: string;
  m1: string;
  m3: string;
};

/** Suggested metrics per milestone window — replace [TBD] with verified exports only. */
export const CASE_STUDY_MILESTONE_METRICS: readonly CaseStudyMilestoneMetric[] = [
  {
    key: "orders_per_day",
    label: "Orders/day",
    w1: "[TBD — pilot week baseline]",
    m1: "[TBD — verified dashboard export]",
    m3: "[TBD — verified dashboard export]",
  },
  {
    key: "median_bump_minutes",
    label: "Median KDS bump time (min)",
    w1: "[TBD]",
    m1: "[TBD]",
    m3: "[TBD]",
  },
  {
    key: "integration_health_score",
    label: "Integration health score (/100)",
    w1: "[TBD]",
    m1: "[TBD]",
    m3: "[TBD]",
  },
  {
    key: "labor_percent",
    label: "Labor % of revenue",
    w1: "[TBD]",
    m1: "[TBD]",
    m3: "[TBD]",
  },
  {
    key: "repeat_order_rate",
    label: "Repeat order rate (%)",
    w1: "[TBD — too early]",
    m1: "[TBD]",
    m3: "[TBD]",
  },
] as const;

export const CASE_STUDY_TEMPLATE_P2_50_SHORT_FORM = `**Challenge:** [1 sentence — channel chaos, manual production, packing errors]

**Solution:** OS Kitchen [modules actually used — e.g. Order Hub + KDS + Integration Health]

**Results:**
- **W1:** [First live order · baseline metrics captured]
- **M1:** [Operational rhythm · verified KPI delta]
- **M3:** [Expansion / retention · verified KPI delta]

**Quote:** "[Signed operator voice — pending customer approval]"` as const;

export function listCaseStudyTemplateP2_50SectionLabels(): string[] {
  return [
    ...CASE_STUDY_TEMPLATE_P2_50_CORE_SECTIONS,
    ...CASE_STUDY_TEMPLATE_P2_50_MILESTONES.map((m) => `Results ${m}`),
  ];
}
