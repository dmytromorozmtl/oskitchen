import { describe, expect, it } from "vitest";

import { describeReportFormats, type ReportFormat } from "@/lib/reports/report-types";

describe("describeReportFormats", () => {
  it("maps technical keys to operator-friendly labels", () => {
    expect(describeReportFormats(["csv", "browser_print"] as ReportFormat[])).toBe(
      "CSV export · Print in browser",
    );
  });

  it("explains pdf_placeholder honestly", () => {
    expect(describeReportFormats(["pdf_placeholder"] as ReportFormat[])).toContain("roadmap");
  });
});
