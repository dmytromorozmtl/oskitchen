import { NextRequest, NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { generatePayrollExport, payrollToCSV } from "@/services/labor/payroll-service";

export async function GET(request: NextRequest) {
  const { dataUserId } = await requireTenantActor();
  const { searchParams } = new URL(request.url);
  const start =
    searchParams.get("start") ??
    new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10);
  const end = searchParams.get("end") ?? new Date().toISOString().slice(0, 10);

  const payroll = await generatePayrollExport(
    dataUserId,
    new Date(start),
    new Date(end),
  );
  const csv = payrollToCSV(payroll);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=payroll-${start}-to-${end}.csv`,
    },
  });
}
