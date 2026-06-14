import { prisma } from "@/lib/prisma";
import { forecastRunListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export async function loadLatestForecastRunForUser(userId: string) {
  const scope = await forecastRunListWhereForOwner(userId);
  return prisma.forecastRun.findFirst({
    where: scope,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, status: true, confidence: true, dateFrom: true, dateTo: true, createdAt: true },
  });
}
