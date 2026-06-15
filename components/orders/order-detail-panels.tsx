import Link from "next/link";

import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { OrderKitchenNotesEditor, OrderStatusActions } from "@/components/orders/order-detail-operations";
import { OrderWorkflowSummaryCard } from "@/components/orders/order-workflow-summary-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildFulfillmentContextFromOrder } from "@/services/orders/pos-order-normalization-service";
import { evaluateFulfillmentForOrder } from "@/services/fulfillment/fulfillment-requirement-service";
import { pickupDateDisplayLabel } from "@/lib/fulfillment/fulfillment-requirements";
import { buildLineItemRoutingRow } from "@/lib/orders/line-item-routing";
import { formatCurrency } from "@/lib/utils";
import type { loadOrderDetailPageData } from "@/services/orders/order-detail-service";

import { OrderStorefrontCommerceCard } from "./order-storefront-commerce-card";

type DetailData = NonNullable<Awaited<ReturnType<typeof loadOrderDetailPageData>>>;

export function OrderDetailPanels({ tab, data }: { tab: string; data: DetailData }) {
  const {
    order,
    activity,
    branches,
    nextActions,
    allowedTransitions,
    deliverySummary,
    lifecycleView,
    foodopsWorkflow,
    storefrontCommerce,
  } = data;
  const fulfillmentCtx = buildFulfillmentContextFromOrder(order);
  const fulfillmentEval = evaluateFulfillmentForOrder(fulfillmentCtx);
  const workRouting = order.productionWorkItems.map((w) => ({
    id: w.id,
    orderItemId: w.orderItemId,
    productId: w.productId,
  }));

  const branchLabel = (b: string) => {
    const map: Record<string, string> = {
      NEEDS_PRODUCTION: "Kitchen / production",
      NEEDS_FULFILLMENT_SCHEDULING: "Needs pickup or service date",
      NEEDS_ADDRESS: "Needs delivery address",
      NEEDS_PAYMENT: "Payment pending",
      NEEDS_CUSTOMER_INFO: "Customer details",
      CANCELLED: "Cancelled",
    };
    return map[b] ?? b.replace(/_/g, " ");
  };
  const active = [
    "overview",
    "items",
    "production",
    "packing",
    "fulfillment",
    "customer",
    "notes",
    "activity",
    "audit",
  ].includes(tab)
    ? tab
    : "overview";

  const pipelineCard = (
    <Card className="border-primary/25 bg-primary/[0.03]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Pipeline & next action</CardTitle>
        <CardDescription>
          FoodOps stage: <span className="font-medium text-foreground">{lifecycleView.stage.replace(/_/g, " ")}</span>
          . Status moves are validated and audited.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {nextActions.blockingSummary ? (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-sm">
            <p className="font-medium text-amber-950">Blocked: {nextActions.blockingSummary}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Resolve this before relying on kitchen or route timelines — the next action below is ordered by impact.
            </p>
          </div>
        ) : null}
        {lifecycleView.blockers.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {lifecycleView.blockers.map((b) => (
              <li key={b.code} className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{b.label}</span>
                  <Badge variant="outline" className="rounded-full text-[10px]">
                    {b.severity}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{b.explanation}</p>
                <Button asChild variant="link" className="h-auto p-0 text-xs">
                  <Link href={b.fixHref}>{b.recommendedAction}</Link>
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        {nextActions.primary ? (
          <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
            <p className="text-sm font-medium">{nextActions.primary.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{nextActions.primary.detail}</p>
            <Button asChild variant="link" className="h-auto px-0 pt-1 text-xs">
              <Link href={nextActions.primary.href}>Go</Link>
            </Button>
          </div>
        ) : null}
        {nextActions.secondaries.length > 0 ? (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {nextActions.secondaries.map((s) => (
              <li key={s.title}>
                <Link href={s.href} className="font-medium text-primary hover:underline">
                  {s.title}
                </Link>
                <span className="text-muted-foreground"> — {s.detail}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <OrderStatusActions orderId={order.id} allowedStatuses={allowedTransitions} />
      </CardContent>
    </Card>
  );

  const branchesCard =
    branches.length > 0 ? (
      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Operational branches</CardTitle>
          <CardDescription>Derived from fulfillment + payment signals — not a second status enum.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {branches.map((b) => (
            <Badge key={b} variant="outline" className="rounded-full">
              {branchLabel(b)}
            </Badge>
          ))}
        </CardContent>
      </Card>
    ) : null;

  if (active === "items") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
          <CardDescription>Menu links, SKUs, and custom lines.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="py-2 pr-2">Item</th>
                <th className="py-2 pr-2">SKU / code</th>
                <th className="py-2 pr-2">Ops route</th>
                <th className="py-2 pr-2">Kitchen</th>
                <th className="py-2 pr-2">Qty</th>
                <th className="py-2 pr-2">Unit</th>
                <th className="py-2">Line</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((li) => {
                const row = buildLineItemRoutingRow({
                  orderItemId: li.id,
                  productId: li.productId,
                  productHasRecipe: Boolean(li.product?.recipe),
                  productionWorkItems: workRouting,
                });
                return (
                  <tr key={li.id} className="border-b border-border/60">
                    <td className="py-2 pr-2">
                      <div className="font-medium">{li.title ?? li.product?.title ?? "Custom item"}</div>
                      {li.productId ? (
                        <Link
                          href={`/dashboard/products/${li.productId}`}
                          className="text-xs text-primary hover:underline"
                        >
                          Open menu item
                        </Link>
                      ) : null}
                      <p className="mt-1 text-[11px] text-muted-foreground">{row.explanation}</p>
                    </td>
                    <td className="py-2 pr-2 font-mono text-xs text-muted-foreground">
                      {li.sku ?? li.product?.barcode ?? "—"}
                    </td>
                    <td className="py-2 pr-2 text-xs">{row.routeLabel}</td>
                    <td className="py-2 pr-2 text-xs">{row.kitchen ? "Yes" : "No"}</td>
                    <td className="py-2 pr-2 tabular-nums">{li.quantity}</td>
                    <td className="py-2 pr-2 tabular-nums">
                      {li.unitPrice != null ? formatCurrency(Number(li.unitPrice)) : "—"}
                    </td>
                    <td className="py-2 tabular-nums">
                      {li.lineTotal != null ? formatCurrency(Number(li.lineTotal)) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    );
  }

  if (active === "production") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Production</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            {order.productionWorkItems.length} production work item
            {order.productionWorkItems.length === 1 ? "" : "s"} for {order.orderItems.length} line
            {order.orderItems.length === 1 ? "" : "s"}. Items without kitchen work are usually ready-made or not routed
            yet.
          </p>
          {order.productionWorkItems.length === 0 ? (
            <p className="text-muted-foreground">No production work items linked yet.</p>
          ) : (
            <ul className="space-y-1">
              {order.productionWorkItems.map((w) => (
                <li key={w.id} className="flex justify-between gap-2 border-b border-border/40 py-1 last:border-0">
                  <span className="min-w-0 truncate">{w.product?.title ?? "Item"}</span>
                  <Badge variant="outline" className="shrink-0 rounded-full text-[10px]">
                    {w.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/production">Open production</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (active === "packing") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Packing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {order.packingTasks.length === 0 ? (
            <p className="text-muted-foreground">
              No packing tasks. For counter pickup this is normal unless items require labels or outbound packaging.
            </p>
          ) : (
            <ul className="space-y-1">
              {order.packingTasks.map((t, idx) => (
                <li key={t.id} className="flex justify-between gap-2 border-b border-border/40 py-1 last:border-0">
                  <span className="text-xs text-muted-foreground">Packing task #{idx + 1}</span>
                  <Badge variant="outline" className="shrink-0 rounded-full text-[10px]">
                    {t.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/packing">Open packing</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (active === "fulfillment") {
    return (
      <div className="space-y-4">
        {storefrontCommerce ? <OrderStorefrontCommerceCard commerce={storefrontCommerce} /> : null}
        <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fulfillment & totals</CardTitle>
            <CardDescription>Pickup / delivery context.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Type:</span> {order.fulfillmentType}
            </p>
            <p>
              <span className="text-muted-foreground">Pickup / service date:</span>{" "}
              <span className="font-medium">{pickupDateDisplayLabel(fulfillmentCtx)}</span>
              {fulfillmentEval.intent === "PICKUP_NOW" ? (
                <span className="ml-2 text-xs text-muted-foreground">(same-day / counter)</span>
              ) : null}
            </p>
            {order.fulfillmentType === "DELIVERY" ? (
              <p>
                <span className="text-muted-foreground">Delivery address:</span>{" "}
                {deliverySummary ? (
                  <span>{deliverySummary}</span>
                ) : (
                  <span className="font-medium text-amber-900">
                    Not saved — add an address before marking ready or complete.
                  </span>
                )}
              </p>
            ) : null}
            <p>
              <span className="text-muted-foreground">Payment:</span> {order.paymentStatus ?? "—"} (
              {order.paymentMode ?? "—"})
            </p>
            <p>
              <span className="text-muted-foreground">Source:</span> {order.creationSource ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Channel:</span> {order.channelProvider ?? "—"}
            </p>
            <p className="pt-2 text-lg font-semibold tabular-nums">Total {formatCurrency(Number(order.total))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Routing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {order.fulfillmentType === "DELIVERY" ? (
              <>
                {order.deliveryStops.length === 0 ? (
                  <p className="text-muted-foreground">
                    No route stops yet. Add stops when you are ready to dispatch drivers.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {order.deliveryStops.map((s) => (
                      <li key={s.id} className="flex justify-between gap-2 border-b border-border/40 py-1 last:border-0">
                        <span className="text-muted-foreground">Stop #{s.sequence}</span>
                        <Badge variant="outline" className="shrink-0 rounded-full text-[10px]">
                          {s.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">
                Routing is not required for pickup or counter service. Route stops apply to delivery workflows.
              </p>
            )}
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/routes">Routes</Link>
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  if (active === "customer") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {order.kitchenCustomer ? (
            <>
              <p className="font-medium">
                {order.kitchenCustomer.displayName ?? order.kitchenCustomer.name ?? "Customer"}
              </p>
              <p className="text-muted-foreground">{order.kitchenCustomer.email}</p>
              <Button asChild variant="outline" size="sm" className="mt-2 rounded-full">
                <Link href={`/dashboard/customers/${order.kitchenCustomer.id}`}>CRM profile</Link>
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">No linked CRM customer.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (active === "notes") {
    return (
      <div className="space-y-4">
        {(order.allergyNotes || order.dietaryNotes || order.notes) && (
          <Card>
            <CardHeader>
              <CardTitle>Notes & dietary</CardTitle>
              <CardDescription>Customer-visible context — not payment data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {order.allergyNotes ? (
                <p>
                  <span className="font-medium text-amber-800">Allergies:</span> {order.allergyNotes}
                </p>
              ) : null}
              {order.dietaryNotes ? (
                <p>
                  <span className="font-medium">Dietary:</span> {order.dietaryNotes}
                </p>
              ) : null}
              {order.notes ? (
                <p>
                  <span className="font-medium">Customer notes:</span> {order.notes}
                </p>
              ) : null}
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Internal notes</CardTitle>
            <CardDescription>Staff-only. Audited without persisting raw bodies.</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderKitchenNotesEditor
              key={order.updatedAt.toISOString()}
              orderId={order.id}
              initialNotes={order.kitchenNotes}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (active === "activity") {
    return <ActivityTimeline items={activity} />;
  }

  if (active === "audit") {
    const auditHref = `/dashboard/audit-logs?entityType=Order&entityId=${encodeURIComponent(order.id)}&tab=security`;
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit trail</CardTitle>
          <CardDescription>
            Security and compliance log entries tied to this order. Entries respect workspace roles; sensitive fields
            are redacted where policy requires it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            The Activity tab shows operational timeline events. The audit center adds authentication, settings, and
            permission-sensitive changes that may reference this order.
          </p>
          <Button asChild className="rounded-full">
            <Link href={auditHref}>Open filtered audit log</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* overview */
  return (
    <div className="space-y-8">
      {storefrontCommerce ? <OrderStorefrontCommerceCard commerce={storefrontCommerce} /> : null}
      {pipelineCard}
      <OrderWorkflowSummaryCard orderId={order.id} steps={foodopsWorkflow.steps} />
      {branchesCard}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Line items</CardTitle>
            <CardDescription>See Items tab for full table with SKUs.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-2 pr-2">Item</th>
                  <th className="py-2 pr-2">Qty</th>
                  <th className="py-2">Line</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems.slice(0, 8).map((li) => (
                  <tr key={li.id} className="border-b border-border/60">
                    <td className="py-2 pr-2 font-medium">{li.title ?? li.product?.title ?? "Custom item"}</td>
                    <td className="py-2 pr-2 tabular-nums">{li.quantity}</td>
                    <td className="py-2 tabular-nums">
                      {li.lineTotal != null ? formatCurrency(Number(li.lineTotal)) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {order.orderItems.length > 8 ? (
              <Button asChild variant="link" className="mt-2 h-auto p-0 text-sm">
                <Link href={`/dashboard/orders/${order.id}?tab=items`}>View all items</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fulfillment snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Type:</span> {order.fulfillmentType}
            </p>
            <p>
              <span className="text-muted-foreground">Pickup / service date:</span>{" "}
              <span className="font-medium">{pickupDateDisplayLabel(fulfillmentCtx)}</span>
              {fulfillmentEval.intent === "PICKUP_NOW" ? (
                <span className="ml-2 text-xs text-muted-foreground">(same-day / counter)</span>
              ) : null}
            </p>
            <p className="text-lg font-semibold tabular-nums">Total {formatCurrency(Number(order.total))}</p>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href={`/dashboard/orders/${order.id}?tab=fulfillment`}>Fulfillment details</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {order.kitchenCustomer ? (
              <Link href={`/dashboard/customers/${order.kitchenCustomer.id}`} className="text-primary hover:underline">
                Open CRM profile
              </Link>
            ) : (
              <span className="text-muted-foreground">No linked CRM customer.</span>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Production</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {order.productionWorkItems.length} work item(s)
            <div className="mt-2">
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href={`/dashboard/orders/${order.id}?tab=production`}>Open tab</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Packing</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {order.packingTasks.length} task(s)
            <div className="mt-2">
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link href={`/dashboard/orders/${order.id}?tab=packing`}>Open tab</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Routing</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {order.deliveryStops.length} stop(s)
          </CardContent>
        </Card>
      </div>
      {order.importedFromExternal ? (
        <Card>
          <CardHeader>
            <CardTitle>Channel import</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>
              Status <Badge variant="outline">{order.importedFromExternal.syncStatus}</Badge> · Provider{" "}
              {order.importedFromExternal.provider}
            </p>
            <Button asChild variant="link" className="mt-2 h-auto p-0">
              <Link href="/dashboard/order-hub">Open order hub</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
      <ActivityTimeline title="Recent activity" items={activity} />
    </div>
  );
}
