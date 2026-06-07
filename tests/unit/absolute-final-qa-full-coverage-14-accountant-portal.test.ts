import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditAccountantPortalWiring } from "@/lib/accounting/accountant-portal-audit";
import {
  ACCOUNTANT_PORTAL_ABSOLUTE_FINAL_POLICY_ID,
  ACCOUNTANT_PORTAL_HONESTY_MARKERS,
  ACCOUNTANT_PORTAL_PILLARS,
  ACCOUNTANT_PORTAL_ROUTE,
  buildAccountantPortalDeliverables,
  summarizeAccountantPortal,
} from "@/lib/accounting/accountant-portal-absolute-final-policy";
import { ACCOUNTANT_PORTAL_ONBOARDING } from "@/lib/accounting/accountant-portal-content";
import { auditQaFullCoverageSlot } from "@/lib/qa/absolute-final-qa-full-coverage-audit";
import {
  getQaFullCoverageSlot,
  QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/qa/absolute-final-qa-full-coverage-policy";

const ROOT = process.cwd();
/** Absolute Final Task 114 — QA full coverage for feature 99 accountant portal */
const TASK = 114;
const FEATURE = 99;

describe(`QA full coverage — accountant portal (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks QA registry slot 114 → feature 99 accountant portal", () => {
    expect(QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-qa-full-coverage-v1");
    const slot = getQaFullCoverageSlot(TASK);
    expect(slot?.featureKey).toBe("accountant-portal");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.baseCertTest).toBe("tests/unit/accountant-portal-absolute-final.test.ts");
    expect(ACCOUNTANT_PORTAL_PILLARS).toHaveLength(5);
    expect(ACCOUNTANT_PORTAL_ROUTE).toBe("/dashboard/accounting/accountant-portal");
    expect(ACCOUNTANT_PORTAL_ONBOARDING.checklist.length).toBeGreaterThanOrEqual(5);
  });

  it("builds deliverables across all five pillars with export routes", () => {
    const deliverables = buildAccountantPortalDeliverables({
      coaCoveragePercent: 100,
      reconciliationPercent: 100,
      materialVarianceCount: 0,
      journalEntryCount: 5,
      quickBooksConnected: true,
      balanced: true,
    });
    expect(deliverables.length).toBeGreaterThanOrEqual(7);
    for (const pillar of ACCOUNTANT_PORTAL_PILLARS) {
      expect(deliverables.some((d) => d.pillar === pillar)).toBe(true);
    }
    const journal = deliverables.find((d) => d.id === "journal_export");
    expect(journal?.exportRoute).toBe("/api/export/gl-journal");
    expect(journal?.maturity).toBe("LIVE");
  });

  it("summarizes period-close readiness when COA, reconciliation, and journals align", () => {
    const deliverables = buildAccountantPortalDeliverables({
      coaCoveragePercent: 100,
      reconciliationPercent: 100,
      materialVarianceCount: 0,
      journalEntryCount: 5,
      quickBooksConnected: true,
      balanced: true,
    });
    const summary = summarizeAccountantPortal(deliverables, {
      coaCoveragePercent: 100,
      reconciliationPercent: 100,
      materialVarianceCount: 0,
      journalEntryCount: 5,
      quickBooksConnected: true,
      canExport: true,
    });
    expect(summary.periodCloseReady).toBe(true);
    expect(summary.liveCount).toBeGreaterThan(0);
    expect(summary.canExport).toBe(true);
  });

  it("flags period-close not ready when material variances or missing journals", () => {
    const deliverables = buildAccountantPortalDeliverables({
      coaCoveragePercent: 80,
      reconciliationPercent: 60,
      materialVarianceCount: 2,
      journalEntryCount: 0,
      quickBooksConnected: false,
      balanced: false,
    });
    const summary = summarizeAccountantPortal(deliverables, {
      coaCoveragePercent: 80,
      reconciliationPercent: 60,
      materialVarianceCount: 2,
      journalEntryCount: 0,
      quickBooksConnected: false,
      canExport: false,
    });
    expect(summary.periodCloseReady).toBe(false);
    expect(deliverables.find((d) => d.id === "journal_export")?.maturity).toBe("SKIPPED");
    expect(deliverables.find((d) => d.id === "quickbooks")?.maturity).toBe("SKIPPED");
  });

  it("documents honesty markers — BETA, read-only, not certified GL", () => {
    const panel = readFileSync(
      join(ROOT, "components/dashboard/accounting/accountant-portal-panel.tsx"),
      "utf8",
    );
    const page = readFileSync(
      join(ROOT, "app/dashboard/accounting/accountant-portal/page.tsx"),
      "utf8",
    );
    const combined = `${panel}\n${page}`;

    for (const marker of ACCOUNTANT_PORTAL_HONESTY_MARKERS) {
      expect(
        combined.includes(marker) || combined.toLowerCase().includes(marker.toLowerCase()),
      ).toBe(true);
    }
  });

  it("wires portal UI — pillar grid, deliverables, period-close checklist, export bundle", () => {
    const panel = readFileSync(
      join(ROOT, "components/dashboard/accounting/accountant-portal-panel.tsx"),
      "utf8",
    );

    expect(panel).toContain('data-testid="accountant-portal-panel"');
    expect(panel).toContain('data-testid="accountant-portal-pillar"');
    expect(panel).toContain('data-testid="accountant-portal-deliverable"');
    expect(panel).toContain("ACCOUNTANT_PORTAL_ONBOARDING");
    expect(panel).toContain("periodCloseReady");
    expect(panel).toContain("Quick export bundle");
    expect(panel).toContain("/api/export/gl-journal");
    expect(panel).toContain("/api/export/pnl-reconciliation");
    for (const pillar of ACCOUNTANT_PORTAL_PILLARS) {
      expect(panel).toContain(pillar);
    }
  });

  it("wires page, strip, gl-sync, and service aggregation", () => {
    const page = readFileSync(
      join(ROOT, "app/dashboard/accounting/accountant-portal/page.tsx"),
      "utf8",
    );
    const strip = readFileSync(
      join(ROOT, "components/dashboard/accounting/accountant-portal-strip.tsx"),
      "utf8",
    );
    const glSync = readFileSync(
      join(ROOT, "app/dashboard/accounting/gl-sync/page.tsx"),
      "utf8",
    );
    const service = readFileSync(
      join(ROOT, "services/accounting/accountant-portal-service.ts"),
      "utf8",
    );

    expect(page).toContain("loadAccountantPortalModel");
    expect(page).toContain("canExportReports");
    expect(page).toContain("reports.read.financial");
    expect(strip).toContain("ACCOUNTANT_PORTAL_ROUTE");
    expect(glSync).toContain("AccountantPortalStrip");
    expect(service).toContain("loadGlDepthAccountingModel");
    expect(service).toContain("loadPnlReconciliationViewModel");
    expect(service).toContain("getQuickBooksCredentialsForUser");
    expect(service).toContain("buildAccountantPortalDeliverables");
  });

  it("passes base wiring audit and QA slot 114 audit gate", () => {
    const wiring = auditAccountantPortalWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);

    const qa = auditQaFullCoverageSlot(TASK, ROOT);
    expect(qa.ok, qa.failures.join("; ")).toBe(true);
    expect(qa.slot?.qaTest).toBe(
      "tests/unit/absolute-final-qa-full-coverage-14-accountant-portal.test.ts",
    );
    expect(ACCOUNTANT_PORTAL_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "accountant-portal-absolute-final-v1",
    );
  });
});
