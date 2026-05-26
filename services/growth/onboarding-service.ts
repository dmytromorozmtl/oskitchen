import { prisma } from "@/lib/prisma";

export async function onboardingCallStats() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const [total, upcoming] = await Promise.all([
    prisma.onboardingCall.count(),
    prisma.onboardingCall.count({
      where: { callDate: { gte: start } },
    }),
  ]);
  return { totalCalls: total, upcomingCalls: upcoming };
}
