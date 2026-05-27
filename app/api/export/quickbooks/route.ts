import { NextRequest, NextResponse } from "next/server";

import { requireReportExportActor } from "@/lib/reports/report-export-access";
import {
  exportQuickBooksData,
  quickBooksInvoicesToCsv,
  quickBooksPnlToIif,
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
    const csv = quickBooksInvoicesToCsv(data.invoices);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=quickbooks-invoices.csv",
      },
    });
  }

  const iif = quickBooksPnlToIif(data.lines);
  return new NextResponse(iif, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": "attachment; filename=quickbooks-pnl.iif",
    },
  });
}
