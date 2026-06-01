import { NextResponse } from "next/server";

import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { hasPermission } from "@/lib/permissions/guards";
import {
  buildMarketplaceInvoiceHtml,
  loadMarketplaceOrderDetail,
} from "@/services/marketplace/marketplace-orders-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const actor = await requireWorkspacePermissionActor();

  if (!actor.workspaceId || !hasPermission(actor.granted, "marketplace:orders:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const order = await loadMarketplaceOrderDetail(actor.workspaceId, id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const html = buildMarketplaceInvoiceHtml(order);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="marketplace-po-${order.poNumber ?? order.id}.html"`,
    },
  });
}
