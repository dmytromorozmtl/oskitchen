import Link from "next/link";
import { format, isPast } from "date-fns";
import { Bell } from "lucide-react";

import { completeCateringFollowUpFormAction } from "@/actions/catering-quotes";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function FollowUpsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const followUps = await prisma.cateringQuoteFollowUp.findMany({
    where: { quote: { userId: dataUserId }, status: "PENDING" },
    orderBy: { dueAt: "asc" },
    take: 200,
    include: {
      quote: { select: { id: true, quoteNumber: true, customerName: true, companyName: true } },
    },
  });

  if (followUps.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Follow-ups</h1>
          <p className="text-muted-foreground">Catering quote follow-ups assigned to your workspace.</p>
        </div>
        <EmptyState
          icon={Bell}
          title="No quote follow-ups due"
          description="Follow-ups appear when quotes are sent, viewed, expiring, or waiting for client response."
          primaryLabel="Open pipeline"
          primaryHref="/dashboard/catering-quotes/pipeline"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Follow-ups</h1>
        <p className="text-muted-foreground">Catering quote follow-ups assigned to your workspace.</p>
      </div>
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Pending ({followUps.length})</CardTitle>
          <CardDescription>Mark as done from this list — or open the quote for context.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {followUps.map((f) => {
            const overdue = isPast(f.dueAt);
            return (
              <div key={f.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2">
                <div className="flex flex-col gap-0.5">
                  <Link href={`/dashboard/catering-quotes/${f.quoteId}`} className="text-sm font-medium hover:underline">
                    {f.title}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {f.quote.quoteNumber ?? f.quote.id.slice(0, 8)} · {f.quote.companyName ?? f.quote.customerName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={overdue ? "destructive" : "outline"} className="rounded-full">
                    {format(f.dueAt, "MMM d, yyyy")}
                  </Badge>
                  <form action={completeCateringFollowUpFormAction}>
                    <input type="hidden" name="followUpId" value={f.id} />
                    <Button type="submit" size="sm" variant="secondary" className="rounded-full">
                      Mark done
                    </Button>
                  </form>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
