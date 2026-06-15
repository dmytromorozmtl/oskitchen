import { NextResponse } from "next/server";

import { hasPermission } from "@/lib/permissions/guards";
import { resolveVendorCabinetAccess } from "@/lib/marketplace/vendor-page-access";
import {
  buildVendorAnalyticsExportCsv,
  loadVendorAnalytics,
} from "@/services/marketplace/vendor-analytics-service";

export async function GET() {
  const access = await resolveVendorCabinetAccess();

  if (!access.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const canRead =
    hasPermission(access.actor.granted, "vendor:analytics:read") ||
    hasPermission(access.actor.granted, "vendor:cabinet:access") ||
    (access.actor.workspaceRole === "OWNER" &&
      hasPermission(access.actor.granted, "marketplace:read"));

  if (!canRead) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const model = await loadVendorAnalytics(access.vendorId);
  const csv = buildVendorAnalyticsExportCsv(model);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="vendor-analytics.csv"',
    },
  });
}
