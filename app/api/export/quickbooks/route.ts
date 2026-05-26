import { NextRequest, NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  exportQuickBooksData,
  quickBooksInvoicesToCsv,
  quickBooksPnlToIif,
} from "@/services/integrations/quickbooks-service";

export async function GET(request: NextRequest) {
  const { dataUserId } = await requireTenantActor();
  const type = request.nextUrl.searchParams.get("type") ?? "pnl";
  const period =
    request.nextUrl.searchParams.get("period") === "quarter" ? "quarter" : "month";

  const data = await exportQuickBooksData(dataUserId, period);

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
