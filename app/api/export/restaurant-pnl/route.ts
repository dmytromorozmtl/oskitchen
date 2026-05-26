import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import { canDoReports } from "@/lib/reports/report-permissions";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { resolveTenantDataUserId } from "@/lib/scope/resolve-tenant-data-user-id";
import {
  getRestaurantPnLStatement,
  pnlToCsv,
  type PnlPeriod,
} from "@/services/accounting/restaurant-pnl-service";

export async function GET(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = await resolveTenantDataUserId(sessionUser.id);
  const workspaceId = await resolveOwnerWorkspaceId(userId).catch(() => null);
  const [profile, staffMember] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { id: sessionUser.id },
      select: { role: true, email: true },
    }),
    prisma.staffMember.findFirst({
      where: {
        linkedUserId: sessionUser.id,
        userId,
        active: true,
      },
      select: { roleType: true },
    }),
  ]);
  const scope = createReportActorScope({
    sessionUserId: sessionUser.id,
    userId,
    workspaceId,
    workspaceRole: profile?.role ?? "STAFF",
    staffRoleType: staffMember?.roleType ?? null,
    email: profile?.email ?? sessionUser.email ?? null,
  });
  if (!canDoReports(scope, "reports.read.financial")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const url = new URL(request.url);
  const period = (url.searchParams.get("period") ?? "month") as PnlPeriod;
  const valid: PnlPeriod[] = ["today", "week", "month", "quarter", "year"];
  const p = valid.includes(period) ? period : "month";

  const { lines } = await getRestaurantPnLStatement(userId, p);
  const csv = pnlToCsv(lines);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="restaurant-pnl-${p}.csv"`,
    },
  });
}
