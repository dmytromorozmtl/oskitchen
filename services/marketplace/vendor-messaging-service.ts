import type { MarketplaceSenderType } from "@prisma/client";

import { extractRegistrationMeta, parseVendorDocuments } from "@/lib/marketplace/vendor-registration-types";
import { isEmailConfigured, sendRawEmail } from "@/lib/email";
import { APP_NAME } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export type VendorChatPerspective = "buyer" | "vendor";

export type VendorChatMessage = {
  id: string;
  body: string;
  senderType: MarketplaceSenderType;
  senderId: string;
  attachments: string[];
  readAt: string | null;
  createdAt: string;
  isSelf: boolean;
};

export type VendorChatContext = {
  orderId: string;
  poNumber: string | null;
  vendorName: string;
  buyerName: string;
};

function mapMessage(
  row: {
    id: string;
    message: string;
    senderType: MarketplaceSenderType;
    senderId: string;
    attachments: string[];
    readAt: Date | null;
    createdAt: Date;
  },
  selfType: MarketplaceSenderType,
): VendorChatMessage {
  return {
    id: row.id,
    body: row.message,
    senderType: row.senderType,
    senderId: row.senderId,
    attachments: row.attachments,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    isSelf: row.senderType === selfType,
  };
}

function selfSenderType(perspective: VendorChatPerspective): MarketplaceSenderType {
  return perspective === "vendor" ? "VENDOR" : "BUYER";
}

export async function loadOrderChatContext(orderId: string): Promise<VendorChatContext | null> {
  const order = await prisma.marketplacePurchaseOrder.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      poNumber: true,
      vendor: { select: { companyName: true } },
      workspace: { select: { name: true } },
    },
  });
  if (!order) return null;
  return {
    orderId: order.id,
    poNumber: order.poNumber,
    vendorName: order.vendor.companyName,
    buyerName: order.workspace.name,
  };
}

export async function loadOrderChatMessages(input: {
  orderId: string;
  perspective: VendorChatPerspective;
  readerId: string;
}): Promise<VendorChatMessage[]> {
  const selfType = selfSenderType(input.perspective);
  const rows = await prisma.vendorMessage.findMany({
    where: { purchaseOrderId: input.orderId },
    orderBy: { createdAt: "asc" },
  });

  await prisma.vendorMessage.updateMany({
    where: {
      purchaseOrderId: input.orderId,
      readAt: null,
      senderType: { not: selfType },
    },
    data: { readAt: new Date() },
  });

  return rows.map((row) => mapMessage(row, selfType));
}

export async function sendOrderChatMessage(input: {
  orderId: string;
  perspective: VendorChatPerspective;
  senderId: string;
  message: string;
  attachments?: string[];
}): Promise<{ ok: true; message: VendorChatMessage } | { ok: false; error: string }> {
  const trimmed = input.message.trim();
  if (!trimmed && !(input.attachments?.length ?? 0)) {
    return { ok: false, error: "Message or attachment is required." };
  }

  const order = await prisma.marketplacePurchaseOrder.findUnique({
    where: { id: input.orderId },
    select: {
      id: true,
      poNumber: true,
      vendorId: true,
      workspaceId: true,
      vendor: { select: { companyName: true, documents: true, workspaceId: true } },
      workspace: { select: { name: true, ownerUserId: true } },
    },
  });
  if (!order) return { ok: false, error: "Order not found." };

  const senderType = selfSenderType(input.perspective);
  const row = await prisma.vendorMessage.create({
    data: {
      purchaseOrderId: order.id,
      senderId: input.senderId,
      senderType,
      message: trimmed.slice(0, 4000),
      attachments: (input.attachments ?? []).slice(0, 5),
    },
  });

  void notifyMarketplaceChatEmail({
    order,
    senderType,
    message: trimmed,
    poNumber: order.poNumber,
  }).catch((error) => logger.warn("marketplace chat email failed", error));

  return {
    ok: true,
    message: mapMessage(row, senderType),
  };
}

async function notifyMarketplaceChatEmail(input: {
  order: {
    poNumber: string | null;
    vendor: { companyName: string; documents: unknown; workspaceId: string | null };
    workspace: { name: string; ownerUserId: string };
  };
  senderType: MarketplaceSenderType;
  message: string;
  poNumber: string | null;
}) {
  if (!isEmailConfigured()) return;

  let recipientEmail: string | null = null;
  let subject = "";
  let text = "";

  if (input.senderType === "BUYER") {
    const meta = extractRegistrationMeta(parseVendorDocuments(input.order.vendor.documents));
    recipientEmail = meta.contactEmail;
    subject = `${APP_NAME} marketplace — new buyer message`;
    text = `New message on PO ${input.poNumber ?? "order"} from ${input.order.workspace.name}:\n\n${input.message}\n\nReply in the vendor cabinet.`;
  } else if (input.senderType === "VENDOR") {
    const owner = await prisma.userProfile.findUnique({
      where: { id: input.order.workspace.ownerUserId },
      select: { email: true },
    });
    recipientEmail = owner?.email ?? null;
    subject = `${APP_NAME} marketplace — vendor replied`;
    text = `${input.order.vendor.companyName} replied on PO ${input.poNumber ?? "order"}:\n\n${input.message}\n\nOpen the order in marketplace to continue the conversation.`;
  }

  if (!recipientEmail) return;
  await sendRawEmail({ to: recipientEmail, subject, text });
}

export async function assertBuyerOrderChatAccess(input: {
  workspaceId: string;
  orderId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const order = await prisma.marketplacePurchaseOrder.findFirst({
    where: { id: input.orderId, workspaceId: input.workspaceId },
    select: { id: true },
  });
  if (!order) return { ok: false, error: "Order not found." };
  return { ok: true };
}

export async function assertVendorOrderChatAccess(input: {
  vendorId: string;
  orderId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const order = await prisma.marketplacePurchaseOrder.findFirst({
    where: { id: input.orderId, vendorId: input.vendorId },
    select: { id: true },
  });
  if (!order) return { ok: false, error: "Order not found." };
  return { ok: true };
}
