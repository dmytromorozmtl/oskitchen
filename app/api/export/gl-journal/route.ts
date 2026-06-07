import { NextResponse } from "next/server";

import { requireReportExportActor } from "@/lib/reports/report-export-access";
import { exportJournalEntries } from "@/services/accounting/journal-entry-export-service";
import type { PnlPeriod } from "@/services/accounting/restaurant-pnl-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const period = (url.searchParams.get("period") ?? "month") as PnlPeriod;
  const format = url.searchParams.get("format") ?? "csv";
  const valid: PnlPeriod[] = ["today", "week", "month", "quarter", "year"];
  const p = valid.includes(period) ? period : "month";

  const access = await requireReportExportActor({
    operation: "export:gl-journal",
    metadata: { period: p, format },
  });
  if (!access.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const exportFormat =
    format === "quickbooks_csv" ? "quickbooks_csv" : format === "json" ? "json" : "csv";
  const body = await exportJournalEntries(access.actor.dataUserId, p, exportFormat);

  const isJson = exportFormat === "json";
  const filename =
    exportFormat === "quickbooks_csv"
      ? `gl-journal-qb-${p}.csv`
      : isJson
        ? `gl-journal-${p}.json`
        : `gl-journal-${p}.csv`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": isJson ? "application/json; charset=utf-8" : "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
