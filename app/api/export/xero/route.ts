import { NextRequest, NextResponse } from "next/server";

import { requireReportExportActor } from "@/lib/reports/report-export-access";
import {
  exportXeroData,
  salesSummaryToXeroCsv,
  salesSummaryToXeroJournalCsv,
  xeroInvoicesToCsv,
  xeroPnlToCsv,
  xeroPnlToJournalCsv,
} from "@/services/integrations/xero-service";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") ?? "pnl";
  const period =
    request.nextUrl.searchParams.get("period") === "quarter" ? "quarter" : "month";

  const access = await requireReportExportActor({
    operation: "export:xero",
    metadata: { type, period },
  });
  if (!access.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await exportXeroData(access.actor.dataUserId, period);

  if (type === "invoices") {
    const csv = xeroInvoicesToCsv(data.invoices);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=xero-bills-${data.period}.csv`,
      },
    });
  }

  if (type === "sales") {
    const format = request.nextUrl.searchParams.get("format") ?? "journal";
    if (format === "csv") {
      const csv = salesSummaryToXeroCsv(data.sales);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=xero-sales-${data.period}.csv`,
        },
      });
    }
    const journal = salesSummaryToXeroJournalCsv(data.sales, { date: data.periodEnd });
    return new NextResponse(journal, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=xero-sales-journal-${data.period}.csv`,
      },
    });
  }

  if (type === "pnl-csv") {
    const csv = xeroPnlToCsv(data.lines);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=xero-pnl-report-${data.period}.csv`,
      },
    });
  }

  const journal = xeroPnlToJournalCsv(data.lines, { periodEnd: data.periodEnd });
  return new NextResponse(journal, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=xero-pnl-journal-${data.period}.csv`,
    },
  });
}
