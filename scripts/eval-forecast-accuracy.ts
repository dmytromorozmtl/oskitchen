/**
 * Weekly forecast accuracy — compares stored forecasts vs actual order counts.
 *
 *   npx tsx scripts/eval-forecast-accuracy.ts
 *
 * Target: MAPE < 15% meal prep, < 25% restaurant (when ForecastAccuracyLog exists).
 */
import { prisma } from "@/lib/prisma";

function mape(actual: number[], forecast: number[]): number {
  let sum = 0;
  let n = 0;
  for (let i = 0; i < actual.length; i++) {
    const a = actual[i];
    const f = forecast[i];
    if (a === 0) continue;
    sum += Math.abs((a - f) / a);
    n++;
  }
  return n === 0 ? 0 : (sum / n) * 100;
}

async function main() {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const orders = await prisma.order.groupBy({
    by: ["userId"],
    where: { createdAt: { gte: since } },
    _count: { id: true },
  });

  console.log(`Orders last 30d: ${orders.reduce((s, o) => s + o._count.id, 0)} across ${orders.length} workspaces`);
  console.log(
    "ForecastAccuracyLog model not wired — log MAPE here after forecast runs persist predictions.",
  );
  console.log(`Placeholder MAPE sample: ${mape([100, 120, 90], [95, 130, 88]).toFixed(1)}%`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
