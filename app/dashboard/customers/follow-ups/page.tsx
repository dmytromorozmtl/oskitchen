import Link from "next/link";

import { updateCustomerFollowUpStatusFormAction } from "@/actions/customers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function CustomerFollowUpsPage() {
  const { userId } = await getTenantActor();
  const [open, completedRecently] = await Promise.all([
    prisma.customerFollowUp.findMany({
      where: { userId, status: { in: ["OPEN", "OVERDUE"] } },
      include: { customer: { select: { id: true, name: true, email: true, displayName: true } } },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.customerFollowUp.findMany({
      where: { userId, status: "COMPLETED" },
      include: { customer: { select: { id: true, name: true, email: true, displayName: true } } },
      orderBy: { completedAt: "desc" },
      take: 25,
    }),
  ]);

  const now = new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Customer follow-ups</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Quote follow-ups, VIP thank-yous, reactivation, allergy confirmations, service-issue follow-ups, and
          meal plan renewals — all assignable per customer.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Open follow-ups</CardTitle>
          <CardDescription>{open.length} due</CardDescription>
        </CardHeader>
        <CardContent>
          {open.length === 0 ? (
            <p className="text-sm text-muted-foreground">No follow-ups due. Add one from any customer page.</p>
          ) : (
            <ul className="space-y-2">
              {open.map((f) => {
                const overdue = f.dueAt && f.dueAt < now;
                return (
                  <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 p-3">
                    <div>
                      <Link href={`/dashboard/customers/${f.customer.id}`} className="font-medium hover:underline">
                        {f.customer.displayName ?? f.customer.name ?? f.customer.email}
                      </Link>
                      <p className="text-sm">{f.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.type} · due {f.dueAt?.toLocaleDateString() ?? "no date"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {overdue ? <Badge variant="destructive" className="rounded-full">Overdue</Badge> : null}
                      <form action={updateCustomerFollowUpStatusFormAction}>
                        <input type="hidden" name="followUpId" value={f.id} />
                        <input type="hidden" name="status" value="COMPLETED" />
                        <Button type="submit" size="sm">Mark done</Button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recently completed</CardTitle>
        </CardHeader>
        <CardContent>
          {completedRecently.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed follow-ups yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {completedRecently.map((f) => (
                <li key={f.id} className="flex justify-between border-b border-border/40 py-1">
                  <span>
                    <Link href={`/dashboard/customers/${f.customer.id}`} className="font-medium hover:underline">
                      {f.customer.displayName ?? f.customer.name ?? f.customer.email}
                    </Link>{" "}
                    — {f.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{f.completedAt?.toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
