"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Building2,
  ExternalLink,
  Landmark,
  MessageSquare,
} from "lucide-react";

import { logCapitalPartnerViewAction, submitCapitalInterestAction } from "@/actions/capital-resources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CapitalPartner, CapitalPartnersConfig } from "@/lib/commercial/capital-partners";
import { resolveCapitalPartnerOutboundHref } from "@/lib/commercial/capital-partner-outbound";
import type { CapitalRevenueContext } from "@/services/commercial/restaurant-capital-resources-service";
import { formatCurrency } from "@/lib/utils";
import { invokeServerAction } from "@/lib/server-actions/invoke-server-action";

type CapitalResourcesHubProps = {
  config: CapitalPartnersConfig;
  featuredPartners: CapitalPartner[];
  revenueContext: CapitalRevenueContext;
};

function categoryIcon(category: CapitalPartner["category"]) {
  switch (category) {
    case "government":
      return Landmark;
    case "education":
      return BookOpen;
    case "lender":
      return Building2;
    default:
      return MessageSquare;
  }
}

function PartnerCard({ partner }: { partner: CapitalPartner }) {
  const [pending, startTransition] = useTransition();
  const href = resolveCapitalPartnerOutboundHref(partner);
  const external = !partner.internal;

  return (
    <Card className="border-border/80">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            {(() => {
              const Icon = categoryIcon(partner.category);
              return <Icon className="h-4 w-4 text-muted-foreground" />;
            })()}
            {partner.name}
          </CardTitle>
          <Badge variant="outline">{partner.category}</Badge>
        </div>
        <CardDescription>{partner.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{partner.disclosure}</p>
        {partner.referralFee ? (
          <p className="text-xs text-amber-700 dark:text-amber-200">
            KitchenOS may receive referral compensation for this partner.
          </p>
        ) : null}
        <Button
          type="button"
          size="sm"
          className="rounded-full"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await logCapitalPartnerViewAction(partner.slug);
              if (external && href.startsWith("/api/")) {
                window.location.href = href;
                return;
              }
              window.location.href = href;
            })
          }
        >
          {partner.internal ? <ArrowUpRight className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
          <span className="ml-2">{partner.internal ? "Request info" : "Visit resource"}</span>
        </Button>
      </CardContent>
    </Card>
  );
}

export function CapitalResourcesHub({
  config,
  featuredPartners,
  revenueContext,
}: CapitalResourcesHubProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
        <p className="flex items-start gap-2 font-medium text-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          Resources only — not a lending product
        </p>
        <p className="mt-2">{config.hubSubtitle}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/80 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Your KitchenOS revenue context</CardTitle>
            <CardDescription>
              Trailing 12 months — operational summary to help you prepare lender conversations. Not a
              credit score or certified attestation.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Metric label="Gross order revenue" value={formatCurrency(revenueContext.grossOrderRevenue, revenueContext.currency)} />
            <Metric label="Revenue-eligible orders" value={String(revenueContext.orderCount)} />
            <Metric label="Cancelled orders" value={String(revenueContext.cancelledOrderCount)} />
            <Metric label="Locations with orders" value={String(revenueContext.locationCount)} />
            <Metric
              label="Platform tenure"
              value={revenueContext.tenureDays != null ? `${revenueContext.tenureDays} days` : "—"}
            />
            <Metric
              label="Period"
              value={`${revenueContext.periodStart} → ${revenueContext.periodEnd}`}
            />
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-base">Analytics tie-in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>{revenueContext.definitionNote}</p>
            <Link href="/dashboard/analytics/revenue" className="inline-flex text-primary underline">
              Open revenue analytics
            </Link>
            <Link href="/dashboard/analytics/advanced" className="block text-primary underline">
              Open advanced reporting
            </Link>
            <Link href="/roi-calculator" className="block text-primary underline">
              ROI calculator (illustrative)
            </Link>
          </CardContent>
        </Card>
      </div>

      {!revenueContext.hasOrderData ? (
        <Card className="border-dashed border-border/80">
          <CardContent className="py-6 text-sm text-muted-foreground">
            No revenue-eligible orders in the trailing 12-month window yet. Lenders typically ask for sales
            history — start capturing orders in OS Kitchen, then revisit this page.
          </CardContent>
        </Card>
      ) : null}

      <div>
        <h2 className="text-lg font-semibold">Featured resources</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Third-party sites — verify terms, eligibility, and disclosures with each provider.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {featuredPartners
            .filter((partner) => !partner.offersEnabled)
            .map((partner) => (
            <PartnerCard key={partner.slug} partner={partner} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">All partner resources</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {config.partners.filter((partner) => !partner.offersEnabled).map((partner) => (
            <PartnerCard key={partner.slug} partner={partner} />
          ))}
        </div>
      </div>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-base">Education topics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {config.educationTopics.map((topic) => (
            <div key={topic.title} className="rounded-lg border border-border/70 p-4">
              <p className="font-medium">{topic.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{topic.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-base">Tell us what you need</CardTitle>
          <CardDescription>
            Optional — routes to the sales team for attestation waitlist or partner introductions. Not a loan
            application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await invokeServerAction(() =>
                submitCapitalInterestAction(new FormData(event.currentTarget)),
              );
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="useCase">Use case</Label>
              <select
                id="useCase"
                name="useCase"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="working_capital"
              >
                <option value="working_capital">Working capital / payroll gap</option>
                <option value="equipment">Equipment financing</option>
                <option value="expansion">New location or ghost kitchen expansion</option>
                <option value="attestation_waitlist">Verified revenue export waitlist (Phase 2)</option>
                <option value="other">Other / not sure yet</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Notes (optional)</Label>
              <Textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Amount range, timeline, locations, or questions for our team."
              />
            </div>
            <Button type="submit" className="w-fit rounded-full">
              Submit interest
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-muted/15">
        <CardHeader>
          <CardTitle className="text-base">Disclosures</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {config.hubDisclosures.map((line) => (
            <p key={line}>• {line}</p>
          ))}
          <p className="pt-2">{config.referralFeeDisclosure}</p>
          <Link href="/resources/restaurant-financing" className="inline-block text-primary underline">
            Public financing resources page
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
