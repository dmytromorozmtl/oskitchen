import { NextRequest, NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  exportXeroData,
  xeroInvoicesToCsv,
  xeroPnlToCsv,
} from "@/services/integrations/xero-service";

export async function GET(request: NextRequest) {
  const { dataUserId } = await requireTenantActor();
  const type = request.nextUrl.searchParams.get("type") ?? "pnl";
  const period =
    request.nextUrl.searchParams.get("period") === "quarter" ? "quarter" : "month";

  const data = await exportXeroData(dataUserId, period);

  if (type === "invoices") {
    const csv = xeroInvoicesToCsv(data.invoices);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=xero-invoices.csv",
      },
    });
  }

  const csv = xeroPnlToCsv(data.lines);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=xero-pnl.csv",
    },
  });
}
