import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditChartOfAccountsMappingWiring } from "@/lib/accounting/chart-of-accounts-mapping-audit";
import {
  buildDefaultCoaMappingRows,
  CHART_OF_ACCOUNTS_MAPPING_ABSOLUTE_FINAL_POLICY_ID,
  CHART_OF_ACCOUNTS_MAPPING_HONESTY_MARKERS,
  CHART_OF_ACCOUNTS_MAPPING_PNL_LINE_KEYS,
  CHART_OF_ACCOUNTS_MAPPING_ROUTE,
  CHART_OF_ACCOUNTS_MAPPING_STORAGE_KEY,
  mergeCoaMappingRows,
  parseCoaMappingConfig,
  resolveGlAccountForPnlLine,
  summarizeCoaMappingCoverage,
} from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";
import {
  CHART_OF_ACCOUNTS_MAPPING_INTEGRATION_TARGETS,
  CHART_OF_ACCOUNTS_MAPPING_PNL_LABELS,
} from "@/lib/accounting/chart-of-accounts-mapping-content";
import { auditQaFullCoverageSlot } from "@/lib/qa/absolute-final-qa-full-coverage-audit";
import {
  getQaFullCoverageSlot,
  QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/qa/absolute-final-qa-full-coverage-policy";

const ROOT = process.cwd();
/** Absolute Final Task 111 — QA full coverage for feature 96 chart of accounts mapping */
const TASK = 111;
const FEATURE = 96;

describe(`QA full coverage — chart of accounts mapping (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks QA registry slot 111 → feature 96 chart of accounts mapping", () => {
    expect(QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-qa-full-coverage-v1");
    const slot = getQaFullCoverageSlot(TASK);
    expect(slot?.featureKey).toBe("chart-of-accounts-mapping");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.baseCertTest).toBe(
      "tests/unit/chart-of-accounts-mapping-absolute-final.test.ts",
    );
    expect(CHART_OF_ACCOUNTS_MAPPING_PNL_LINE_KEYS).toHaveLength(8);
    expect(CHART_OF_ACCOUNTS_MAPPING_ROUTE).toBe("/dashboard/accounting/chart-of-accounts");
    expect(CHART_OF_ACCOUNTS_MAPPING_STORAGE_KEY).toBe("chartOfAccountsMappingV1");
  });

  it("builds default COA rows from restaurant template with standard GL codes", () => {
    const defaults = buildDefaultCoaMappingRows();
    expect(defaults).toHaveLength(8);
    expect(defaults.every((row) => row.externalProvider === null)).toBe(true);
    expect(defaults.find((r) => r.pnlLineKey === "revenue")?.glAccountCode).toBe("4100");
    expect(defaults.find((r) => r.pnlLineKey === "food_cost")?.glAccountCode).toBe("5100");
    expect(defaults.find((r) => r.pnlLineKey === "labor")?.glAccountCode).toBe("5200");
  });

  it("parses saved config, merges with defaults, and resolves QuickBooks links", () => {
    expect(parseCoaMappingConfig(null)).toBeNull();
    expect(parseCoaMappingConfig({ version: 2 })).toBeNull();

    const parsed = parseCoaMappingConfig({
      version: 1,
      mappings: [
        {
          pnlLineKey: "revenue",
          glAccountCode: "4100",
          externalProvider: "quickbooks",
          externalAccountId: "qb-42",
          externalAccountName: "Sales Income",
        },
        { pnlLineKey: "invalid" },
      ],
    });
    expect(parsed?.mappings).toHaveLength(1);

    const merged = mergeCoaMappingRows(parsed!.mappings);
    expect(merged).toHaveLength(8);
    const revenue = resolveGlAccountForPnlLine(merged, "revenue");
    expect(revenue?.externalAccountId).toBe("qb-42");
    expect(revenue?.externalAccountName).toBe("Sales Income");
    expect(resolveGlAccountForPnlLine(merged, "missing")).toBeUndefined();
  });

  it("summarizes mapping coverage and QuickBooks link counts", () => {
    const partial = buildDefaultCoaMappingRows().map((row, idx) =>
      idx === 0
        ? {
            ...row,
            externalProvider: "quickbooks" as const,
            externalAccountId: "qb-1",
            externalAccountName: "Sales",
          }
        : idx === 1
          ? { ...row, glAccountCode: "" }
          : row,
    );
    const summary = summarizeCoaMappingCoverage(partial);
    expect(summary.totalLines).toBe(8);
    expect(summary.mappedCount).toBe(7);
    expect(summary.unmappedCount).toBe(1);
    expect(summary.quickBooksLinkedCount).toBe(1);
    expect(summary.coveragePercent).toBe(88);
  });

  it("documents honesty markers — BETA, not certified GL, accountant review", () => {
    const panel = readFileSync(
      join(ROOT, "components/dashboard/accounting/chart-of-accounts-mapping-panel.tsx"),
      "utf8",
    );
    const page = readFileSync(
      join(ROOT, "app/dashboard/accounting/chart-of-accounts/page.tsx"),
      "utf8",
    );
    const combined = `${panel}\n${page}`;

    for (const marker of CHART_OF_ACCOUNTS_MAPPING_HONESTY_MARKERS) {
      expect(
        combined.includes(marker) || combined.toLowerCase().includes(marker.toLowerCase()),
      ).toBe(true);
    }
  });

  it("wires mapping UI — P&L table, coverage badges, GL-depth link, row forms", () => {
    const panel = readFileSync(
      join(ROOT, "components/dashboard/accounting/chart-of-accounts-mapping-panel.tsx"),
      "utf8",
    );
    const rowForm = readFileSync(
      join(ROOT, "components/dashboard/accounting/chart-of-accounts-mapping-row-form.tsx"),
      "utf8",
    );

    expect(panel).toContain('data-testid="chart-of-accounts-mapping-panel"');
    expect(panel).toContain("ChartOfAccountsMappingRowForm");
    expect(panel).toContain("coveragePercent");
    expect(panel).toContain("quickBooksLinkedCount");
    expect(panel).toContain("GL_DEPTH_ACCOUNTING_ROUTE");
    expect(rowForm).toContain("updateCoaMappingRowAction");
  });

  it("wires page, strip, gl-sync, actions, and integration targets", () => {
    const page = readFileSync(
      join(ROOT, "app/dashboard/accounting/chart-of-accounts/page.tsx"),
      "utf8",
    );
    const strip = readFileSync(
      join(ROOT, "components/dashboard/accounting/chart-of-accounts-mapping-strip.tsx"),
      "utf8",
    );
    const glSync = readFileSync(
      join(ROOT, "app/dashboard/accounting/gl-sync/page.tsx"),
      "utf8",
    );
    const actions = readFileSync(
      join(ROOT, "actions/accounting/chart-of-accounts-mapping.ts"),
      "utf8",
    );
    const service = readFileSync(
      join(ROOT, "services/accounting/chart-of-accounts-mapping-service.ts"),
      "utf8",
    );

    expect(page).toContain("loadChartOfAccountsMappingModel");
    expect(page).toContain("reports.read.financial");
    expect(strip).toContain("CHART_OF_ACCOUNTS_MAPPING_ROUTE");
    expect(glSync).toContain("ChartOfAccountsMappingStrip");
    expect(actions).toContain("revalidatePath");
    expect(actions).toContain("updateCoaMappingRow");
    expect(service).toContain("fetchQuickBooksChartOfAccounts");
    expect(CHART_OF_ACCOUNTS_MAPPING_INTEGRATION_TARGETS.some((t) => t.id === "quickbooks")).toBe(
      true,
    );
    expect(CHART_OF_ACCOUNTS_MAPPING_PNL_LABELS.revenue).toBe("Food & beverage sales");
  });

  it("passes base wiring audit and QA slot 111 audit gate", () => {
    const wiring = auditChartOfAccountsMappingWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);

    const qa = auditQaFullCoverageSlot(TASK, ROOT);
    expect(qa.ok, qa.failures.join("; ")).toBe(true);
    expect(qa.slot?.qaTest).toBe(
      "tests/unit/absolute-final-qa-full-coverage-11-coa-mapping.test.ts",
    );
    expect(CHART_OF_ACCOUNTS_MAPPING_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "chart-of-accounts-mapping-absolute-final-v1",
    );
  });
});
