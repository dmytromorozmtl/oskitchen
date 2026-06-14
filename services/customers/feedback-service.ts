import { subHours } from "date-fns";

import { prisma } from "@/lib/prisma";
import { sendRawEmail } from "@/lib/email";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  customerFeedbackListWhereForOwner,
  orderListWhereForOwnerAnd,
  resolveOwnerScopedWhere,
} from "@/lib/scope/workspace-resource-scope";

export async function createCustomerFeedback(input: {
  userId: string;
  customerId?: string;
  orderId?: string;
  rating: number;
  comment?: string;
  tags?: string[];
}) {
  const negativeRouted = input.rating <= 2;
  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  return prisma.customerFeedback.create({
    data: {
      userId: input.userId,
      workspaceId,
      customerId: input.customerId,
      orderId: input.orderId,
      rating: input.rating,
      comment: input.comment,
      tagsJson: input.tags?.length ? input.tags : undefined,
      negativeRouted,
    },
  });
}

export async function listCustomerFeedback(userId: string, limit = 100) {
  const where = await resolveOwnerScopedWhere(userId);
  return prisma.customerFeedback.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      customer: { select: { email: true, displayName: true, name: true } },
      order: { select: { id: true, customerName: true } },
    },
  });
}

/** Queue review-request emails for orders delivered ~24h ago. */
export async function sendPendingReviewRequestEmails(userId: string): Promise<number> {
  const since = subHours(new Date(), 25);
  const until = subHours(new Date(), 23);
  const orderWhere = await orderListWhereForOwnerAnd(userId, {
    status: "COMPLETED",
    updatedAt: { gte: since, lte: until },
    customerEmail: { not: { contains: "@local.kitchenos.invalid" } },
  });
  const orders = await prisma.order.findMany({
    where: orderWhere,
    select: { id: true, customerEmail: true, customerName: true, publicLookupToken: true },
    take: 50,
  });

  let sent = 0;
  for (const o of orders) {
    const feedbackScope = await customerFeedbackListWhereForOwner(userId);
    const existing = await prisma.customerFeedback.findFirst({
      where: { AND: [feedbackScope, { orderId: o.id, reviewEmailSentAt: { not: null } }] },
      select: { id: true },
    });
    if (existing) continue;

    const link = o.publicLookupToken
      ? `${process.env.NEXT_PUBLIC_APP_URL ?? "https://os-kitchen.com"}/order/${o.publicLookupToken}?review=1`
      : `${process.env.NEXT_PUBLIC_APP_URL ?? "https://os-kitchen.com"}/dashboard/support/contact`;

    await sendRawEmail({
      to: o.customerEmail,
      subject: "How was your order?",
      text: `Hi ${o.customerName},\n\nWe'd love your feedback: ${link}\n\nThank you!`,
    }).catch(() => undefined);

    const workspaceId = await resolveOwnerWorkspaceId(userId);
    await prisma.customerFeedback.create({
      data: {
        userId,
        workspaceId,
        orderId: o.id,
        rating: 0,
        reviewEmailSentAt: new Date(),
      },
    });

    sent += 1;
  }
  return sent;
}
