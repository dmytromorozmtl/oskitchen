import { NextResponse } from "next/server";

import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import {
  buildMarketplaceAnalyticsExportCsv,
  loadMarketplaceAnalytics,
  marketplaceAnalyticsToHtml,
} from "@/services/marketplace/marketplace-analytics-service";

export async function GET(request: Request) {
  const actor = await requireWorkspacePermissionActor();
  if (!actor.workspaceId || !hasPermission(actor.granted, "marketplace:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "csv";

  const model = await loadMarketplaceAnalytics({
    workspaceId: actor.workspaceId,
    dataUserId: actor.dataUserId,
    userId: actor.userId,
  });

  if (format === "pdf" || format === "html") {
    const html = marketplaceAnalyticsToHtml(model);
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": 'inline; filename="marketplace-analytics.html"',
      },
    });
  }

  const csv = buildMarketplaceAnalyticsExportCsv(model);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="marketplace-analytics.csv"',
    },
  });
}
