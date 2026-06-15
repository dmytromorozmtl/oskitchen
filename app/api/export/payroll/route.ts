import { NextRequest, NextResponse } from "next/server";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { logExportPermissionDenied } from "@/services/export/export-permission-audit";
import { generatePayrollExport, payrollToCSV } from "@/services/labor/payroll-service";

export async function GET(request: NextRequest) {
  const access = await requireMutationPermission("payroll.view");
  if (!access.ok) {
    await logExportPermissionDenied(access.actor, {
      requiredPermission: "payroll.view",
      exportType: "reports",
      operation: "export:payroll",
    });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const start =
    searchParams.get("start") ??
    new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10);
  const end = searchParams.get("end") ?? new Date().toISOString().slice(0, 10);

  const payroll = await generatePayrollExport(
    access.actor.dataUserId,
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
