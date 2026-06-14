import { prisma } from "@/lib/prisma";

export type FeedbackSummary = {
  betaFeedbackCount: number;
  appFeedbackCount: number;
  topCategories: Array<{ category: string; count: number }>;
  recent: Array<{ source: string; category: string; severity: string; createdAt: string }>;
};

/** Summarize in-app + beta program feedback for week 2 review. */
export async function summarizeBetaFeedback(params: {
  ownerEmails: string[];
  sinceDays?: number;
}): Promise<FeedbackSummary> {
  const since = new Date(Date.now() - (params.sinceDays ?? 14) * 24 * 60 * 60 * 1000);

  const owners = await prisma.userProfile.findMany({
    where: { email: { in: params.ownerEmails } },
    select: { id: true, email: true },
  });
  const ownerIds = owners.map((o) => o.id);

  const [betaRows, appRows] = await Promise.all([
    prisma.betaFeedback.findMany({
      where: {
        createdAt: { gte: since },
        betaLead: { email: { in: params.ownerEmails } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { category: true, severity: true, createdAt: true },
    }),
    prisma.appFeedback.findMany({
      where: {
        createdAt: { gte: since },
        userId: { in: ownerIds },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { type: true, priority: true, status: true, createdAt: true },
    }),
  ]);

  const catMap = new Map<string, number>();
  for (const r of betaRows) {
    catMap.set(r.category, (catMap.get(r.category) ?? 0) + 1);
  }

  const topCategories = [...catMap.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const recent = [
    ...betaRows.slice(0, 10).map((r) => ({
      source: "beta",
      category: r.category,
      severity: r.severity,
      createdAt: r.createdAt.toISOString(),
    })),
    ...appRows.slice(0, 10).map((r) => ({
      source: "app",
      category: r.type,
      severity: r.priority,
      createdAt: r.createdAt.toISOString(),
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    betaFeedbackCount: betaRows.length,
    appFeedbackCount: appRows.length,
    topCategories,
    recent: recent.slice(0, 15),
  };
}
