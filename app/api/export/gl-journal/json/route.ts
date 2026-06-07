import { NextResponse } from "next/server";

import { JOURNAL_ENTRY_EXPORT_JSON_ROUTE } from "@/lib/accounting/journal-entry-export-absolute-final-policy";
import { requireReportExportActor } from "@/lib/reports/report-export-access";
import { exportJournalEntries } from "@/services/accounting/journal-entry-export-service";
import type { PnlPeriod } from "@/services/accounting/restaurant-pnl-service";

/** GET {JOURNAL_ENTRY_EXPORT_JSON_ROUTE} — structured journal export bundle */

export async function GET(request: Request) {
  const url = new URL(request.url);
  const period = (url.searchParams.get("period") ?? "month") as PnlPeriod;
  const valid: PnlPeriod[] = ["today", "week", "month", "quarter", "year"];
  const p = valid.includes(period) ? period : "month";

  const access = await requireReportExportActor({
    operation: "export:gl-journal-json",
    metadata: { period: p, format: "json" },
  });
  if (!access.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await exportJournalEntries(access.actor.dataUserId, p, "json");

  const route = JOURNAL_ENTRY_EXPORT_JSON_ROUTE;
  void route;

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="gl-journal-${p}.json"`,
    },
  });
}
