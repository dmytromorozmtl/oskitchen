import { Badge } from "@/components/ui/badge";
import type { OrderLifecycleView } from "@/services/orders/order-lifecycle-service";

const STAGE_LABEL: Record<string, string> = {
  NEEDS_FULFILLMENT_INFO: "Needs fulfillment details",
  READY_FOR_PRODUCTION: "Ready for kitchen",
  IN_PRODUCTION: "In production",
  READY_FOR_PICKUP: "Ready for pickup",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function OrderOperationalStateBadge({ stage }: { stage: OrderLifecycleView["stage"] }) {
  const label = STAGE_LABEL[stage] ?? stage.replace(/_/g, " ").toLowerCase();
  return (
    <Badge variant="secondary" className="rounded-full text-xs font-normal capitalize">
      {label}
    </Badge>
  );
}
