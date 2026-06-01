import { NextResponse } from "next/server";

import { hasPermission } from "@/lib/permissions/guards";
import { resolveVendorCabinetAccess } from "@/lib/marketplace/vendor-page-access";
import {
  buildVendorPackingSlipHtml,
  loadVendorOrderDetail,
} from "@/services/marketplace/vendor-orders-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const access = await resolveVendorCabinetAccess();

  if (!access.ok) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const canRead =
    hasPermission(access.actor.granted, "vendor:orders:read") ||
    (access.actor.workspaceRole === "OWNER" &&
      hasPermission(access.actor.granted, "marketplace:read"));

  if (!canRead) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const order = await loadVendorOrderDetail(access.vendorId, id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const html = buildVendorPackingSlipHtml(order, access.vendorName);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="packing-slip-${order.poNumber ?? order.id}.html"`,
    },
  });
}
