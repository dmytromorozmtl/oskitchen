import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseReportFilters, serialiseReportFilters } from "@/lib/reports/report-filters";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import { canDoReports } from "@/lib/reports/report-permissions";
import { isReportKey } from "@/lib/reports/report-registry";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { resolveTenantDataUserId } from "@/lib/scope/resolve-tenant-data-user-id";
import {
  buildReportCsv,
  recordReportExport,
  runReport,
} from "@/services/reports/report-service";

/**
 * Filtered Reports Center export endpoint. The legacy `/api/export`
 * route is untouched — this route additionally supports per-report
 * filters defined in `lib/reports/report-filters.ts`.
 *
 * Example: `/api/export/report?key=revenue_report&from=2026-05-01&to=2026-05-08`
 */
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!key || !isReportKey(key)) {
    return NextResponse.json({ error: "Invalid report key" }, { status: 400 });
  }

  const userId = await resolveTenantDataUserId(user.id);
  const workspaceId = await resolveOwnerWorkspaceId(userId).catch(() => null);
  const [profile, staffMember] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { id: user.id },
      select: { role: true, email: true },
    }),
    prisma.staffMember.findFirst({
      where: {
        linkedUserId: user.id,
        userId,
        active: true,
      },
      select: { roleType: true },
    }),
  ]);
  const scope = createReportActorScope({
    sessionUserId: user.id,
    userId,
    workspaceId,
    workspaceRole: profile?.role ?? "STAFF",
    staffRoleType: staffMember?.roleType ?? null,
    email: profile?.email ?? user.email ?? null,
  });
  if (!canDoReports(scope, "reports.export")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const filters = parseReportFilters(Object.fromEntries(url.searchParams.entries()));
  const result = await runReport(key, { userId, scope, filters });
  if (result.status === "permission_denied") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const csv = buildReportCsv(result);
  await recordReportExport({
    userId,
    reportKey: key,
    filename: csv.filename,
    rowCount: csv.rowCount,
    filtersJson: Object.fromEntries(serialiseReportFilters(filters)),
  }).catch(() => {
    /* CSV still ships if audit row fails. */
  });

  return new NextResponse(csv.body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${csv.filename}"`,
    },
  });
}
