import { randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";
import { referralCodeListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export async function getOrCreateAffiliateCode(userId: string, label?: string) {
  const codeScope = await referralCodeListWhereForOwner(userId);
  const existing = await prisma.referralCode.findFirst({
    where: { AND: [codeScope, { active: true }] },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;

  const code = `KOS-${randomBytes(4).toString("hex").toUpperCase()}`;
  return prisma.referralCode.create({
    data: {
      userId,
      code,
      affiliateLabel: label ?? "Affiliate",
      commissionBps: 500,
    },
  });
}

export async function recordReferralSignup(input: {
  code: string;
  email: string;
  convertedUserId?: string;
}) {
  const ref = await prisma.referralCode.findFirst({
    where: { code: input.code, active: true },
  });
  if (!ref) return { ok: false as const, error: "Invalid referral code" };

  await prisma.referralEvent.create({
    data: {
      referralCodeId: ref.id,
      email: input.email.toLowerCase(),
      source: "affiliate_link",
      convertedUserId: input.convertedUserId,
    },
  });
  return { ok: true as const, referralCodeId: ref.id, commissionBps: ref.commissionBps };
}

export async function affiliateDashboard(userId: string) {
  const codeScope = await referralCodeListWhereForOwner(userId);
  const codes = await prisma.referralCode.findMany({
    where: codeScope,
    include: {
      events: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });
  const conversions = codes.reduce(
    (n, c) => n + c.events.filter((e) => e.convertedUserId).length,
    0,
  );
  return { codes, conversions };
}
