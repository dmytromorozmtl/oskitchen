"use server";

import { revalidatePath } from "next/cache";

import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { hasPermission } from "@/lib/permissions/guards";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/services/audit/audit-service";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";

export async function sendMarketplaceVendorMessageAction(input: {
  vendorId: string;
  productSlug: string;
  message: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const actor = await requireWorkspacePermissionActor();
  if (!actor.workspaceId) {
    return { ok: false, error: "Workspace required" };
  }
  if (!hasPermission(actor.granted, "marketplace:read")) {
    return { ok: false, error: "You do not have permission to contact vendors." };
  }

  const trimmed = input.message.trim();
  if (!trimmed) {
    return { ok: false, error: "Message cannot be empty." };
  }

  await prisma.vendorMessage.create({
    data: {
      senderId: actor.sessionUserId,
      senderType: "BUYER",
      message: trimmed.slice(0, 4000),
    },
  });

  await auditLog({
    workspaceId: actor.workspaceId,
    actor: {
      userId: actor.sessionUserId,
      email: actor.email,
      role: actor.staffRoleType ?? actor.workspaceRole,
    },
    action: AUDIT_ACTIONS.NOTIFICATION_SENT,
    category: "OTHER",
    source: "USER",
    severity: "INFO",
    entity: { type: "Vendor", id: input.vendorId, label: "marketplace.contact" },
    metadata: {
      operation: "marketplace.vendor.contact",
      productSlug: input.productSlug,
    },
  });

  return { ok: true };
}
