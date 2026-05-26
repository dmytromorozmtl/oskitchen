import { prisma } from "@/lib/prisma";

export async function referralSummary() {
  const [codes, events, converted] = await Promise.all([
    prisma.referralCode.count({ where: { active: true } }),
    prisma.referralEvent.count(),
    prisma.referralEvent.count({ where: { convertedUserId: { not: null } } }),
  ]);
  return { activeCodes: codes, events, attributedSignups: converted };
}
