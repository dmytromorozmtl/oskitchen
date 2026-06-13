import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditScheduledReportsP2_48,
  formatScheduledReportsP2_48AuditLines,
} from "@/lib/analytics/scheduled-reports-p2-48-audit";
import {
  buildScheduledReportDedupeKey,
  formatScheduledReportEmail,
  resolveNextWeeklySendLabel,
  resolveWeeklyReportWindow,
} from "@/lib/analytics/scheduled-reports-p2-48-measurement";
import {
  SCHEDULED_REPORTS_P2_48_AUDIT_SCRIPT,
  SCHEDULED_REPORTS_P2_48_CHECK_NPM_SCRIPT,
  SCHEDULED_REPORTS_P2_48_CI_WORKFLOW,
  SCHEDULED_REPORTS_P2_48_CRON_SCHEDULE,
  SCHEDULED_REPORTS_P2_48_DOC,
  SCHEDULED_REPORTS_P2_48_FLOW_STEPS,
  SCHEDULED_REPORTS_P2_48_NPM_SCRIPT,
  SCHEDULED_REPORTS_P2_48_POLICY_ID,
  SCHEDULED_REPORTS_P2_48_REPORTS_ROUTE,
  SCHEDULED_REPORTS_P2_48_UNIT_TEST,
} from "@/lib/analytics/scheduled-reports-p2-48-policy";

const ROOT = process.cwd();

describe("Scheduled reports (P2-48)", () => {
  it("locks policy id and Lightspeed flow steps", () => {
    expect(SCHEDULED_REPORTS_P2_48_POLICY_ID).toBe("scheduled-reports-p2-48-v1");
    expect(SCHEDULED_REPORTS_P2_48_REPORTS_ROUTE).toBe("/dashboard/reports");
    expect(SCHEDULED_REPORTS_P2_48_CRON_SCHEDULE).toBe("0 7 * * 1");
    expect(SCHEDULED_REPORTS_P2_48_FLOW_STEPS).toEqual([
      "resolve_weekly_window",
      "run_executive_summary",
      "generate_pdf_attachment",
      "email_weekly_digest",
    ]);
  });

  it("computes weekly window and email copy", () => {
    const window = resolveWeeklyReportWindow(new Date("2026-06-16T12:00:00.000Z"));
    expect(window.rangeLabel).toContain("Jun");
    expect(buildScheduledReportDedupeKey("u1", window.weekKey)).toContain("scheduled-report-p2-48");

    const email = formatScheduledReportEmail({
      businessName: "Demo Kitchen",
      rangeLabel: window.rangeLabel,
      summaryLines: ["- Net revenue: $1,200"],
      reportsUrl: "https://app.oskitchen.com/dashboard/reports",
    });
    expect(email.subject).toContain("Weekly report");
    expect(email.text).toContain("PDF");

    expect(resolveNextWeeklySendLabel(new Date("2026-06-16T12:00:00.000Z"))).toContain("Jun");
  });

  it("passes full scheduled reports audit", () => {
    const summary = auditScheduledReportsP2_48(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.panelWired).toBe(true);
    expect(summary.reportsPageWired).toBe(true);
    expect(summary.cronWired).toBe(true);
    expect(summary.goldenWeekWindowOk).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatScheduledReportsP2_48AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, SCHEDULED_REPORTS_P2_48_DOC))).toBe(true);
    expect(existsSync(join(ROOT, SCHEDULED_REPORTS_P2_48_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, SCHEDULED_REPORTS_P2_48_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[SCHEDULED_REPORTS_P2_48_NPM_SCRIPT]).toContain(
      "audit-scheduled-reports-p2-48.ts",
    );
    expect(pkg.scripts?.[SCHEDULED_REPORTS_P2_48_CHECK_NPM_SCRIPT]).toContain(
      SCHEDULED_REPORTS_P2_48_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, SCHEDULED_REPORTS_P2_48_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("scheduled-reports-p2-48");
  });
});
