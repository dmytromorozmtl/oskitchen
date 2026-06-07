import { NextResponse } from "next/server";

import { requireReportExportActor } from "@/lib/reports/report-export-access";
import { exportPnlReconciliationCsv } from "@/services/accounting/pnl-reconciliation-view-service";
import type { PnlPeriod } from "@/services/accounting/restaurant-pnl-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const period = (url.searchParams.get("period") ?? "month") as PnlPeriod;
  const valid: PnlPeriod[] = ["today", "week", "month", "quarter", "year"];
  const p = valid.includes(period) ? period : "month";

  const access = await requireReportExportActor({
    operation: "export:pnl-reconciliation",
    metadata: { period: p },
  });
  if (!access.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const csv = await exportPnlReconciliationCsv(access.actor.dataUserId, p);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pnl-reconciliation-${p}.csv"`,
    },
  });
}
