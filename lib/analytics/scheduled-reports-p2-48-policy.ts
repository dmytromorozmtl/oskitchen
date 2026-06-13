/**
 * Blueprint P2-48 — Scheduled reports (Lightspeed parity).
 *
 * Weekly email PDF digest for executive summary
 *
 * @see docs/scheduled-reports-p2-48.md
 */

export const SCHEDULED_REPORTS_P2_48_POLICY_ID = "scheduled-reports-p2-48-v1" as const;

export const SCHEDULED_REPORTS_P2_48_DOC = "docs/scheduled-reports-p2-48.md" as const;

export const SCHEDULED_REPORTS_P2_48_ARTIFACT =
  "artifacts/scheduled-reports-p2-48-registry.json" as const;

export const SCHEDULED_REPORTS_P2_48_REPORTS_ROUTE = "/dashboard/reports" as const;

export const SCHEDULED_REPORTS_P2_48_CRON_ROUTE =
  "app/api/cron/scheduled-reports-weekly/route.ts" as const;

export const SCHEDULED_REPORTS_P2_48_CRON_PATH = "/api/cron/scheduled-reports-weekly" as const;

export const SCHEDULED_REPORTS_P2_48_CRON_SLUG = "scheduled-reports-weekly" as const;

export const SCHEDULED_REPORTS_P2_48_SERVICE =
  "services/analytics/scheduled-reports-p2-48-service.ts" as const;

export const SCHEDULED_REPORTS_P2_48_PANEL =
  "components/reports/scheduled-reports-p2-48-panel.tsx" as const;

export const SCHEDULED_REPORTS_P2_48_REPORTS_PAGE = "app/dashboard/reports/page.tsx" as const;

export const SCHEDULED_REPORTS_P2_48_PDF_MODULE =
  "lib/analytics/scheduled-reports-p2-48-pdf.ts" as const;

export const SCHEDULED_REPORTS_P2_48_STORAGE = "lib/analytics/scheduled-reports-p2-48-storage.ts" as const;

export const SCHEDULED_REPORTS_P2_48_ROOT_TEST_ID = "scheduled-reports-p2-48" as const;

export const SCHEDULED_REPORTS_P2_48_ENABLED_TEST_ID = "scheduled-reports-enabled" as const;

export const SCHEDULED_REPORTS_P2_48_NEXT_SEND_TEST_ID = "scheduled-reports-next-send" as const;

export const SCHEDULED_REPORTS_P2_48_STORAGE_KEY = "scheduledReportsP2_48" as const;

export const SCHEDULED_REPORTS_P2_48_DEFAULT_REPORT_KEY = "executive_weekly_summary" as const;

export const SCHEDULED_REPORTS_P2_48_CRON_SCHEDULE = "0 7 * * 1" as const;

export const SCHEDULED_REPORTS_P2_48_AUDIT_SCRIPT = "scripts/audit-scheduled-reports-p2-48.ts" as const;

export const SCHEDULED_REPORTS_P2_48_NPM_SCRIPT = "audit:scheduled-reports-p2-48" as const;

export const SCHEDULED_REPORTS_P2_48_CHECK_NPM_SCRIPT = "check:scheduled-reports-p2-48" as const;

export const SCHEDULED_REPORTS_P2_48_UNIT_TEST = "tests/unit/scheduled-reports-p2-48.test.ts" as const;

export const SCHEDULED_REPORTS_P2_48_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const SCHEDULED_REPORTS_P2_48_FLOW_STEPS = [
  "resolve_weekly_window",
  "run_executive_summary",
  "generate_pdf_attachment",
  "email_weekly_digest",
] as const;

export const SCHEDULED_REPORTS_P2_48_HONESTY_MARKERS = [
  "Lightspeed parity",
  "weekly",
  "email",
  "PDF",
  "BETA",
] as const;

export const SCHEDULED_REPORTS_P2_48_WIRING_PATHS = [
  SCHEDULED_REPORTS_P2_48_DOC,
  "lib/analytics/scheduled-reports-p2-48-audit.ts",
  "lib/analytics/scheduled-reports-p2-48-measurement.ts",
  SCHEDULED_REPORTS_P2_48_STORAGE,
  SCHEDULED_REPORTS_P2_48_PDF_MODULE,
  SCHEDULED_REPORTS_P2_48_SERVICE,
  SCHEDULED_REPORTS_P2_48_PANEL,
  SCHEDULED_REPORTS_P2_48_CRON_ROUTE,
  SCHEDULED_REPORTS_P2_48_UNIT_TEST,
  SCHEDULED_REPORTS_P2_48_ARTIFACT,
] as const;
