import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { parseReportFilters, serialiseReportFilters } from "@/lib/reports/report-filters";
import { createReportActorScope } from "@/lib/reports/report-actor-scope";
import { requireReportExportActor } from "@/lib/reports/report-export-access";
import { getReportDefinition, isReportKey } from "@/lib/reports/report-registry";
import { logReportPermissionDenied } from "@/services/reports/report-permission-audit";
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

  const access = await requireReportExportActor({ reportKey: key });
  if (!access.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const actor = access.actor;
  const scope = createReportActorScope(actor);
  const userId = actor.dataUserId;

  const filters = parseReportFilters(Object.fromEntries(url.searchParams.entries()));
  const result = await runReport(key, { userId, scope, filters });
  if (result.status === "permission_denied") {
    void logReportPermissionDenied(actor, {
      requiredPermission: getReportDefinition(key).requiredPermission,
      reportKey: key,
      operation: "report:export_read_denied",
    });
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
