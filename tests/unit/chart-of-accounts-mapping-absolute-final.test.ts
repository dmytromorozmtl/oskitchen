import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditChartOfAccountsMappingWiring } from "@/lib/accounting/chart-of-accounts-mapping-audit";
import {
  buildDefaultCoaMappingRows,
  CHART_OF_ACCOUNTS_MAPPING_ABSOLUTE_FINAL_POLICY_ID,
  CHART_OF_ACCOUNTS_MAPPING_CI_SCRIPTS,
  CHART_OF_ACCOUNTS_MAPPING_PNL_LINE_KEYS,
  CHART_OF_ACCOUNTS_MAPPING_ROUTE,
  CHART_OF_ACCOUNTS_MAPPING_UNIT_TEST,
  mergeCoaMappingRows,
  parseCoaMappingConfig,
  resolveGlAccountForPnlLine,
  summarizeCoaMappingCoverage,
} from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";

const ROOT = process.cwd();

describe("Chart of accounts mapping (Absolute Final Task 96)", () => {
  it("locks absolute final policy and /dashboard/accounting/chart-of-accounts route", () => {
    expect(CHART_OF_ACCOUNTS_MAPPING_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "chart-of-accounts-mapping-absolute-final-v1",
    );
    expect(CHART_OF_ACCOUNTS_MAPPING_ROUTE).toBe("/dashboard/accounting/chart-of-accounts");
    expect(CHART_OF_ACCOUNTS_MAPPING_PNL_LINE_KEYS).toHaveLength(8);
  });

  it("builds default mappings from restaurant COA template", () => {
    const defaults = buildDefaultCoaMappingRows();
    expect(defaults).toHaveLength(8);
    expect(defaults.find((r) => r.pnlLineKey === "revenue")?.glAccountCode).toBe("4100");
    expect(defaults.find((r) => r.pnlLineKey === "food_cost")?.glAccountCode).toBe("5100");
  });

  it("parses and merges saved mapping config", () => {
    const parsed = parseCoaMappingConfig({
      version: 1,
      mappings: [
        {
          pnlLineKey: "revenue",
          pnlLineLabel: "Sales",
          glAccountCode: "4100",
          glAccountName: "Food & Beverage Sales",
          externalProvider: "quickbooks",
          externalAccountId: "qb-1",
          externalAccountName: "Sales Income",
        },
      ],
    });
    expect(parsed?.mappings).toHaveLength(1);

    const merged = mergeCoaMappingRows(parsed!.mappings);
    expect(merged).toHaveLength(8);
    const revenue = resolveGlAccountForPnlLine(merged, "revenue");
    expect(revenue?.externalAccountId).toBe("qb-1");
    expect(revenue?.externalAccountName).toBe("Sales Income");
  });

  it("summarizes mapping coverage and QuickBooks links", () => {
    const mappings = buildDefaultCoaMappingRows().map((row, idx) =>
      idx === 0
        ? {
            ...row,
            externalProvider: "quickbooks" as const,
            externalAccountId: "qb-99",
            externalAccountName: "Sales",
          }
        : row,
    );
    const summary = summarizeCoaMappingCoverage(mappings);
    expect(summary.mappedCount).toBe(8);
    expect(summary.quickBooksLinkedCount).toBe(1);
    expect(summary.coveragePercent).toBe(100);
  });

  it("passes wiring audit", () => {
    const audit = auditChartOfAccountsMappingWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of CHART_OF_ACCOUNTS_MAPPING_CI_SCRIPTS) {
      expect(pkg.scripts?.[script], `missing script ${script}`).toBeTruthy();
    }
    expect(CHART_OF_ACCOUNTS_MAPPING_UNIT_TEST).toContain(
      "chart-of-accounts-mapping-absolute-final.test.ts",
    );
  });
});
