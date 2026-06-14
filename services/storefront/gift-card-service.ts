import { randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";

function giftCode(): string {
  return randomBytes(6).toString("hex").toUpperCase();
}

export async function issueStorefrontGiftCard(input: {
  userId: string;
  storefrontId: string;
  amount: number;
  purchaserEmail?: string;
  recipientEmail?: string;
  recipientName?: string;
  message?: string;
  expiresAt?: Date;
}) {
  const code = giftCode();
  return prisma.storefrontGiftCard.create({
    data: {
      userId: input.userId,
      storefrontId: input.storefrontId,
      code,
      initialValue: input.amount,
      balance: input.amount,
      purchaserEmail: input.purchaserEmail ?? null,
      recipientEmail: input.recipientEmail ?? null,
      recipientName: input.recipientName ?? null,
      message: input.message ?? null,
      expiresAt: input.expiresAt ?? null,
    },
  });
}

export async function redeemGiftCardPartial(input: {
  code: string;
  storefrontId: string;
  amount: number;
  orderId?: string;
}): Promise<{ ok: true; applied: number; remaining: number } | { ok: false; error: string }> {
  const card = await prisma.storefrontGiftCard.findFirst({
    where: { code: input.code.toUpperCase(), storefrontId: input.storefrontId, isActive: true },
  });
  if (!card) return { ok: false, error: "Gift card not found." };
  if (card.expiresAt && card.expiresAt < new Date()) return { ok: false, error: "Gift card expired." };
  const balance = Number(card.balance);
  if (balance <= 0) return { ok: false, error: "Gift card has no balance." };
  const applied = Math.min(balance, input.amount);
  const remaining = balance - applied;
  await prisma.$transaction([
    prisma.storefrontGiftCard.update({
      where: { id: card.id },
      data: { balance: remaining, isActive: remaining > 0 },
    }),
    prisma.storefrontGiftCardRedemption.create({
      data: {
        giftCardId: card.id,
        orderId: input.orderId ?? null,
        amount: applied,
      },
    }),
  ]);
  return { ok: true, applied, remaining };
}

export async function listGiftCardsForStorefront(storefrontId: string) {
  return prisma.storefrontGiftCard.findMany({
    where: { storefrontId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
