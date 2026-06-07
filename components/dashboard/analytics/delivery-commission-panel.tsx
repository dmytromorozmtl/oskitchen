import Link from "next/link";

import { AnalyticsBars } from "@/components/dashboard/analytics-bars";
import { OwnYourChannelUpsellStrip } from "@/components/dashboard/analytics/own-your-channel-upsell-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ratePercentLabel } from "@/lib/analytics/operational-metrics";
import type { DeliveryCommissionTrackingModel } from "@/services/delivery/delivery-commission-tracking-service";
import { formatCurrency } from "@/lib/utils";

type Props = {
  snapshot: DeliveryCommissionTrackingModel;
};

export function DeliveryCommissionPanel({ snapshot }: Props) {
  return (
    <div className="space-y-6" data-delivery-commission-panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Delivery commission tracking</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Per-order marketplace commission rollups across DoorDash, Uber Eats, Grubhub, and Uber
            Direct. Amounts marked{" "}
            <span className="font-medium text-foreground">reported by channel</span> come from import
            payloads; others use an{" "}
            <span className="font-medium text-foreground">estimated benchmark</span> until you
            reconcile against your settlement statement. This view is{" "}
            <span className="font-medium text-foreground">not a tax invoice</span>.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/analytics/delivery-channels">Delivery channels</Link>
        </Button>
      </div>

      <OwnYourChannelUpsellStrip />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Delivery orders" value={snapshot.totalOrders} hint={snapshot.rangeLabel} />
        <Kpi label="Gross order value" value={formatCurrency(snapshot.grossTotal)} />
        <Kpi
          label="Commission total"
          value={formatCurrency(snapshot.commissionTotal)}
          hint={
            snapshot.effectiveCommissionRatePct == null
              ? undefined
              : `${ratePercentLabel(snapshot.effectiveCommissionRatePct)} effective`
          }
        />
        <Kpi label="Est. net payout" value={formatCurrency(snapshot.netPayoutTotal)} />
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardDescription>Data quality</CardDescription>
          <CardTitle className="text-lg">
            {snapshot.reportedOrderCount} reported · {snapshot.estimatedOrderCount} estimated
            benchmark
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Connect live marketplace imports and verify fees against each provider settlement
          statement. Benchmark rates are directional only.
        </CardContent>
      </Card>

      {snapshot.channels.length > 0 ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Commission by channel</CardTitle>
            <CardDescription>Aggregated per marketplace provider in the selected window.</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsBars
              rows={snapshot.channels.map((c) => ({
                label: c.label,
                value: c.commissionTotal,
              }))}
              formatValue={formatCurrency}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Per-order commission</CardTitle>
          <CardDescription>
            Latest imported delivery orders (up to 500) with commission source and estimated net
            payout.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {snapshot.orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No delivery marketplace orders in this window. Connect a sales channel and import
              orders to see commission tracking.
            </p>
          ) : (
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 font-medium">Channel</th>
                  <th className="py-2 pr-3 font-medium">Order</th>
                  <th className="py-2 pr-3 font-medium">Gross</th>
                  <th className="py-2 pr-3 font-medium">Rate</th>
                  <th className="py-2 pr-3 font-medium">Commission</th>
                  <th className="py-2 pr-3 font-medium">Net payout</th>
                  <th className="py-2 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.orders.map((row) => (
                  <tr
                    key={row.orderId}
                    className="border-b border-border/40"
                    data-delivery-commission-order-row={row.orderId}
                  >
                    <td className="py-2 pr-3 tabular-nums text-muted-foreground">
                      {row.createdAt.toISOString().slice(0, 10)}
                    </td>
                    <td className="py-2 pr-3 font-medium">{row.label}</td>
                    <td className="py-2 pr-3">
                      <Link
                        href={`/dashboard/orders/${row.orderId}`}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {row.externalOrderId ?? row.orderId.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 tabular-nums">{formatCurrency(row.grossTotal)}</td>
                    <td className="py-2 pr-3 tabular-nums">
                      {row.commissionRatePct == null ? "—" : ratePercentLabel(row.commissionRatePct)}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">{formatCurrency(row.commissionAmount)}</td>
                    <td className="py-2 pr-3 tabular-nums">{formatCurrency(row.netPayout)}</td>
                    <td className="py-2">
                      <CommissionSourceBadge source={row.source} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}

function CommissionSourceBadge({
  source,
}: {
  source: "reported" | "estimated" | "none";
}) {
  if (source === "reported") {
    return (
      <Badge variant="default" className="rounded-full text-[10px]">
        reported by channel
      </Badge>
    );
  }
  if (source === "estimated") {
    return (
      <Badge variant="secondary" className="rounded-full text-[10px]">
        estimated benchmark
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="rounded-full text-[10px]">
      none
    </Badge>
  );
}
