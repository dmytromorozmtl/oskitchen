import { NextResponse } from "next/server";

import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import {
  buildPlatformMarketplaceAnalyticsExportCsv,
  loadPlatformMarketplaceAnalytics,
} from "@/services/marketplace/platform-marketplace-analytics-service";

export async function GET() {
  try {
    const ctx = await requirePlatformAccess();
    assertPlatformPermission(ctx, "platform:organizations:read");

    const model = await loadPlatformMarketplaceAnalytics();
    const csv = buildPlatformMarketplaceAnalyticsExportCsv(model);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="marketplace-platform-analytics.csv"',
      },
    });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
