import { prisma } from "@/lib/prisma";

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

export async function redeemLoyaltyPoints(input: {
  storefrontId: string;
  customerEmail: string;
  points: number;
}): Promise<{ ok: true; creditAmount: number } | { ok: false; error: string }> {
  const program = await prisma.storefrontLoyaltyProgram.findUnique({
    where: { storefrontId: input.storefrontId, isActive: true },
  });
  if (!program) return { ok: false, error: "Loyalty program not active." };
  if (input.points < program.minPointsToRedeem) {
    return { ok: false, error: `Minimum ${program.minPointsToRedeem} points required.` };
  }

  const customer = await prisma.storefrontCustomer.findUnique({
    where: {
      storefrontId_email: {
        storefrontId: input.storefrontId,
        email: input.customerEmail.trim().toLowerCase(),
      },
    },
  });
  if (!customer) return { ok: false, error: "Customer not found." };

  const account = await prisma.storefrontLoyaltyAccount.findUnique({
    where: {
      customerId_storefrontId: { customerId: customer.id, storefrontId: input.storefrontId },
    },
  });
  if (!account || account.points < input.points) {
    return { ok: false, error: "Insufficient points." };
  }

  const blocks = Math.floor(input.points / program.redeemPoints);
  const creditAmount = blocks * Number(program.redeemAmount);
  const pointsUsed = blocks * program.redeemPoints;

  await prisma.$transaction([
    prisma.storefrontLoyaltyAccount.update({
      where: { id: account.id },
      data: { points: account.points - pointsUsed },
    }),
    prisma.storefrontLoyaltyTransaction.create({
      data: {
        accountId: account.id,
        storefrontId: input.storefrontId,
        delta: -pointsUsed,
        reason: "checkout_redeem",
      },
    }),
  ]);

  return { ok: true, creditAmount };
}
