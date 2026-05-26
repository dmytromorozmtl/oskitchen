import Link from "next/link";
import { format } from "date-fns";

import {
  createCustomerSubscriptionFormAction,
  setSubscriptionStatusFormAction,
} from "@/actions/customer-subscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function MealSubscriptionsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();

  const subs = await prisma.customerSubscription.findMany({
    where: { userId: dataUserId },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Meal subscriptions (legacy)</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          This page is preserved for backwards compatibility. New plans created here are mirrored into the{" "}
          <Link href="/dashboard/meal-plans" className="underline underline-offset-4">Meal Plans Command Center</Link>
          {" "}automatically.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Create plan</CardTitle>
          <CardDescription>Upserts a Kitchen customer by email automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCustomerSubscriptionFormAction} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="customerEmail">Customer email</Label>
              <Input id="customerEmail" name="customerEmail" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName">Name</Label>
              <Input id="customerName" name="customerName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planName">Plan name</Label>
              <Input id="planName" name="planName" placeholder="Family dinner bundle" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <select
                id="frequency"
                name="frequency"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue="WEEKLY"
              >
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Biweekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mealsPerWeek">Meals per cycle</Label>
              <Input id="mealsPerWeek" name="mealsPerWeek" type="number" min={1} defaultValue={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickupOrDelivery">Fulfillment</Label>
              <select
                id="pickupOrDelivery"
                name="pickupOrDelivery"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue="PICKUP"
              >
                <option value="PICKUP">Pickup</option>
                <option value="DELIVERY">Delivery</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextOrderDate">Next order date</Label>
              <Input id="nextOrderDate" name="nextOrderDate" type="date" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Preferences / dietary notes</Label>
              <Textarea id="notes" name="notes" rows={2} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="rounded-full">
                Save subscription
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {subs.map((s) => (
          <Card key={s.id} className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
              <div>
                <CardTitle className="text-lg">{s.planName}</CardTitle>
                <CardDescription>
                  {s.customer.name ?? "Guest"} · {s.customer.email}
                </CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full capitalize">
                {s.status.toLowerCase()}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
              <div>
                <p>
                  {s.mealsPerWeek} meals · {s.frequency.toLowerCase()} ·{" "}
                  {s.pickupOrDelivery === "DELIVERY" ? "Delivery" : "Pickup"}
                </p>
                {s.nextOrderDate ? (
                  <p>Next order {format(s.nextOrderDate, "MMM d, yyyy")}</p>
                ) : (
                  <p>No next date yet</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={setSubscriptionStatusFormAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="status" value="PAUSED" />
                  <Button type="submit" size="sm" variant="outline" className="rounded-full">
                    Pause
                  </Button>
                </form>
                <form action={setSubscriptionStatusFormAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="status" value="ACTIVE" />
                  <Button type="submit" size="sm" variant="outline" className="rounded-full">
                    Resume
                  </Button>
                </form>
                <form action={setSubscriptionStatusFormAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="status" value="CANCELLED" />
                  <Button type="submit" size="sm" variant="destructive" className="rounded-full">
                    Cancel
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {subs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No subscriptions yet — perfect for meal prep clubs or corporate lunch rotations.
        </p>
      ) : null}

      <p className="text-sm text-muted-foreground">
        CRM overlap lives on{" "}
        <Link href="/dashboard/customers" className="underline underline-offset-4">
          Customers
        </Link>
        .
      </p>
    </div>
  );
}
