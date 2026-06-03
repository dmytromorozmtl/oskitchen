import { NextRequest, NextResponse } from "next/server";

import { requireReportExportActor } from "@/lib/reports/report-export-access";
import {
  exportQuickBooksData,
  quickBooksInvoicesToCsv,
  quickBooksPnlToCsv,
  quickBooksPnlToIif,
  salesSummaryToCsv,
  salesSummaryToQuickBooksIif,
} from "@/services/integrations/quickbooks-service";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") ?? "pnl";
  const period =
    request.nextUrl.searchParams.get("period") === "quarter" ? "quarter" : "month";

  const access = await requireReportExportActor({
    operation: "export:quickbooks",
    metadata: { type, period },
  });
  if (!access.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await exportQuickBooksData(access.actor.dataUserId, period);

  if (type === "invoices") {
    const csv = quickBooksInvoicesToCsv(
      data.invoices.map((i) => ({
        invoiceNumber: i.invoiceNumber,
        invoiceDate: i.invoiceDate,
        totalAmount: i.totalAmount,
        status: i.status,
        supplierName: i.supplier.name,
      })),
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=quickbooks-invoices-${data.period}.csv`,
      },
    });
  }

  if (type === "sales") {
    const format = request.nextUrl.searchParams.get("format") ?? "iif";
    if (format === "csv") {
      const csv = salesSummaryToCsv(data.sales);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=quickbooks-sales-${data.period}.csv`,
        },
      });
    }
    const iif = salesSummaryToQuickBooksIif(data.sales, { date: data.periodEnd });
    return new NextResponse(iif, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `attachment; filename=quickbooks-sales-${data.period}.iif`,
      },
    });
  }

  if (type === "pnl-csv") {
    const csv = quickBooksPnlToCsv(data.lines);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=quickbooks-pnl-${data.period}.csv`,
      },
    });
  }

  const iif = quickBooksPnlToIif(data.lines, { periodEnd: data.periodEnd });
  return new NextResponse(iif, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename=quickbooks-pnl-${data.period}.iif`,
    },
  });
}
