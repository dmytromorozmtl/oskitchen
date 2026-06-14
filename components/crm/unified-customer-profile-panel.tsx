"use client";

import Link from "next/link";
import { Gift, History, ShoppingBag, Star, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UnifiedCustomerProfileSnapshot } from "@/lib/crm/unified-profile-types";
import { formatCurrency } from "@/lib/utils";

type Props = {
  snapshot: UnifiedCustomerProfileSnapshot;
};

function TagList({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <Badge key={item} variant="secondary" className="rounded-full">
          {item}
        </Badge>
      ))}
    </div>
  );
}

export function UnifiedCustomerProfilePanel({ snapshot }: Props) {
  return (
    <div className="space-y-6" data-testid="unified-customer-profile-panel">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lifetime value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(snapshot.metrics.lifetimeValueUsd)}
            </p>
            <p className="text-xs text-muted-foreground">{snapshot.metrics.totalOrders} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average order</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(snapshot.metrics.averageOrderValueUsd)}
            </p>
            <p className="text-xs text-muted-foreground">Per completed order</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Loyalty points</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-2xl font-bold tabular-nums"
              data-testid="crm-loyalty-points-balance"
            >
              {snapshot.loyalty?.pointsBalance ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">
              {snapshot.loyalty ? `${snapshot.loyalty.tier} tier` : "No loyalty account"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Meal plans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.mealPlanCount}</p>
            <p className="text-xs text-muted-foreground">Active subscriptions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Identity &amp; preferences
            </CardTitle>
            <CardDescription>
              {snapshot.identity.type} · {snapshot.identity.source} · {snapshot.identity.status}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium">{snapshot.identity.displayName}</p>
              <p className="text-muted-foreground">{snapshot.identity.email}</p>
              {snapshot.identity.phone ? (
                <p className="text-muted-foreground">{snapshot.identity.phone}</p>
              ) : null}
              {snapshot.identity.companyName ? (
                <p className="text-muted-foreground">{snapshot.identity.companyName}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">Allergies</p>
              <TagList items={snapshot.preferences.allergies} empty="None recorded" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">Dietary</p>
              <TagList items={snapshot.preferences.dietary} empty="None recorded" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">Favorites</p>
              <TagList items={snapshot.preferences.favorites} empty="None recorded" />
            </div>
            {snapshot.segments.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">Segments</p>
                <TagList items={snapshot.segments} empty="" />
              </div>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Email marketing: {snapshot.preferences.marketingConsent ? "granted" : "not granted"} · SMS:{" "}
              {snapshot.preferences.smsConsent ? "granted" : "not granted"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-4 w-4" />
              Loyalty
            </CardTitle>
            <CardDescription>Points balance and recent earn/redeem activity</CardDescription>
          </CardHeader>
          <CardContent>
            {!snapshot.loyalty ? (
              <p className="text-sm text-muted-foreground">No loyalty account yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {snapshot.loyalty.recentTransactions.length === 0 ? (
                  <li className="text-muted-foreground">No transactions yet.</li>
                ) : (
                  snapshot.loyalty.recentTransactions.map((tx) => (
                    <li
                      key={tx.id}
                      className="flex items-center justify-between border-b border-border/40 py-2 last:border-0"
                    >
                      <span>
                        {tx.type} · {tx.points > 0 ? "+" : ""}
                        {tx.points} pts
                        {tx.notes ? ` · ${tx.notes}` : ""}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(tx.createdAtIso).toLocaleDateString()}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="h-4 w-4" />
            Order history
          </CardTitle>
          <CardDescription>
            Last {snapshot.orders.length} orders · first{" "}
            {snapshot.metrics.firstOrderAtIso
              ? new Date(snapshot.metrics.firstOrderAtIso).toLocaleDateString()
              : "—"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {snapshot.orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders on file.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr className="border-b border-border/70">
                    <th className="py-2 pr-2">Order</th>
                    <th className="py-2 pr-2">Status</th>
                    <th className="py-2 pr-2">Fulfillment</th>
                    <th className="py-2 pr-2 text-right">Total</th>
                    <th className="py-2 pr-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.orders.map((order) => (
                    <tr key={order.id} className="border-b border-border/40">
                      <td className="py-2 pr-2">
                        <Link href={order.href} className="font-medium hover:underline">
                          {order.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="py-2 pr-2 text-muted-foreground">{order.status}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{order.fulfillmentType}</td>
                      <td className="py-2 pr-2 text-right tabular-nums">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-2 pr-2 text-muted-foreground">
                        {new Date(order.createdAtIso).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" />
            Activity history
          </CardTitle>
          <CardDescription>Timeline of CRM events across orders, notes, and lifecycle</CardDescription>
        </CardHeader>
        <CardContent>
          {snapshot.history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No timeline events yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {snapshot.history.map((event) => (
                <li
                  key={event.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 py-2 last:border-0"
                >
                  <span>
                    <Badge variant="outline" className="mr-2 rounded-full">
                      {event.eventType}
                    </Badge>
                    {event.summary ?? "—"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.createdAtIso).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={`/dashboard/customers/${snapshot.customerId}`}>
            <Gift className="mr-2 h-4 w-4" />
            Full CRM profile
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/dashboard/customers/loyalty">Loyalty program</Link>
        </Button>
      </div>
    </div>
  );
}
