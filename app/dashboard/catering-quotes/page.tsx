import Link from "next/link";
import { format } from "date-fns";
import { ChefHat } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  CATERING_QUOTE_STATUS_BADGE,
  CATERING_QUOTE_STATUS_LABEL,
} from "@/lib/catering/quote-status";
import { cateringTerminologyForMode } from "@/lib/catering/quote-types";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { listQuotesForUser, loadCateringQuoteKpis } from "@/services/catering/quote-service";

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

export default async function CateringQuotesOverviewPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: dataUserId },
    include: { kitchenSettings: { select: { businessType: true } } },
  });
  const terminology = cateringTerminologyForMode(profile?.kitchenSettings?.businessType ?? null);
  const [quotes, kpis] = await Promise.all([
    listQuotesForUser({ userId: dataUserId }, { take: 20 }),
    loadCateringQuoteKpis(dataUserId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{terminology.pageTitle}</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">{terminology.pageSubtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/catering-quotes/templates">Quote templates</Link>
          </Button>
          <Button asChild className="rounded-full" variant="premium">
            <Link href="/dashboard/catering-quotes/new">{terminology.newCtaLabel}</Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Open quotes" value={kpis.open} hint="Drafts, ready, sent, viewed, revision" />
        <Kpi label="Drafts" value={kpis.draft} />
        <Kpi label="Sent / viewed" value={kpis.sent} />
        <Kpi label="Accepted" value={kpis.accepted} />
        <Kpi label="Expiring soon" value={kpis.expiringSoon} hint="Within 7 days" />
      </section>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Follow-ups due" value={kpis.followUpsDue} hint="Pending, ≤ 7d" />
        <Kpi label="Pipeline value" value={formatCurrency(kpis.pipelineValueCents / 100)} />
        <Kpi label="Accepted revenue" value={formatCurrency(kpis.acceptedRevenueCents / 100)} />
        <Kpi label="Avg quote value" value={formatCurrency(kpis.avgValueCents / 100)} />
      </section>

      {quotes.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="No catering quotes yet"
          description="Create proposals for corporate lunches, events, boxed meals, private parties, bakery orders, or custom catering requests."
          primaryLabel="Create quote"
          primaryHref="/dashboard/catering-quotes/new"
          secondaryLabel="Use template"
          secondaryHref="/dashboard/catering-quotes/templates"
        />
      ) : (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Latest quotes</CardTitle>
            <CardDescription>
              Track the freshest 20 quotes. Open one to manage lines, fees, follow-ups, and conversion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quotes.map((q) => (
              <Link
                key={q.id}
                href={`/dashboard/catering-quotes/${q.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2 transition-colors hover:bg-muted/40"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {q.quoteNumber ?? q.id.slice(0, 8)} · {q.customerName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {q.companyName ? `${q.companyName} · ` : ""}
                    {q.eventDate ? format(q.eventDate, "MMM d, yyyy") : "No date"}
                    {q.guestCount ? ` · ${q.guestCount} guests` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={CATERING_QUOTE_STATUS_BADGE[q.status]} className="rounded-full">
                    {CATERING_QUOTE_STATUS_LABEL[q.status]}
                  </Badge>
                  <span className="text-sm font-medium tabular-nums">
                    {formatCurrency(Number(q.total.toString()))}
                  </span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
