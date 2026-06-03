import type { MarketplacePOStatus } from "@prisma/client";

import { SITE_URL, APP_NAME } from "@/lib/constants";
import { isEmailConfigured, sendRawEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import {
  parseVendorDocuments,
  extractRegistrationMeta,
} from "@/lib/marketplace/vendor-registration-types";
import {
  parseVendorCabinetSettings,
  type VendorTeamMember,
} from "@/lib/marketplace/vendor-settings-types";
import { prisma } from "@/lib/prisma";

export type VendorNewOrderNotificationResult = {
  emailed: number;
  inApp: number;
  skipped: number;
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function resolveVendorOrderEmails(input: {
  contactEmail: string | null;
  team: VendorTeamMember[];
  newOrderEmailEnabled: boolean;
}): string[] {
  if (!input.newOrderEmailEnabled) return [];

  const emails = new Set<string>();
  if (input.contactEmail?.trim()) {
    emails.add(input.contactEmail.trim().toLowerCase());
  }

  for (const member of input.team) {
    if (member.status !== "active") continue;
    if (member.role !== "ADMIN" && member.role !== "MANAGER") continue;
    if (member.email?.trim()) {
      emails.add(member.email.trim().toLowerCase());
    }
  }

  return [...emails];
}

function buildVendorNewOrderEmail(input: {
  vendorName: string;
  buyerName: string;
  poNumber: string | null;
  orderId: string;
  total: number;
  currency: string;
  status: MarketplacePOStatus;
  itemCount: number;
  requiresApproval: boolean;
}): { subject: string; text: string } {
  const poLabel = input.poNumber ?? input.orderId.slice(0, 8);
  const statusNote =
    input.status === "PENDING_APPROVAL" || input.requiresApproval
      ? " (awaiting buyer approval before fulfillment)"
      : "";
  const manageUrl = `${SITE_URL}/vendor/orders/${input.orderId}`;

  return {
    subject: `${APP_NAME} — new purchase order ${poLabel} from ${input.buyerName}`,
    text: [
      `Hi ${input.vendorName},`,
      "",
      `${input.buyerName} placed a new marketplace purchase order with your catalog.`,
      "",
      `PO: ${poLabel}`,
      `Total: ${input.currency} ${input.total.toFixed(2)}`,
      `Status: ${input.status}${statusNote}`,
      `Line items: ${input.itemCount}`,
      "",
      `Manage the order in your vendor cabinet:`,
      manageUrl,
    ].join("\n"),
  };
}

/** Notify vendors (email + in-app) when buyer checkout creates purchase orders. */
export async function notifyVendorsOfNewMarketplaceOrders(input: {
  orderIds: string[];
  buyerWorkspaceId: string;
  requiresApproval: boolean;
}): Promise<VendorNewOrderNotificationResult> {
  const result: VendorNewOrderNotificationResult = { emailed: 0, inApp: 0, skipped: 0 };
  if (input.orderIds.length === 0) return result;

  const orders = await prisma.marketplacePurchaseOrder.findMany({
    where: { id: { in: input.orderIds }, workspaceId: input.buyerWorkspaceId },
    select: {
      id: true,
      poNumber: true,
      total: true,
      currency: true,
      status: true,
      vendorId: true,
      vendor: {
        select: {
          id: true,
          companyName: true,
          documents: true,
          workspaceId: true,
          workspace: { select: { ownerUserId: true } },
        },
      },
      workspace: { select: { name: true } },
      _count: { select: { items: true } },
    },
  });

  for (const order of orders) {
    const settings = parseVendorCabinetSettings(order.vendor.documents);
    const meta = extractRegistrationMeta(parseVendorDocuments(order.vendor.documents));
    const recipients = resolveVendorOrderEmails({
      contactEmail: meta.contactEmail,
      team: settings.team,
      newOrderEmailEnabled: settings.notifications.newOrderEmail,
    });

    const total = decimalToNumber(order.total);
    const buyerName = order.workspace.name;
    const emailContent = buildVendorNewOrderEmail({
      vendorName: order.vendor.companyName,
      buyerName,
      poNumber: order.poNumber,
      orderId: order.id,
      total,
      currency: order.currency,
      status: order.status,
      itemCount: order._count.items,
      requiresApproval: input.requiresApproval,
    });

    if (recipients.length > 0 && isEmailConfigured()) {
      for (const to of recipients) {
        try {
          await sendRawEmail({
            to,
            subject: emailContent.subject,
            text: emailContent.text,
          });
          result.emailed += 1;
        } catch (error) {
          logger.warn("[marketplace] vendor new-order email failed", {
            orderId: order.id,
            vendorId: order.vendorId,
            error,
          });
        }
      }
    } else if (!settings.notifications.newOrderEmail) {
      result.skipped += 1;
    }

    const ownerUserId = order.vendor.workspace?.ownerUserId;
    if (ownerUserId && order.vendor.workspaceId) {
      try {
        await prisma.notificationLog.create({
          data: {
            userId: ownerUserId,
            workspaceId: order.vendor.workspaceId,
            type: "ORDER_CONFIRMATION",
            dedupeKey: `marketplace-vendor-new-order:${order.id}`,
            recipient: recipients[0] ?? meta.contactEmail ?? "vendor",
            orderId: order.id,
            status: "SENT",
            category: "TRANSACTIONAL",
            channel: "IN_APP",
            templateKey: "marketplace_vendor_new_order",
            sourceType: "MARKETPLACE_VENDOR_ORDER",
            sourceId: order.id,
            metadata: {
              vendorId: order.vendorId,
              poNumber: order.poNumber,
              buyerWorkspaceName: buyerName,
              total,
              currency: order.currency,
              status: order.status,
              requiresApproval: input.requiresApproval,
            },
            sentAt: new Date(),
          },
        });
        result.inApp += 1;
      } catch (error) {
        logger.warn("[marketplace] vendor new-order in-app notification failed", {
          orderId: order.id,
          vendorId: order.vendorId,
          error,
        });
      }
    }
  }

  return result;
}
