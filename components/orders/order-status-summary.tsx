import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@prisma/client";

const STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "In production",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function OrderStatusSummary({ dbStatus, sourceLabel }: { dbStatus: OrderStatus; sourceLabel?: string | null }) {
  const label = STATUS_LABEL[dbStatus] ?? dbStatus.replace(/_/g, " ");
  return (
    <div className="flex flex-wrap items-center gap-2">
      {sourceLabel ? (
        <Badge variant="outline" className="rounded-full text-xs font-normal">
          {sourceLabel}
        </Badge>
      ) : null}
      <Badge variant="default" className="rounded-full text-xs font-normal">
        {label}
      </Badge>
    </div>
  );
}
