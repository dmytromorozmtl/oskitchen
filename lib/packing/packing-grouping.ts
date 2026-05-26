import type { PackingOrderDTO } from "@/lib/packing/packing-order-dto";
import { format, parseISO } from "date-fns";

export function groupOrdersByPreparedDate(orders: PackingOrderDTO[]): Map<string, PackingOrderDTO[]> {
  const byPrepared = new Map<string, PackingOrderDTO[]>();
  for (const order of orders) {
    for (const item of order.items) {
      const key = item.preparedDate ? format(parseISO(item.preparedDate), "yyyy-MM-dd") : "unscheduled";
      if (!byPrepared.has(key)) byPrepared.set(key, []);
      const bucket = byPrepared.get(key)!;
      if (!bucket.find((o) => o.id === order.id)) bucket.push(order);
    }
  }
  return byPrepared;
}

export function partitionFulfillment(orders: PackingOrderDTO[]) {
  return {
    delivery: orders.filter((o) => o.fulfillmentType === "DELIVERY"),
    pickup: orders.filter((o) => o.fulfillmentType === "PICKUP"),
  };
}
