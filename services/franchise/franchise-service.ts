import { prisma } from "@/lib/prisma";
import { franchiseListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export async function calculateRoyalties(userId: string, period: "month" | "quarter") {
  const scope = await franchiseListWhereForOwner(userId);
  const franchises = await prisma.franchise.findMany({
    where: { AND: [scope, { status: "ACTIVE" }] },
  });

  const now = new Date();
  const since =
    period === "month"
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

  const royalties = [];
  for (const f of franchises) {
    const revenue = await prisma.order.aggregate({
      where: {
        userId: f.franchiseeId,
        createdAt: { gte: since },
        status: { not: "CANCELLED" },
      },
      _sum: { total: true },
    });

    const totalRevenue = Number(revenue._sum.total ?? 0);
    const royaltyAmount = totalRevenue * (Number(f.royaltyRate) / 100);

    royalties.push({
      franchiseId: f.id,
      franchiseName: f.name,
      franchiseeId: f.franchiseeId,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      royaltyRate: Number(f.royaltyRate),
      royaltyAmount: Math.round(royaltyAmount * 100) / 100,
    });
  }

  return {
    period,
    since: since.toISOString().slice(0, 10),
    totalRoyalties: royalties.reduce((s, r) => s + r.royaltyAmount, 0),
    franchises: royalties,
  };
}

export function royaltiesToCSV(
  data: Awaited<ReturnType<typeof calculateRoyalties>>,
): string {
  const header = "Franchise,Revenue,Royalty Rate,Royalty Amount";
  const rows = data.franchises.map(
    (f) =>
      `"${f.franchiseName.replace(/"/g, '""')}",${f.totalRevenue},${f.royaltyRate}%,${f.royaltyAmount}`,
  );
  return [header, ...rows, `,,Total,${data.totalRoyalties}`].join("\n");
}
