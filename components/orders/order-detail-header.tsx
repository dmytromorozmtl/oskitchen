import Link from "next/link";

import { OrderB2bCateringQuoteBanner } from "@/components/orders/order-b2b-catering-quote-banner";
import { OrderB2bCommercialTermsBanner } from "@/components/orders/order-b2b-commercial-terms";
import { OrderCustomerSummary } from "@/components/orders/order-customer-summary";
import { OrderOperationalStateBadge } from "@/components/orders/order-operational-state-badge";
import { OrderStatusSummary } from "@/components/orders/order-status-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hasMarketableEmail } from "@/lib/customers/customer-display";
import { ORDER_TYPE_LABEL, type OrderCreationType } from "@/lib/orders/order-types";
import { formatCurrency } from "@/lib/utils";
import type { OrderLifecycleView } from "@/services/orders/order-lifecycle-service";
import { formatOrderPageTitle } from "@/services/orders/order-detail-service";
import type { OrderDetailLoaded } from "@/services/orders/order-detail-service";
import type { OrderNextActionBundle } from "@/services/orders/order-next-action-service";

export function OrderDetailHeader({
  order,
  lifecycleView,
  phase,
  total,
  publicLookupToken,
  nextActions,
}: {
  order: OrderDetailLoaded;
  lifecycleView: OrderLifecycleView;
  phase: string;
  total: number;
  publicLookupToken: string | null;
  /** Shown under the title on every tab — same signals as the Overview “Pipeline” card. */
  nextActions?: OrderNextActionBundle;
}) {
  const criticalBlockers = lifecycleView.blockers.filter((b) => b.severity === "CRITICAL" || b.severity === "HIGH");
  const rawType = order.orderType;
  const sourceLabel =
    rawType && rawType in ORDER_TYPE_LABEL
      ? ORDER_TYPE_LABEL[rawType as OrderCreationType]
      : rawType ?? "Order";
  const posTxn = order.posTransactions[0];
  const showCustomerLookup = Boolean(publicLookupToken && hasMarketableEmail(order.customerEmail));

  return (
    <div className="space-y-4">
      <OrderB2bCateringQuoteBanner sourceMetadataJson={order.sourceMetadataJson} />
      <OrderB2bCommercialTermsBanner sourceMetadataJson={order.sourceMetadataJson} />
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 flex-1 space-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Order</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{formatOrderPageTitle(order)}</h1>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">ID {order.id}</p>
        </div>
        <OrderStatusSummary dbStatus={order.status} sourceLabel={sourceLabel} />
        <div className="flex flex-wrap items-center gap-2">
          <OrderOperationalStateBadge stage={lifecycleView.stage} />
          <Badge variant="outline" className="rounded-full text-[11px] font-normal text-muted-foreground">
            {phase.replace(/_/g, " ")}
          </Badge>
        </div>
        <OrderCustomerSummary
          orderId={order.id}
          customerName={order.customerName}
          customerEmail={order.customerEmail}
          customerPhone={order.customerPhone}
          kitchenCustomerId={order.customerId}
        />
        <p className="text-sm tabular-nums text-muted-foreground">
          Total <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
        </p>
        {posTxn ? (
          <p className="text-xs text-muted-foreground">
            POS receipt <span className="font-mono text-foreground">{posTxn.receiptNumber}</span>
            {posTxn.receipt ? " · issued" : ""}
          </p>
        ) : null}
        {criticalBlockers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {criticalBlockers.slice(0, 4).map((b) => (
              <Badge key={b.code} variant="destructive" className="rounded-full text-[11px] font-normal">
                {b.label}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2 md:justify-end">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard/orders">All orders</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard/order-hub">Order hub</Link>
        </Button>
        {showCustomerLookup ? (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/order/${publicLookupToken}`} target="_blank" rel="noreferrer">
              Customer lookup
            </Link>
          </Button>
        ) : null}
      </div>
      </div>
      {nextActions?.blockingSummary || nextActions?.primary ? (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/[0.06] p-4 text-sm shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next step (all tabs)</p>
          {nextActions.blockingSummary ? (
            <p className="mt-2 font-medium text-amber-950">Blocked: {nextActions.blockingSummary}</p>
          ) : null}
          {nextActions.primary ? (
            <div className={nextActions.blockingSummary ? "mt-3" : "mt-2"}>
              <p className="font-medium text-foreground">{nextActions.primary.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{nextActions.primary.detail}</p>
              <Button asChild variant="link" className="h-auto px-0 pt-2 text-sm font-semibold">
                <Link href={nextActions.primary.href}>Open recommended action</Link>
              </Button>
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-amber-500/20 pt-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Shortcuts:</span>
            <Link href="/dashboard/integration-health" className="text-primary underline-offset-4 hover:underline">
              Integration health
            </Link>
            <Link href="/dashboard/error-recovery" className="text-primary underline-offset-4 hover:underline">
              Error recovery
            </Link>
            <Link href="/dashboard/product-mapping/suggestions" className="text-primary underline-offset-4 hover:underline">
              Product mapping
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
