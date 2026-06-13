import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  computeStorefrontLoyaltyEarnPoints,
  quoteStorefrontLoyaltyRedeemCredit,
} from "@/lib/loyalty/loyalty-earn-redeem-p2-41-measurement";

export async function getOrCreateLoyaltyProgram(storefrontId: string, userId: string) {
  const existing = await prisma.storefrontLoyaltyProgram.findUnique({ where: { storefrontId } });
  if (existing) return existing;
  return prisma.storefrontLoyaltyProgram.create({
    data: { storefrontId, userId },
  });
}

export async function getLoyaltyBalance(input: {
  storefrontId: string;
  customerEmail: string;
}) {
  const customer = await prisma.storefrontCustomer.findUnique({
    where: {
      storefrontId_email: {
        storefrontId: input.storefrontId,
        email: input.customerEmail.trim().toLowerCase(),
      },
    },
  });
  if (!customer) return { points: 0, lifetimePoints: 0 };
  const account = await prisma.storefrontLoyaltyAccount.findUnique({
    where: {
      customerId_storefrontId: { customerId: customer.id, storefrontId: input.storefrontId },
    },
  });
  return { points: account?.points ?? 0, lifetimePoints: account?.lifetimePoints ?? 0 };
}

export async function redeemLoyaltyPoints(
  input: {
    storefrontId: string;
    customerEmail: string;
    points: number;
    orderId?: string;
  },
  db: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<
  { ok: true; creditAmount: number; pointsUsed: number } | { ok: false; error: string }
> {
  const program = await db.storefrontLoyaltyProgram.findUnique({
    where: { storefrontId: input.storefrontId, isActive: true },
  });
  if (!program) return { ok: false, error: "Loyalty program not active." };

  const quote = quoteStorefrontLoyaltyRedeemCredit(input.points, {
    redeemPoints: program.redeemPoints,
    redeemAmount: Number(program.redeemAmount),
    minPointsToRedeem: program.minPointsToRedeem,
  });
  if (!quote.ok) return quote;

  const customer = await db.storefrontCustomer.findUnique({
    where: {
      storefrontId_email: {
        storefrontId: input.storefrontId,
        email: input.customerEmail.trim().toLowerCase(),
      },
    },
  });
  if (!customer) return { ok: false, error: "Customer not found." };

  const account = await db.storefrontLoyaltyAccount.findUnique({
    where: {
      customerId_storefrontId: { customerId: customer.id, storefrontId: input.storefrontId },
    },
  });
  if (!account || account.points < quote.pointsUsed) {
    return { ok: false, error: "Insufficient points." };
  }

  await db.storefrontLoyaltyAccount.update({
    where: { id: account.id },
    data: { points: account.points - quote.pointsUsed },
  });
  await db.storefrontLoyaltyTransaction.create({
    data: {
      accountId: account.id,
      storefrontId: input.storefrontId,
      orderId: input.orderId ?? null,
      delta: -quote.pointsUsed,
      reason: "checkout_redeem",
    },
  });

  return { ok: true, creditAmount: quote.creditAmount, pointsUsed: quote.pointsUsed };
}

export async function earnStorefrontLoyaltyPoints(input: {
  storefrontId: string;
  customerEmail: string;
  orderId: string;
  earnSubtotal: number;
}): Promise<{ earned: number }> {
  const existing = await prisma.storefrontLoyaltyTransaction.findFirst({
    where: { orderId: input.orderId, reason: "order_earn" },
    select: { id: true },
  });
  if (existing) return { earned: 0 };

  const program = await prisma.storefrontLoyaltyProgram.findUnique({
    where: { storefrontId: input.storefrontId, isActive: true },
  });
  if (!program) return { earned: 0 };

  const points = computeStorefrontLoyaltyEarnPoints(input.earnSubtotal, {
    pointsPerDollar: Number(program.pointsPerDollar),
    isActive: program.isActive,
  });
  if (points <= 0) return { earned: 0 };

  const email = input.customerEmail.trim().toLowerCase();
  const customer = await prisma.storefrontCustomer.findUnique({
    where: { storefrontId_email: { storefrontId: input.storefrontId, email } },
  });
  if (!customer) return { earned: 0 };

  await prisma.$transaction(async (tx) => {
    const account = await tx.storefrontLoyaltyAccount.upsert({
      where: {
        customerId_storefrontId: { customerId: customer.id, storefrontId: input.storefrontId },
      },
      create: {
        customerId: customer.id,
        storefrontId: input.storefrontId,
        points,
        lifetimePoints: points,
      },
      update: {
        points: { increment: points },
        lifetimePoints: { increment: points },
      },
    });

    await tx.storefrontLoyaltyTransaction.create({
      data: {
        accountId: account.id,
        storefrontId: input.storefrontId,
        orderId: input.orderId,
        delta: points,
        reason: "order_earn",
      },
    });
  });

  return { earned: points };
}

export async function restoreStorefrontLoyaltyRedeem(input: {
  storefrontId: string;
  customerEmail: string;
  points: number;
  orderId: string;
}): Promise<void> {
  if (input.points <= 0) return;

  const restored = await prisma.storefrontLoyaltyTransaction.findFirst({
    where: { orderId: input.orderId, reason: "checkout_redeem_restore" },
    select: { id: true },
  });
  if (restored) return;

  const email = input.customerEmail.trim().toLowerCase();
  const customer = await prisma.storefrontCustomer.findUnique({
    where: { storefrontId_email: { storefrontId: input.storefrontId, email } },
  });
  if (!customer) return;

  const account = await prisma.storefrontLoyaltyAccount.findUnique({
    where: {
      customerId_storefrontId: { customerId: customer.id, storefrontId: input.storefrontId },
    },
  });
  if (!account) return;

  await prisma.$transaction([
    prisma.storefrontLoyaltyAccount.update({
      where: { id: account.id },
      data: { points: { increment: input.points } },
    }),
    prisma.storefrontLoyaltyTransaction.create({
      data: {
        accountId: account.id,
        storefrontId: input.storefrontId,
        orderId: input.orderId,
        delta: input.points,
        reason: "checkout_redeem_restore",
      },
    }),
  ]);
}

export function parseStorefrontLoyaltyRedeemFromOrderMetadata(
  sourceMetadataJson: unknown,
): { pointsRedeemed: number; creditAmount: number } | null {
  if (
    typeof sourceMetadataJson !== "object" ||
    sourceMetadataJson === null ||
    Array.isArray(sourceMetadataJson)
  ) {
    return null;
  }
  const meta = sourceMetadataJson as Record<string, unknown>;
  const pointsRedeemed = meta.storefrontLoyaltyPointsRedeemed;
  const creditAmount = meta.storefrontLoyaltyCreditAmount;
  if (typeof pointsRedeemed !== "number" || pointsRedeemed <= 0) return null;
  return {
    pointsRedeemed,
    creditAmount: typeof creditAmount === "number" ? creditAmount : 0,
  };
}
