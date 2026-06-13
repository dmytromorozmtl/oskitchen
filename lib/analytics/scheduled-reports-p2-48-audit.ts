import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  buildScheduledReportDedupeKey,
  resolveWeeklyReportWindow,
} from "@/lib/analytics/scheduled-reports-p2-48-measurement";
import {
  SCHEDULED_REPORTS_P2_48_CRON_PATH,
  SCHEDULED_REPORTS_P2_48_CRON_ROUTE,
  SCHEDULED_REPORTS_P2_48_CRON_SCHEDULE,
  SCHEDULED_REPORTS_P2_48_CRON_SLUG,
  SCHEDULED_REPORTS_P2_48_DOC,
  SCHEDULED_REPORTS_P2_48_ENABLED_TEST_ID,
  SCHEDULED_REPORTS_P2_48_FLOW_STEPS,
  SCHEDULED_REPORTS_P2_48_HONESTY_MARKERS,
  SCHEDULED_REPORTS_P2_48_NEXT_SEND_TEST_ID,
  SCHEDULED_REPORTS_P2_48_PANEL,
  SCHEDULED_REPORTS_P2_48_PDF_MODULE,
  SCHEDULED_REPORTS_P2_48_POLICY_ID,
  SCHEDULED_REPORTS_P2_48_REPORTS_PAGE,
  SCHEDULED_REPORTS_P2_48_REPORTS_ROUTE,
  SCHEDULED_REPORTS_P2_48_ROOT_TEST_ID,
  SCHEDULED_REPORTS_P2_48_SERVICE,
  SCHEDULED_REPORTS_P2_48_WIRING_PATHS,
} from "@/lib/analytics/scheduled-reports-p2-48-policy";

export type ScheduledReportsP2_48AuditSummary = {
  policyId: typeof SCHEDULED_REPORTS_P2_48_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  serviceWired: boolean;
  panelWired: boolean;
  reportsPageWired: boolean;
  cronWired: boolean;
  goldenWeekWindowOk: boolean;
  honestyMarkersPresent: boolean;
  passed: boolean;
};

export function auditScheduledReportsP2_48(
  root = process.cwd(),
): ScheduledReportsP2_48AuditSummary {
  const wiringComplete = SCHEDULED_REPORTS_P2_48_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, SCHEDULED_REPORTS_P2_48_DOC))) {
    const source = readFileSync(join(root, SCHEDULED_REPORTS_P2_48_DOC), "utf8").toLowerCase();
    docWired =
      source.includes("lightspeed parity") &&
      source.includes("weekly") &&
      source.includes("email") &&
      source.includes("pdf");
  }

  let serviceWired = false;
  if (existsSync(join(root, SCHEDULED_REPORTS_P2_48_SERVICE))) {
    const source = readFileSync(join(root, SCHEDULED_REPORTS_P2_48_SERVICE), "utf8");
    serviceWired =
      source.includes("sendWeeklyScheduledReportEmail") &&
      source.includes("buildScheduledReportPdfAttachment") &&
      source.includes("runScheduledReportsWeeklyBatch");
  }

  let panelWired = false;
  if (existsSync(join(root, SCHEDULED_REPORTS_P2_48_PANEL))) {
    const source = readFileSync(join(root, SCHEDULED_REPORTS_P2_48_PANEL), "utf8");
    panelWired =
      source.includes(SCHEDULED_REPORTS_P2_48_ROOT_TEST_ID) &&
      source.includes(SCHEDULED_REPORTS_P2_48_ENABLED_TEST_ID) &&
      source.includes(SCHEDULED_REPORTS_P2_48_NEXT_SEND_TEST_ID) &&
      source.includes("ScheduledReportsP2_48Panel");
  }

  let reportsPageWired = false;
  if (existsSync(join(root, SCHEDULED_REPORTS_P2_48_REPORTS_PAGE))) {
    const source = readFileSync(join(root, SCHEDULED_REPORTS_P2_48_REPORTS_PAGE), "utf8");
    reportsPageWired =
      source.includes("ScheduledReportsP2_48Panel") &&
      source.includes("loadScheduledReportsPanelModel");
  }

  let cronWired = false;
  if (existsSync(join(root, SCHEDULED_REPORTS_P2_48_CRON_ROUTE))) {
    const source = readFileSync(join(root, SCHEDULED_REPORTS_P2_48_CRON_ROUTE), "utf8");
    cronWired = source.includes("runScheduledReportsWeeklyBatch");
  }

  const window = resolveWeeklyReportWindow(new Date("2026-06-16T12:00:00.000Z"));
  const dedupe = buildScheduledReportDedupeKey("user-1", window.weekKey);
  const goldenWeekWindowOk =
    window.rangeLabel.includes("Jun") &&
    dedupe.startsWith("scheduled-report-p2-48-user-1-");

  const combined = [SCHEDULED_REPORTS_P2_48_DOC, SCHEDULED_REPORTS_P2_48_PANEL]
    .filter((rel) => existsSync(join(root, rel)))
    .map((rel) => readFileSync(join(root, rel), "utf8"))
    .join("\n");

  const honestyMarkersPresent = SCHEDULED_REPORTS_P2_48_HONESTY_MARKERS.every((marker) =>
    combined.toLowerCase().includes(marker.toLowerCase()),
  );

  const vercelWired = existsSync(join(root, "vercel.json"))
    ? readFileSync(join(root, "vercel.json"), "utf8").includes(SCHEDULED_REPORTS_P2_48_CRON_PATH)
    : false;

  const manifestWired = existsSync(join(root, "services/cron/production-manifest.ts"))
    ? readFileSync(join(root, "services/cron/production-manifest.ts"), "utf8").includes(
        SCHEDULED_REPORTS_P2_48_CRON_SLUG,
      )
    : false;

  const passed =
    wiringComplete &&
    docWired &&
    serviceWired &&
    panelWired &&
    reportsPageWired &&
    cronWired &&
    goldenWeekWindowOk &&
    honestyMarkersPresent &&
    vercelWired &&
    manifestWired &&
    SCHEDULED_REPORTS_P2_48_FLOW_STEPS.length === 4 &&
    SCHEDULED_REPORTS_P2_48_CRON_SCHEDULE === "0 7 * * 1";

  return {
    policyId: SCHEDULED_REPORTS_P2_48_POLICY_ID,
    wiringComplete,
    docWired,
    serviceWired,
    panelWired,
    reportsPageWired,
    cronWired,
    goldenWeekWindowOk,
    honestyMarkersPresent,
    passed,
  };
}

export function formatScheduledReportsP2_48AuditLines(
  summary: ScheduledReportsP2_48AuditSummary,
): string[] {
  return [
    `Scheduled reports audit (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"} (${SCHEDULED_REPORTS_P2_48_DOC})`,
    `Service: ${summary.serviceWired ? "wired" : "missing"}`,
    `Panel: ${summary.panelWired ? "wired" : "missing"}`,
    `Reports page: ${summary.reportsPageWired ? "yes" : "no"} (${SCHEDULED_REPORTS_P2_48_REPORTS_ROUTE})`,
    `Cron route: ${summary.cronWired ? "yes" : "no"} (${SCHEDULED_REPORTS_P2_48_CRON_PATH})`,
    `Golden week window: ${summary.goldenWeekWindowOk ? "PASS" : "FAIL"}`,
    `Honesty markers: ${summary.honestyMarkersPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
