import { randomBytes } from "crypto";

import type { GiftCardStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { giftCardListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

function generateCode(): string {
  return randomBytes(6).toString("hex").toUpperCase();
}

export async function createGiftCard(
  userId: string,
  input: { amount: number; purchaserEmail?: string; notes?: string; code?: string },
) {
  const code = (input.code ?? generateCode()).toUpperCase();
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  return prisma.giftCard.create({
    data: {
      userId,
      workspaceId,
      code,
      balance: input.amount,
      initialBalance: input.amount,
      purchaserEmail: input.purchaserEmail ?? null,
      notes: input.notes ?? null,
      status: "ACTIVE",
    },
  });
}

export async function lookupGiftCard(userId: string, code: string) {
  const scope = await giftCardListWhereForOwner(userId);
  return prisma.giftCard.findFirst({
    where: {
      AND: [
        scope,
        { code: code.toUpperCase(), status: { in: ["ACTIVE", "PARTIALLY_REDEEMED"] } },
      ],
    },
  });
}

export async function redeemGiftCard(
  userId: string,
  code: string,
  amount: number,
): Promise<{ applied: number; remainingBalance: number }> {
  const card = await lookupGiftCard(userId, code);
  if (!card) throw new Error("Gift card not found or inactive");

  const balance = Number(card.balance);
  const applied = Math.min(amount, balance);
  const remaining = balance - applied;

  await prisma.giftCard.update({
    where: { id: card.id },
    data: {
      balance: remaining,
      status: remaining <= 0 ? "REDEEMED" : "PARTIALLY_REDEEMED",
    },
  });

  return { applied, remainingBalance: remaining };
}

export async function listGiftCards(userId: string, status?: GiftCardStatus) {
  const scope = await giftCardListWhereForOwner(userId);
  return prisma.giftCard.findMany({
    where: { AND: [scope, ...(status ? [{ status }] : [])] },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
