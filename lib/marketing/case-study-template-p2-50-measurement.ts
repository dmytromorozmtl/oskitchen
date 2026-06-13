import {
  CASE_STUDY_TEMPLATE_P2_50_CORE_SECTIONS,
  CASE_STUDY_TEMPLATE_P2_50_MILESTONES,
} from "@/lib/marketing/case-study-template-p2-50-policy";

export type CaseStudyMilestoneValidation = {
  hasChallenge: boolean;
  hasSolution: boolean;
  hasResults: boolean;
  milestonesPresent: string[];
  missingMilestones: string[];
  passed: boolean;
};

export function validateCaseStudyMilestoneDraft(source: string): CaseStudyMilestoneValidation {
  const lower = source.toLowerCase();

  const hasChallenge = lower.includes("challenge") || lower.includes("the challenge");
  const hasSolution = lower.includes("solution") || lower.includes("why os kitchen");
  const hasResults = lower.includes("results");

  const milestonesPresent = CASE_STUDY_TEMPLATE_P2_50_MILESTONES.filter((milestone) => {
    const token = milestone.toLowerCase();
    return (
      lower.includes(`results ${token}`) ||
      lower.includes(`### results — ${token}`) ||
      lower.includes(`## results — ${token}`) ||
      lower.includes(`### ${token}`) ||
      (lower.includes("week 1") && milestone === "W1") ||
      (lower.includes("month 1") && milestone === "M1") ||
      (lower.includes("month 3") && milestone === "M3")
    );
  });

  const missingMilestones = CASE_STUDY_TEMPLATE_P2_50_MILESTONES.filter(
    (m) => !milestonesPresent.includes(m),
  );

  const passed =
    hasChallenge &&
    hasSolution &&
    hasResults &&
    missingMilestones.length === 0 &&
    CASE_STUDY_TEMPLATE_P2_50_CORE_SECTIONS.length === 3;

  return {
    hasChallenge,
    hasSolution,
    hasResults,
    milestonesPresent,
    missingMilestones,
    passed,
  };
}

export function scoreMilestoneCompleteness(
  milestonesPresent: readonly string[],
): number {
  if (CASE_STUDY_TEMPLATE_P2_50_MILESTONES.length === 0) return 0;
  return Math.round(
    (milestonesPresent.length / CASE_STUDY_TEMPLATE_P2_50_MILESTONES.length) * 100,
  );
}
