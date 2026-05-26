import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { CATERING_EVENT_TYPE_LABEL } from "@/lib/catering/quote-types";
import { decimalToNumber } from "@/lib/catering/quote-calculations";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { loadCateringQuoteKpis } from "@/services/catering/quote-service";

export default async function ReportsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const [kpis, byEventType, byBrand, lost, expiring] = await Promise.all([
    loadCateringQuoteKpis(dataUserId),
    prisma.cateringQuote.groupBy({
      by: ["eventType"],
      where: { userId: dataUserId },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.cateringQuote.groupBy({
      by: ["brandId"],
      where: { userId: dataUserId, brandId: { not: null } },
      _sum: { total: true },
      _count: { _all: true },
    }),
    prisma.cateringQuote.findMany({
      where: { userId: dataUserId, status: { in: ["REJECTED", "DECLINED", "EXPIRED"] } },
      orderBy: { updatedAt: "desc" },
      take: 25,
      select: { id: true, quoteNumber: true, customerName: true, total: true, status: true },
    }),
    prisma.cateringQuote.findMany({
      where: {
        userId: dataUserId,
        status: { in: ["SENT", "VIEWED", "READY_TO_SEND", "NEEDS_REVISION"] },
        validUntil: { gte: new Date(), lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      },
      take: 25,
      select: { id: true, quoteNumber: true, customerName: true, total: true, validUntil: true },
    }),
  ]);
  const totalQuotes = byEventType.reduce((a, r) => a + r._count._all, 0);
  const acceptedAgg = await prisma.cateringQuote.count({
    where: { userId: dataUserId, status: { in: ["ACCEPTED", "CONVERTED_TO_ORDER"] } },
  });
  const conversionRate = totalQuotes > 0 ? Math.round((acceptedAgg / totalQuotes) * 100) : 0;

  const brandIds = byBrand.map((b) => b.brandId).filter((id): id is string => !!id);
  const brands = brandIds.length
    ? await prisma.brand.findMany({ where: { id: { in: brandIds } }, select: { id: true, name: true } })
    : [];
  const brandName = (id: string | null) => brands.find((b) => b.id === id)?.name ?? "(no brand)";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Catering reports</h1>
        <p className="text-muted-foreground">
          Pipeline value, conversion rate, lost/expiring quotes, breakdowns by event type and brand.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardDescription>Pipeline value</CardDescription><CardTitle className="text-2xl tabular-nums">{formatCurrency(kpis.pipelineValueCents / 100)}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Accepted revenue</CardDescription><CardTitle className="text-2xl tabular-nums">{formatCurrency(kpis.acceptedRevenueCents / 100)}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Average quote</CardDescription><CardTitle className="text-2xl tabular-nums">{formatCurrency(kpis.avgValueCents / 100)}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Conversion rate</CardDescription><CardTitle className="text-2xl tabular-nums">{conversionRate}%</CardTitle></CardHeader></Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Revenue by event type</CardTitle>
          <CardDescription>Sum of quote totals grouped by event type (drafts + accepted + lost).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {byEventType.map((row) => (
            <div key={row.eventType} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2">
              <div className="text-sm font-medium">{CATERING_EVENT_TYPE_LABEL[row.eventType]}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="rounded-full">{row._count._all} quotes</Badge>
                <span className="tabular-nums">{formatCurrency(decimalToNumber(row._sum.total))}</span>
              </div>
            </div>
          ))}
          {byEventType.length === 0 ? <p className="text-sm text-muted-foreground">No data yet.</p> : null}
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Revenue by brand</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {byBrand.map((row, idx) => (
            <div key={`${row.brandId ?? "none"}-${idx}`} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2">
              <div className="text-sm font-medium">{brandName(row.brandId)}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="rounded-full">{row._count._all} quotes</Badge>
                <span className="tabular-nums">{formatCurrency(decimalToNumber(row._sum.total))}</span>
              </div>
            </div>
          ))}
          {byBrand.length === 0 ? <p className="text-sm text-muted-foreground">No brand-scoped quotes yet.</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Lost quotes</CardTitle>
            <CardDescription>Rejected, declined, expired.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {lost.length === 0 ? <p className="text-sm text-muted-foreground">No lost quotes yet.</p> : null}
            {lost.map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2 text-xs">
                <span>{q.quoteNumber ?? q.id.slice(0, 8)} · {q.customerName}</span>
                <span className="tabular-nums">{formatCurrency(Number(q.total.toString()))}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Expiring soon</CardTitle>
            <CardDescription>Active quotes whose validity ends within 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {expiring.length === 0 ? <p className="text-sm text-muted-foreground">No expiring quotes.</p> : null}
            {expiring.map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-xl border border-border/70 px-3 py-2 text-xs">
                <span>{q.quoteNumber ?? q.id.slice(0, 8)} · {q.customerName}</span>
                <span className="tabular-nums">{formatCurrency(Number(q.total.toString()))}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
