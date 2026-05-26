import { eachDayOfInterval, format, startOfDay, startOfWeek, subDays } from "date-fns";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ChefHat,
  CloudOff,
  Link2,
  Package,
  Plug,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { ActivationChecklistCard } from "@/components/dashboard/activation-checklist-card";
import {
  OperationalSignalBar,
  type OperationalAttentionItem,
} from "@/components/dashboard/operational-signal-bar";
import { OverviewCharts } from "@/components/dashboard/overview-charts";
import { ReopenSetupButton } from "@/components/dashboard/reopen-setup-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  externalOrderListWhereForOwner,
  externalProductListWhereForOwner,
} from "@/lib/scope/workspace-channel-scope";
import {
  integrationConnectionListWhereForOwner,
  menuListWhereForOwner,
  orderListWhereForOwner,
  productListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { BUSINESS_TYPE_LABELS, dashboardModeSummaryLines } from "@/lib/business-modes";
import { logger } from "@/lib/logger";
import { isPrismaDatabaseUnreachableError } from "@/lib/prisma-reachability";
import { checklistMenuLabel, checklistProductsLabel } from "@/lib/terminology";
import { formatCurrency } from "@/lib/utils";
import {
  countDeliveryOrdersWithoutRouteStops,
  countOrdersMissingRequiredServiceDate,
  countWebhookQueueSignals,
} from "@/services/today/today-operational-signals";
import { IntegrationStatus } from "@prisma/client";

type HomeDashboardSnapshot = Awaited<ReturnType<typeof loadHomeDashboardSnapshot>>;

async function loadHomeDashboardSnapshot(
  userId: string,
  range: { todayStart: Date; monthStart: Date; weekStart: Date },
) {
  const { todayStart, monthStart, weekStart } = range;
  const [menuWhere, productWhere, orderWhere, connectionWhere, externalProductWhere, externalOrderWhere] =
    await Promise.all([
      menuListWhereForOwner(userId),
      productListWhereForOwner(userId),
      orderListWhereForOwner(userId),
      integrationConnectionListWhereForOwner(userId),
      externalProductListWhereForOwner(userId),
      externalOrderListWhereForOwner(userId),
    ]);

  const [
    settings,
    menuCount,
    productCount,
    channelCount,
    integrationRows,
    activeOrders,
    ordersToday,
    revenueWeek,
    revenueAgg,
    tasks,
    deliveriesWeek,
    recentOrders,
    webhookSignals,
    unmatchedExternalProducts,
    failedExternalOrders,
    errorIntegrations,
    staleProduction,
    ordersMissingPickup,
    deliveryUndispatched,
    lowMarginSnapshots,
  ] = await Promise.all([
    prisma.kitchenSettings.findUnique({ where: { userId } }),
    prisma.menu.count({ where: menuWhere }),
    prisma.product.count({ where: productWhere }),
    prisma.orderChannel.count({ where: { userId, active: true } }),
    prisma.integrationConnection.findMany({
      where: connectionWhere,
      select: { status: true, provider: true, lastError: true },
    }),
    prisma.order.count({
      where: {
        AND: [orderWhere, { status: { notIn: ["COMPLETED", "CANCELLED"] } }],
      },
    }),
    prisma.order.count({
      where: { AND: [orderWhere, { createdAt: { gte: todayStart } }] },
    }),
    prisma.order.aggregate({
      where: {
        AND: [
          orderWhere,
          {
            createdAt: { gte: weekStart },
            status: { in: ["CONFIRMED", "PREPARING", "READY", "COMPLETED"] },
          },
        ],
      },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        AND: [
          orderWhere,
          {
            createdAt: { gte: monthStart },
            status: { in: ["CONFIRMED", "PREPARING", "READY", "COMPLETED"] },
          },
        ],
      },
      _sum: { total: true },
    }),
    prisma.productionTask.findMany({
      where: { product: productWhere },
      select: { cooked: true, packed: true, labeled: true },
    }),
    prisma.order.count({
      where: {
        AND: [
          orderWhere,
          { fulfillmentType: "DELIVERY", pickupDate: { gte: weekStart } },
        ],
      },
    }),
    prisma.order.findMany({
      where: { AND: [orderWhere, { createdAt: { gte: subDays(new Date(), 6) } }] },
      select: { createdAt: true },
    }),
    countWebhookQueueSignals(userId),
    prisma.externalProduct.count({
      where: { AND: [externalProductWhere, { mappedProductId: null }] },
    }),
    prisma.externalOrder.count({
      where: { AND: [externalOrderWhere, { syncStatus: "FAILED" }] },
    }),
    prisma.integrationConnection.count({
      where: { AND: [connectionWhere, { status: IntegrationStatus.ERROR }] },
    }),
    prisma.productionTask.count({
      where: {
        AND: [{ product: productWhere }, { cooked: false, packed: false }],
      },
    }),
    countOrdersMissingRequiredServiceDate(userId),
    countDeliveryOrdersWithoutRouteStops(userId),
    prisma.costSnapshot.count({
      where: {
        userId,
        marginPercent: { lt: 60 },
        createdAt: { gte: subDays(new Date(), 14) },
      },
    }),
  ]);

  const failedWebhooks = webhookSignals.unprocessedTotal;
  const webhooksNeedingAttention = webhookSignals.needingAttention;

  return {
    settings,
    menuCount,
    productCount,
    channelCount,
    integrationRows,
    activeOrders,
    ordersToday,
    revenueWeek,
    revenueAgg,
    tasks,
    deliveriesWeek,
    recentOrders,
    failedWebhooks,
    webhooksNeedingAttention,
    unmatchedExternalProducts,
    failedExternalOrders,
    errorIntegrations,
    staleProduction,
    ordersMissingPickup,
    deliveryUndispatched,
    lowMarginSnapshots,
  };
}

function DashboardDatabaseUnavailable() {
  return (
    <div className="space-y-6">
      <Card className="border-amber-500/40 bg-amber-500/5 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CloudOff className="h-5 w-5 text-amber-700" />
            Can&apos;t reach your database
          </CardTitle>
          <CardDescription className="space-y-2 text-base text-muted-foreground">
            <p>
              KitchenOS could not open a connection to Postgres (Supabase pooler). This is usually a
              network issue, a paused Supabase project, or a misconfigured{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-sm">DATABASE_URL</code>.
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm">
              <li>Confirm the Supabase project is active (free tier projects pause after inactivity).</li>
              <li>Retry from a network that allows outbound TLS to your pooler host.</li>
              <li>
                If migrations work but the app fails, compare session vs transaction pooler ports in{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-sm">docs/SUPABASE_POOLER_SETUP.md</code>.
              </li>
            </ul>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="default" className="rounded-full">
            <Link href="/dashboard">Reload dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export async function HomeOverview({ userId }: { userId: string }) {
  const todayStart = startOfDay(new Date());
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  let snapshot: HomeDashboardSnapshot;
  try {
    snapshot = await loadHomeDashboardSnapshot(userId, { todayStart, monthStart, weekStart });
  } catch (e) {
    if (isPrismaDatabaseUnreachableError(e)) {
      logger.warn("home-overview: database unreachable", e);
      return <DashboardDatabaseUnavailable />;
    }
    throw e;
  }

  const {
    settings,
    menuCount,
    productCount,
    channelCount,
    integrationRows,
    activeOrders,
    ordersToday,
    revenueWeek,
    revenueAgg,
    tasks,
    deliveriesWeek,
    recentOrders,
    failedWebhooks,
    webhooksNeedingAttention,
    unmatchedExternalProducts,
    failedExternalOrders,
    errorIntegrations,
    staleProduction,
    ordersMissingPickup,
    deliveryUndispatched,
    lowMarginSnapshots,
  } = snapshot;

  const connectedHealthy = integrationRows.filter(
    (r) => r.status === IntegrationStatus.CONNECTED,
  ).length;

  const completion =
    tasks.length === 0
      ? 0
      : Math.round(
          (tasks.reduce(
            (acc, t) =>
              acc +
              (Number(t.cooked) + Number(t.packed) + Number(t.labeled)) / 3,
            0,
          ) /
            tasks.length) *
            100,
        );

  const days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const trend = days.map((day) => {
    const label = format(day, "EEE");
    const key = format(day, "yyyy-MM-dd");
    const value = recentOrders.filter(
      (o) => format(o.createdAt, "yyyy-MM-dd") === key,
    ).length;
    return { label, value };
  });

  const checklist = [
    {
      done: Boolean(settings?.businessName?.trim()),
      label: "Business profile saved",
      href: "/dashboard/settings",
    },
    {
      done: menuCount > 0,
      label: checklistMenuLabel(settings?.businessType),
      href: "/dashboard/menus",
    },
    {
      done: productCount > 0,
      label: checklistProductsLabel(settings?.businessType),
      href: "/dashboard/products",
    },
    {
      done: channelCount > 0 || integrationRows.length > 0,
      label: "Sales channels flagged or connected",
      href: "/dashboard/sales-channels",
    },
  ];

  const attention: OperationalAttentionItem[] = [];
  if (unmatchedExternalProducts > 0) {
    attention.push({
      title: "Incoming items need mapping",
      detail: `${unmatchedExternalProducts} catalog row(s) aren’t linked to your menu yet.`,
      href: "/dashboard/order-hub",
      priority: 20,
    });
  }
  if (failedExternalOrders > 0) {
    attention.push({
      title: "Failed incoming orders",
      detail: `${failedExternalOrders} external row(s) need a retry or fix.`,
      href: "/dashboard/order-hub",
      priority: 10,
    });
  }
  if (errorIntegrations > 0) {
    attention.push({
      title: "Sales channel errors",
      detail: "A connected store returned errors — open Sales channels to review.",
      href: "/dashboard/sales-channels",
      priority: 12,
    });
  }
  if (webhooksNeedingAttention > 0) {
    attention.push({
      title: "Webhook processing issues",
      detail: `${webhooksNeedingAttention} queued event(s) record an error or failed signature validation.`,
      href: "/dashboard/sales-channels/webhooks",
      priority: 9,
    });
  } else if (failedWebhooks > 0) {
    attention.push({
      title: "Webhook backlog",
      detail: `${failedWebhooks} event(s) are waiting to process (no errors recorded yet).`,
      href: "/dashboard/sales-channels/webhooks",
      priority: 11,
    });
  }
  if (ordersMissingPickup > 0) {
    attention.push({
      title: "Orders missing required service / pickup date",
      detail: `${ordersMissingPickup} active order(s) need a scheduled date for their fulfillment profile.`,
      href: "/dashboard/order-hub?tab=missing_fulfillment_info",
      priority: 18,
    });
  }
  if (deliveryUndispatched > 0) {
    attention.push({
      title: "Delivery orders without route stops",
      detail: `${deliveryUndispatched} in-flight delivery order(s) have no route stops assigned yet.`,
      href: "/dashboard/routes",
      priority: 19,
    });
  }
  if (staleProduction > 5 && completion < 60) {
    attention.push({
      title: "Kitchen work catching up",
      detail: "Several dishes haven’t moved through cook/pack yet — check Production.",
      href: "/dashboard/production",
      priority: 22,
    });
  }
  if (lowMarginSnapshots > 0) {
    attention.push({
      title: "Margin math flagged SKUs",
      detail: `${lowMarginSnapshots} recent cost snapshot(s) slipped below the 60% modeled guardrail.`,
      href: "/dashboard/costing",
      priority: 25,
    });
  }

  attention.sort((a, b) => a.priority - b.priority);

  const brand = settings?.businessName?.trim() || "your kitchen";

  const mode = settings?.businessType;
  const modeLines = dashboardModeSummaryLines(mode);

  return (
    <div className="space-y-8">
      <ActivationChecklistCard userId={userId} />

      {mode ? (
        <Card className="border-primary/20 bg-primary/[0.04] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Operating mode · {BUSINESS_TYPE_LABELS[mode]}
            </CardTitle>
            <CardDescription>
              {modeLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Today in {brand}</h1>
            {settings?.demoMode ? (
              <Badge variant="secondary" className="rounded-full">
                Demo workspace
              </Badge>
            ) : null}
          </div>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Health snapshot across orders, incoming channels, and kitchen throughput — built for
            how food teams actually operate.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Button asChild variant="premium" className="rounded-full">
            <Link href="/dashboard/today">Open Today</Link>
          </Button>
          <ReopenSetupButton />
        </div>
      </div>

      <OperationalSignalBar
        items={attention}
        activeOrders={activeOrders}
        ordersToday={ordersToday}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Today&apos;s orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{ordersToday}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Revenue (week)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {formatCurrency(Number(revenueWeek._sum.total ?? 0))}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Kitchen work progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{completion}%</p>
            <p className="mt-1 text-xs text-muted-foreground">Cook / pack / label avg.</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Active orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{activeOrders}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Healthy connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{connectedHealthy}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Of {integrationRows.length} configured
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Webhooks in queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{failedWebhooks}</p>
            {webhooksNeedingAttention > 0 ? (
              <p className="mt-1 text-xs text-amber-700">
                {webhooksNeedingAttention} with errors or invalid signature
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">Awaiting worker</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card id="operational-alerts" className="border-border/80 bg-card/90 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              What needs attention
            </CardTitle>
            <CardDescription>
              Prioritized operational gaps — empty means you&apos;re clear for now.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {attention.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing urgent surfaced. Keep an eye on incoming orders as channels spin up.
              </p>
            ) : (
              attention.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Launch checklist</CardTitle>
            <CardDescription>Finish these to look great on client demos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklist.map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-muted/50"
              >
                <span
                  className={
                    c.done
                      ? "flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs text-white"
                      : "flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-muted-foreground/50 text-xs text-muted-foreground"
                  }
                >
                  {c.done ? "✓" : ""}
                </span>
                <span className={c.done ? "text-muted-foreground line-through" : ""}>
                  {c.label}
                </span>
              </Link>
            ))}
            <Button asChild variant="outline" size="sm" className="mt-2 w-full rounded-full">
              <Link href="/demo">Open demo hub</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Button asChild variant="secondary" className="h-auto justify-start gap-3 rounded-2xl py-4">
            <Link href="/dashboard/menus">
              <ShoppingBag className="h-5 w-5" />
              <span className="text-left">
                <span className="block font-semibold">New weekly menu</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Launch the next preorder window
                </span>
              </span>
            </Link>
          </Button>
          <Button asChild variant="secondary" className="h-auto justify-start gap-3 rounded-2xl py-4">
            <Link href="/dashboard/products">
              <Package className="h-5 w-5" />
              <span className="text-left">
                <span className="block font-semibold">Add menu item</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Plates, desserts, drinks
                </span>
              </span>
            </Link>
          </Button>
          <Button asChild variant="secondary" className="h-auto justify-start gap-3 rounded-2xl py-4">
            <Link href="/dashboard/orders/new">
              <Truck className="h-5 w-5" />
              <span className="text-left">
                <span className="block font-semibold">Manual order</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Phone / walk-up capture
                </span>
              </span>
            </Link>
          </Button>
          <Button asChild variant="secondary" className="h-auto justify-start gap-3 rounded-2xl py-4">
            <Link href="/dashboard/sales-channels">
              <Plug className="h-5 w-5" />
              <span className="text-left">
                <span className="block font-semibold">Sales channels</span>
                <span className="text-xs font-normal text-muted-foreground">
                  WooCommerce · Shopify · Uber
                </span>
              </span>
            </Link>
          </Button>
          <Button asChild variant="secondary" className="h-auto justify-start gap-3 rounded-2xl py-4">
            <Link href="/dashboard/kitchen">
              <ChefHat className="h-5 w-5" />
              <span className="text-left">
                <span className="block font-semibold">Kitchen screen</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Fullscreen line view
                </span>
              </span>
            </Link>
          </Button>
          <Button asChild variant="secondary" className="h-auto justify-start gap-3 rounded-2xl py-4">
            <Link href="/dashboard/order-hub">
              <Link2 className="h-5 w-5" />
              <span className="text-left">
                <span className="block font-semibold">Order hub</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Every channel in one stack
                </span>
              </span>
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Order rhythm (7 days)
          </CardTitle>
          <CardDescription>
            MTD revenue {formatCurrency(Number(revenueAgg._sum.total ?? 0))} · {deliveriesWeek}{" "}
            delivery rows this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OverviewCharts fulfillmentTrend={trend} />
        </CardContent>
      </Card>
    </div>
  );
}
