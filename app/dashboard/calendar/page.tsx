import Link from "next/link";
import { addDays, eachDayOfInterval, format, startOfDay } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getCachedOrderListWhere } from "@/lib/scope/cached-workspace-order-scope";
import { prisma } from "@/lib/prisma";

type CalEvent = {
  key: string;
  day: string;
  title: string;
  detail: string;
  href: string;
  kind: string;
};

export default async function OperationsCalendarPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const orderWhere = await getCachedOrderListWhere();
  const start = startOfDay(new Date());
  const end = addDays(start, 14);

  const [orders, tasks, routes, quotes, subs] = await Promise.all([
    prisma.order.findMany({
      where: {
        AND: [
          orderWhere,
          {
            pickupDate: { gte: start, lte: end },
            status: { not: "CANCELLED" },
          },
        ],
      },
      select: {
        id: true,
        customerName: true,
        pickupDate: true,
        fulfillmentType: true,
      },
      take: 300,
    }),
    prisma.kitchenTask.findMany({
      where: {
        userId: dataUserId,
        dueAt: { gte: start, lte: addDays(end, 1) },
        status: { notIn: ["DONE", "CANCELLED"] },
      },
      take: 120,
    }),
    prisma.deliveryRoute.findMany({
      where: { userId: dataUserId, routeDate: { gte: start, lte: end } },
      select: { id: true, routeDate: true, totalStops: true, status: true },
      take: 40,
    }),
    prisma.cateringQuote.findMany({
      where: {
        userId: dataUserId,
        eventDate: { gte: start, lte: end },
      },
      select: { id: true, customerName: true, eventDate: true, status: true },
      take: 40,
    }),
    prisma.customerSubscription.findMany({
      where: {
        userId: dataUserId,
        status: "ACTIVE",
        nextOrderDate: { gte: start, lte: end },
      },
      include: { customer: true },
      take: 80,
    }),
  ]);

  const events: CalEvent[] = [];

  for (const o of orders) {
    if (!o.pickupDate) continue;
    const day = format(o.pickupDate, "yyyy-MM-dd");
    events.push({
      key: `order-${o.id}`,
      day,
      title: `Order · ${o.customerName}`,
      detail: o.fulfillmentType === "DELIVERY" ? "Delivery" : "Pickup",
      href: "/dashboard/orders",
      kind: "order",
    });
  }
  for (const t of tasks) {
    if (!t.dueAt) continue;
    const day = format(t.dueAt, "yyyy-MM-dd");
    events.push({
      key: `task-${t.id}`,
      day,
      title: `Task · ${t.title}`,
      detail: t.taskType,
      href: "/dashboard/tasks",
      kind: "task",
    });
  }
  for (const r of routes) {
    const day = format(r.routeDate, "yyyy-MM-dd");
    events.push({
      key: `route-${r.id}`,
      day,
      title: `Delivery route`,
      detail: `${r.totalStops} stops · ${r.status}`,
      href: "/dashboard/routes",
      kind: "route",
    });
  }
  for (const q of quotes) {
    if (!q.eventDate) continue;
    const day = format(q.eventDate, "yyyy-MM-dd");
    events.push({
      key: `quote-${q.id}`,
      day,
      title: `Catering · ${q.customerName}`,
      detail: q.status,
      href: "/dashboard/catering",
      kind: "catering",
    });
  }
  for (const s of subs) {
    if (!s.nextOrderDate) continue;
    const day = format(s.nextOrderDate, "yyyy-MM-dd");
    events.push({
      key: `sub-${s.id}`,
      day,
      title: `Subscription · ${s.planName}`,
      detail: s.customer.email,
      href: "/dashboard/meal-subscriptions",
      kind: "subscription",
    });
  }

  const days = eachDayOfInterval({ start, end });
  const byDay = new Map<string, CalEvent[]>();
  for (const e of events) {
    const list = byDay.get(e.day) ?? [];
    list.push(e);
    byDay.set(e.day, list);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Operations calendar</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Two-week agenda merging pickups, routes, tasks, catering holds, and subscription renewal
          dates — month + drag views arrive later.
        </p>
      </div>

      <div className="space-y-6">
        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const list = byDay.get(key) ?? [];
          return (
            <Card key={key} className="border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{format(d, "EEEE · MMM d")}</CardTitle>
                <CardDescription>{list.length} events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {list.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Quiet day.</p>
                ) : (
                  list.map((e) => (
                    <Link
                      key={e.key}
                      href={e.href}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 px-3 py-2 text-sm hover:bg-muted/40"
                    >
                      <span className="font-medium">{e.title}</span>
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-full capitalize">
                          {e.kind}
                        </Badge>
                        <span className="text-muted-foreground">{e.detail}</span>
                      </span>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
