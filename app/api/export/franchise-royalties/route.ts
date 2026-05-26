import { NextRequest, NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { calculateRoyalties, royaltiesToCSV } from "@/services/franchise/franchise-service";

export async function GET(request: NextRequest) {
  const { dataUserId } = await requireTenantActor();
  const period =
    request.nextUrl.searchParams.get("period") === "quarter" ? "quarter" : "month";
  const data = await calculateRoyalties(dataUserId, period);
  const csv = royaltiesToCSV(data);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=royalties-${period}.csv`,
    },
  });
}
