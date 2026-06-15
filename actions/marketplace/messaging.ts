"use server";

import { revalidatePath } from "next/cache";

import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { resolveVendorCabinetAccess } from "@/lib/marketplace/vendor-page-access";
import {
  assertBuyerOrderChatAccess,
  assertVendorOrderChatAccess,
  sendOrderChatMessage,
  type VendorChatPerspective,
} from "@/services/marketplace/vendor-messaging-service";

export async function sendVendorChatMessageAction(input: {
  orderId: string;
  perspective: VendorChatPerspective;
  message: string;
  attachments?: string[];
}) {
  if (input.perspective === "buyer") {
    const actor = await requireWorkspacePermissionActor();
    if (!actor.workspaceId) return { ok: false as const, error: "Workspace required." };
    if (!hasPermission(actor.granted, "marketplace:read")) {
      return { ok: false as const, error: "You do not have permission to send messages." };
    }
    const access = await assertBuyerOrderChatAccess({
      workspaceId: actor.workspaceId,
      orderId: input.orderId,
    });
    if (!access.ok) return access;

    const result = await sendOrderChatMessage({
      orderId: input.orderId,
      perspective: "buyer",
      senderId: actor.sessionUserId,
      message: input.message,
      attachments: input.attachments,
    });

    if (result.ok) {
      revalidatePath(`/dashboard/marketplace/orders/${input.orderId}`);
      revalidatePath(`/vendor/orders/${input.orderId}`);
    }
    return result;
  }

  const access = await resolveVendorCabinetAccess();
  if (!access.ok) return { ok: false as const, error: "Access denied." };
  const gate = await assertVendorOrderChatAccess({
    vendorId: access.vendorId,
    orderId: input.orderId,
  });
  if (!gate.ok) return gate;

  const result = await sendOrderChatMessage({
    orderId: input.orderId,
    perspective: "vendor",
    senderId: access.actor.sessionUserId,
    message: input.message,
    attachments: input.attachments,
  });

  if (result.ok) {
    revalidatePath(`/vendor/orders/${input.orderId}`);
    revalidatePath(`/dashboard/marketplace/orders/${input.orderId}`);
  }
  return result;
}
