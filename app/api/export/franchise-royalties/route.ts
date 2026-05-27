import { NextRequest, NextResponse } from "next/server";

import { requireReportExportActor } from "@/lib/reports/report-export-access";
import { calculateRoyalties, royaltiesToCSV } from "@/services/franchise/franchise-service";

export async function GET(request: NextRequest) {
  const period =
    request.nextUrl.searchParams.get("period") === "quarter" ? "quarter" : "month";

  const access = await requireReportExportActor({
    operation: "export:franchise-royalties",
    metadata: { period },
  });
  if (!access.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await calculateRoyalties(access.actor.dataUserId, period);
  const csv = royaltiesToCSV(data);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=royalties-${period}.csv`,
    },
  });
}
