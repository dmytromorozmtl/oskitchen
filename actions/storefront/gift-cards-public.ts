"use server";


import { fail, ok } from "@/lib/action-result";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getStorefrontForPublicFromRequest } from "@/lib/storefront/public-access";
import { formatCurrency } from "@/lib/utils";

const balanceSchema = z.object({
  storeSlug: z.string().min(1).max(120),
  code: z.string().min(4).max(64),
});

export async function lookupGiftCardBalanceAction(input: { storeSlug: string; code: string }) {
  const parsed = balanceSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };

  const sf = await getStorefrontForPublicFromRequest(parsed.data.storeSlug, null);
  if (!sf) return { ok: false as const, error: "Store not found." };

  const card = await prisma.storefrontGiftCard.findFirst({
    where: {
      storefrontId: sf.id,
      code: parsed.data.code.trim().toUpperCase(),
      isActive: true,
    },
    select: { balance: true, expiresAt: true, initialValue: true },
  });

  if (!card) return { ok: false as const, error: "Gift card not found." };
  if (card.expiresAt && card.expiresAt < new Date()) {
    return { ok: false as const, error: "This gift card has expired." };
  }

  const balance = Number(card.balance);
  return {
    ok: true as const,
    balance,
    formatted: formatCurrency(balance, sf.currency),
  };
}
