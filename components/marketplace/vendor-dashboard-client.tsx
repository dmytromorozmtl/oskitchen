"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { MarketplaceOrderStatusBadge } from "@/components/marketplace/marketplace-order-status-badge";
import { VendorDashboardOnboardingWizard } from "@/components/marketplace/vendor-dashboard-onboarding-wizard";
import { MARKETPLACE_MOBILE_CARD_CLASS } from "@/lib/marketplace/mobile-ui";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { VendorDashboardModel } from "@/services/marketplace/vendor-dashboard-service";

export function VendorDashboardClient({ model }: { model: VendorDashboardModel }) {
  return (
    <div className="space-y-6">
      <VendorDashboardOnboardingWizard snapshot={model.onboarding} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Orders (30d)" value={String(model.ordersTotal)} hint={`${model.ordersActive} active`} />
        <MetricCard
          label="Revenue (30d)"
          value={formatCurrency(model.revenueMonth, "USD")}
          hint={`Pending ${formatCurrency(model.revenuePending, "USD")}`}
        />
        <MetricCard
          label="Avg order"
          value={formatCurrency(model.avgOrderValue, "USD")}
          hint={`${model.ordersPending} awaiting action`}
        />
        <MetricCard
          label="Rating"
          value={model.avgRating != null ? `${model.avgRating} / 5` : "—"}
          hint={`${model.reviewCount} reviews · ${model.unreadMessages} unread msgs`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Pending orders" value={String(model.ordersPending)} hint="Needs confirmation" />
        <MetricCard label="Low stock SKUs" value={String(model.lowStockCount)} hint="At or below 5 units" />
        <MetricCard label="Unread messages" value={String(model.unreadMessages)} hint="Buyer conversations" />
      </div>

      {model.pendingActions.length > 0 ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Pending actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {model.pendingActions.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/70 px-3 py-2 hover:bg-muted/40"
              >
                <div>
                  <p className="text-sm font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
                <Badge variant="outline" className="shrink-0 rounded-full capitalize">
                  {action.kind}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Revenue · last 30 days</CardTitle>
          <CardDescription>Daily gross from marketplace purchase orders</CardDescription>
        </CardHeader>
        <CardContent className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={model.revenueTrend}>
              <defs>
                <linearGradient id="vendorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5F1F" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#FF5F1F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#FF5F1F"
                fill="url(#vendorRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Top products (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            {model.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales yet.</p>
            ) : (
              <>
                <div className="space-y-3 lg:hidden">
                  {model.topProducts.map((product) => (
                    <div key={product.id} className={MARKETPLACE_MOBILE_CARD_CLASS}>
                      <Link
                        href={`/vendor/products?highlight=${product.id}`}
                        className="font-medium hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                      <div className="mt-2 flex flex-wrap justify-between gap-2 text-sm">
                        <span>{product.unitsSold} units</span>
                        <span>{formatCurrency(product.revenue, "USD")}</span>
                        <span>Stock {product.stockQty}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden lg:block">
                  <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {model.topProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Link href={`/vendor/products?highlight=${product.id}`} className="font-medium hover:underline">
                          {product.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                      </TableCell>
                      <TableCell>{product.unitsSold}</TableCell>
                      <TableCell>{formatCurrency(product.revenue, "USD")}</TableCell>
                      <TableCell>{product.stockQty}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent orders</CardTitle>
            <Link href="/vendor/orders" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {model.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <>
                <div className="space-y-3 lg:hidden">
                  {model.recentOrders.map((order) => (
                    <div key={order.id} className={MARKETPLACE_MOBILE_CARD_CLASS}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/vendor/orders/${order.id}`}
                            className="font-medium hover:underline"
                          >
                            {order.poNumber ?? order.id.slice(0, 8)}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {order.buyerWorkspaceName ?? "—"}
                          </p>
                        </div>
                        <MarketplaceOrderStatusBadge status={order.status} />
                      </div>
                      <p className="mt-2 text-sm font-semibold">
                        {formatCurrency(order.total, order.currency as "USD")}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PO</TableHead>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {model.recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Link href={`/vendor/orders/${order.id}`} className="font-medium hover:underline">
                              {order.poNumber ?? order.id.slice(0, 8)}
                            </Link>
                          </TableCell>
                          <TableCell className="text-xs">{order.buyerWorkspaceName ?? "—"}</TableCell>
                          <TableCell>
                            <MarketplaceOrderStatusBadge status={order.status} />
                          </TableCell>
                          <TableCell>{formatCurrency(order.total, order.currency as "USD")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
