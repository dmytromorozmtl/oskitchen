import type { GiftCardStatus } from "@prisma/client";

/** In-memory gift card state mirroring services/gift-cards/gift-card-service.ts. */
export type SimGiftCard = {
  code: string;
  balance: number;
  initialBalance: number;
  status: GiftCardStatus;
};

export type GiftCardRedeemSimResult =
  | {
      ok: true;
      card: SimGiftCard;
      applied: number;
      remainingBalance: number;
    }
  | { ok: false; error: string };

export function issueGiftCardSim(input: {
  amount: number;
  code?: string;
}): SimGiftCard {
  const code = (input.code ?? "REGRESSIONCARD").toUpperCase();
  return {
    code,
    balance: input.amount,
    initialBalance: input.amount,
    status: "ACTIVE",
  };
}

/** Mirrors redeemGiftCard() balance math and status transitions. */
export function redeemGiftCardSim(
  card: SimGiftCard,
  amount: number,
): GiftCardRedeemSimResult {
  if (card.status !== "ACTIVE" && card.status !== "PARTIALLY_REDEEMED") {
    return { ok: false, error: "Gift card not found or inactive" };
  }

  const balance = card.balance;
  const applied = Math.min(amount, balance);
  const remaining = balance - applied;
  const status: GiftCardStatus = remaining <= 0 ? "REDEEMED" : "PARTIALLY_REDEEMED";

  return {
    ok: true,
    card: { ...card, balance: remaining, status },
    applied,
    remainingBalance: remaining,
  };
}
