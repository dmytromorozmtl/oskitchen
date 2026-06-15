import { NextResponse } from "next/server";

import { isShopifyMarketsB2bArDashboardEnabled } from "@/lib/commercial/shopify-market-b2b-ar-dashboard";
import { b2bArDashboardRowsToCsv } from "@/lib/integrations/shopify-b2b-ar-dashboard-metadata";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  buildB2bArDashboardSnapshotForOwner,
  recordB2bArDashboardCsvExport,
} from "@/services/integrations/shopify-b2b-ar-dashboard-service";

export const runtime = "nodejs";

export async function GET() {
  if (!isShopifyMarketsB2bArDashboardEnabled()) {
    return NextResponse.json({ error: "B2B AR dashboard disabled." }, { status: 404 });
  }

  const { dataUserId } = await requireTenantActor();
  const snapshot = await buildB2bArDashboardSnapshotForOwner({
    userId: dataUserId,
    recordView: false,
  });
  if (!snapshot) {
    return NextResponse.json({ error: "No receivables snapshot available." }, { status: 404 });
  }

  const csv = b2bArDashboardRowsToCsv(snapshot.rows);
  await recordB2bArDashboardCsvExport(dataUserId);

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="b2b-receivables-${stamp}.csv"`,
    },
  });
}
