import type { MarketplacePOStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import {
  marketplaceOrderStatusBadgeVariant,
  marketplaceOrderStatusLabel,
} from "@/lib/marketplace/order-status";

export function MarketplaceOrderStatusBadge({ status }: { status: MarketplacePOStatus }) {
  return (
    <Badge variant={marketplaceOrderStatusBadgeVariant(status)} className="rounded-full">
      {marketplaceOrderStatusLabel(status)}
    </Badge>
  );
}
