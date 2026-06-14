import { getTodayQueue, type TodayOrderItem } from "@/services/production/daily-queue-service";

export type KdsDailyOrder = TodayOrderItem & {
  elapsedSeconds: number;
};

export async function getDailyKdsOrders(userId: string): Promise<KdsDailyOrder[]> {
  const rows = await getTodayQueue(userId);
  const now = Date.now();
  return rows.map((row) => ({
    ...row,
    elapsedSeconds: Math.floor((now - new Date(row.createdAt).getTime()) / 1000),
  }));
}
