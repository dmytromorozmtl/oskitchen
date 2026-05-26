import { prisma } from "@/lib/prisma";

/** Health snapshot mix for the last 7 days (all snapshots, grouped by status). */
export async function latestHealthDistribution() {
  const since = new Date(Date.now() - 7 * 86400000);
  const rows = await prisma.customerHealthSnapshot.groupBy({
    by: ["status"],
    where: { createdAt: { gte: since } },
    _count: { status: true },
  });
  return rows.map((r) => ({ status: r.status, count: r._count.status }));
}
