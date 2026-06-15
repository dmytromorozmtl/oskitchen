import Link from "next/link";
import { BarChart3, ClipboardList, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { VendorPortalModuleId } from "@/lib/marketplace/vendor-portal-policy";
import type { VendorPortalHub } from "@/lib/marketplace/vendor-portal-types";
import { cn, formatCurrency } from "@/lib/utils";

const MODULE_ICONS: Record<VendorPortalModuleId, typeof ClipboardList> = {
  orders: ClipboardList,
  invoices: FileText,
  analytics: BarChart3,
};

const STATUS_VARIANT: Record<
  VendorPortalHub["modules"][number]["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  healthy: "default",
  watch: "secondary",
  critical: "destructive",
  idle: "outline",
};

type Props = {
  hub: VendorPortalHub;
};

export function VendorPortalHub({ hub }: Props) {
  return (
    <section className="space-y-6" data-testid="vendor-portal-hub">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Vendor Portal 2.0</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Orders inbox, commission invoices, and sales analytics in one supplier command surface.
          </p>
        </div>
        <Badge variant="outline" className="rounded-full">
          {hub.summary.ordersActive} active orders · {hub.summary.invoicesOutstanding} open invoices
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {hub.modules.map((module) => {
          const Icon = MODULE_ICONS[module.module];
          return (
            <Card key={module.module} className="border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <CardTitle className="text-base">{module.label}</CardTitle>
                      <CardDescription className="line-clamp-2">{module.headline}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={STATUS_VARIANT[module.status]} className="shrink-0 rounded-full capitalize">
                    {module.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {module.metrics.map((metric) => (
                    <div key={metric.label} className="rounded-lg bg-muted/50 px-2 py-2">
                      <p className="font-semibold tabular-nums">{metric.value}</p>
                      <p className="text-muted-foreground">{metric.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{module.recommendation}</p>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link href={module.href}>Open {module.label.toLowerCase()}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hub.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              hub.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/vendor/orders/${order.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{order.poNumber ?? order.id.slice(0, 8)}</p>
                    <p className="truncate text-xs text-muted-foreground">{order.buyerName}</p>
                  </div>
                  <span className="shrink-0 tabular-nums">{formatCurrency(order.total, order.currency)}</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hub.recentInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">Invoices appear after fulfilled orders.</p>
            ) : (
              hub.recentInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={invoice.href}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{invoice.invoiceNumber}</p>
                    <p className="truncate text-xs text-muted-foreground">{invoice.buyerName}</p>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0 rounded-full text-[10px] capitalize")}>
                    {invoice.status.toLowerCase().replace(/_/g, " ")}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Analytics highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hub.analyticsHighlights.map((highlight) => (
              <div key={highlight.id} className="rounded-lg border border-border/70 px-3 py-2">
                <p className="text-xs text-muted-foreground">{highlight.label}</p>
                <p className="text-lg font-semibold tabular-nums">{highlight.value}</p>
                <p className="text-xs text-muted-foreground">{highlight.detail}</p>
              </div>
            ))}
            <Button asChild variant="outline" size="sm" className="w-full rounded-full">
              <Link href="/vendor/analytics">Full analytics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
