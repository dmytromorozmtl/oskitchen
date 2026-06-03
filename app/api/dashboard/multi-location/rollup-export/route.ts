import { NextResponse } from "next/server";

import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { exportMultiLocationRollupCsv } from "@/services/enterprise/multi-location-rollup-service";

export async function GET(request: Request) {
  const { workspaceId, dataUserId } = await getTenantActor();
  if (!workspaceId) {
    return NextResponse.json({ error: "Workspace required" }, { status: 404 });
  }

  const url = new URL(request.url);
  const filters = parseAnalyticsFilters(Object.fromEntries(url.searchParams.entries()));

  try {
    const exported = await exportMultiLocationRollupCsv({
      workspaceId,
      filters,
      basePath: "/dashboard/enterprise/multi-location",
    });

    return new NextResponse(exported.body, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${exported.filename}"`,
        "X-Row-Count": String(exported.rowCount),
        "X-Requested-By": dataUserId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
