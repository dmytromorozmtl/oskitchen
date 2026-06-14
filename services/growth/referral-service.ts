/** @deprecated Import from `@/services/referral/referral-service` */
export { countEarnedReferralMonths as referralEarnedMonths } from "@/services/referral/referral-service";

import { prisma } from "@/lib/prisma";

/** Platform-wide referral metrics (growth admin). */
export async function referralSummary() {
  const [codes, events, converted] = await Promise.all([
    prisma.referralCode.count({ where: { active: true } }),
    prisma.referralEvent.count(),
    prisma.referralEvent.count({ where: { convertedUserId: { not: null } } }),
  ]);
  return { activeCodes: codes, events, attributedSignups: converted };
}
