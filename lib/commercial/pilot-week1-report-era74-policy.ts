/**
 * Era 74 — Pilot Week 1 report (P0 critical path #74).
 *
 * @see docs/pilot-week1-report.md
 * @see docs/loi-signed.md
 */

export const PILOT_WEEK1_REPORT_ERA74_POLICY_ID = "era74-pilot-week1-report-v1" as const;

export const PILOT_WEEK1_REPORT_ERA74_DOC = "docs/pilot-week1-report.md" as const;

export const PILOT_WEEK1_REPORT_ERA74_LOI_DOC = "docs/loi-signed.md" as const;

export const PILOT_WEEK1_REPORT_ERA74_CHECKLIST_DOC = "docs/pilot-week1-checklist.md" as const;

export const PILOT_WEEK1_REPORT_ERA74_CUSTOMER = "Riverbend Commissary LLC" as const;

export const PILOT_WEEK1_REPORT_ERA74_WORKSPACE_SLUG = "riverbend-commissary" as const;

export const PILOT_WEEK1_REPORT_ERA74_CI_SCRIPTS = [
  "test:ci:pilot-week1-report-era74",
  "test:ci:pilot-week1-report-era74:cert",
] as const;

export const PILOT_WEEK1_REPORT_ERA74_DOC_REQUIRED_HEADINGS = [
  "Pilot summary",
  "Week 1 scope",
  "Day-by-day outcomes",
  "Week 1 KPI capture",
  "Checkpoint artifacts",
  "Blockers and remediation",
  "CS + COO sign-off",
  "Honest limitations",
  "Related docs",
] as const;

export const PILOT_WEEK1_REPORT_ERA74_FORBIDDEN_CLAIMS = [
  "production-proven at scale",
  "guaranteed sub-second kds",
  "100% channel uptime",
  "all integrations are live",
  "thousands of restaurants",
  "series a",
] as const;

export const PILOT_WEEK1_REPORT_ERA74_KPI_TARGETS = {
  ordersPerDay: 10,
  medianBumpMinutes: 15,
  healthScore: 80,
  operatorSatisfaction: 4.0,
} as const;
