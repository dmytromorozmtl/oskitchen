import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditAccountantPortalWiring } from "@/lib/accounting/accountant-portal-audit";
import {
  ACCOUNTANT_PORTAL_ABSOLUTE_FINAL_POLICY_ID,
  ACCOUNTANT_PORTAL_CI_SCRIPTS,
  ACCOUNTANT_PORTAL_PILLARS,
  ACCOUNTANT_PORTAL_ROUTE,
  ACCOUNTANT_PORTAL_UNIT_TEST,
  buildAccountantPortalDeliverables,
  summarizeAccountantPortal,
} from "@/lib/accounting/accountant-portal-absolute-final-policy";

const ROOT = process.cwd();

describe("Accountant portal (Absolute Final Task 99)", () => {
  it("locks absolute final policy and /dashboard/accounting/accountant-portal route", () => {
    expect(ACCOUNTANT_PORTAL_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "accountant-portal-absolute-final-v1",
    );
    expect(ACCOUNTANT_PORTAL_ROUTE).toBe("/dashboard/accounting/accountant-portal");
    expect(ACCOUNTANT_PORTAL_PILLARS).toHaveLength(5);
  });

  it("builds deliverables and summarizes period-close readiness", () => {
    const deliverables = buildAccountantPortalDeliverables({
      coaCoveragePercent: 100,
      reconciliationPercent: 100,
      materialVarianceCount: 0,
      journalEntryCount: 5,
      quickBooksConnected: true,
      balanced: true,
    });
    expect(deliverables.length).toBeGreaterThanOrEqual(6);
    expect(deliverables.some((d) => d.id === "journal_export")).toBe(true);

    const summary = summarizeAccountantPortal(deliverables, {
      coaCoveragePercent: 100,
      reconciliationPercent: 100,
      materialVarianceCount: 0,
      journalEntryCount: 5,
      quickBooksConnected: true,
      canExport: true,
    });
    expect(summary.periodCloseReady).toBe(true);
    expect(summary.quickBooksConnected).toBe(true);
  });

  it("flags period-close not ready when material variances exist", () => {
    const deliverables = buildAccountantPortalDeliverables({
      coaCoveragePercent: 80,
      reconciliationPercent: 60,
      materialVarianceCount: 2,
      journalEntryCount: 3,
      quickBooksConnected: false,
      balanced: false,
    });
    const summary = summarizeAccountantPortal(deliverables, {
      coaCoveragePercent: 80,
      reconciliationPercent: 60,
      materialVarianceCount: 2,
      journalEntryCount: 3,
      quickBooksConnected: false,
      canExport: false,
    });
    expect(summary.periodCloseReady).toBe(false);
  });

  it("passes wiring audit", () => {
    const audit = auditAccountantPortalWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of ACCOUNTANT_PORTAL_CI_SCRIPTS) {
      expect(pkg.scripts?.[script], `missing script ${script}`).toBeTruthy();
    }
    expect(ACCOUNTANT_PORTAL_UNIT_TEST).toContain("accountant-portal-absolute-final.test.ts");
  });
});
