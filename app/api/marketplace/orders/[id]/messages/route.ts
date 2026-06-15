import { NextResponse } from "next/server";

import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { resolveVendorCabinetAccess } from "@/lib/marketplace/vendor-page-access";
import {
  assertBuyerOrderChatAccess,
  assertVendorOrderChatAccess,
  loadOrderChatMessages,
  type VendorChatPerspective,
} from "@/services/marketplace/vendor-messaging-service";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: orderId } = await context.params;
  const url = new URL(request.url);
  const perspective = (url.searchParams.get("perspective") ?? "buyer") as VendorChatPerspective;

  if (perspective === "vendor") {
    const access = await resolveVendorCabinetAccess();
    if (!access.ok) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const gate = await assertVendorOrderChatAccess({ vendorId: access.vendorId, orderId });
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: 404 });

    const messages = await loadOrderChatMessages({
      orderId,
      perspective: "vendor",
      readerId: access.actor.sessionUserId,
    });
    return NextResponse.json({ messages });
  }

  const actor = await requireWorkspacePermissionActor();
  if (!actor.workspaceId || !hasPermission(actor.granted, "marketplace:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const gate = await assertBuyerOrderChatAccess({ workspaceId: actor.workspaceId, orderId });
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: 404 });

  const messages = await loadOrderChatMessages({
    orderId,
    perspective: "buyer",
    readerId: actor.sessionUserId,
  });

  return NextResponse.json({ messages });
}
