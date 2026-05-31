import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle, ArrowRight, BookOpen, Landmark } from "lucide-react";

import { MarketingCard } from "@/components/marketing/card";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Button } from "@/components/ui/button";
import { loadCapitalPartnersConfig, listFeaturedCapitalPartners } from "@/lib/commercial/capital-partners";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "Restaurant Financing Resources — Third-Party Options | OS Kitchen",
  description:
    "Educational financing resources for restaurant operators. OS Kitchen does not originate loans or make credit decisions.",
  path: "/resources/restaurant-financing",
});

export default function RestaurantFinancingResourcesPage() {
  const config = loadCapitalPartnersConfig();
  const featured = listFeaturedCapitalPartners().filter((partner) => !partner.internal);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="py-8 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Resources</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            {config.hubTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {config.hubSubtitle}
          </p>
          <div className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
            <p className="flex items-start gap-2 font-medium text-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              Not a lending product
            </p>
            <p className="mt-2">
              Links below go to third-party providers. OS Kitchen does not guarantee approval, rates, or
              repayment terms.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">Featured resources</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {featured.map((partner) => (
              <li key={partner.slug}>
                <MarketingCard className="h-full p-6">
                  <div className="flex items-center gap-2 text-primary">
                    {partner.category === "government" ? (
                      <Landmark className="h-4 w-4" />
                    ) : (
                      <BookOpen className="h-4 w-4" />
                    )}
                    <span className="text-xs font-semibold uppercase tracking-wide">{partner.category}</span>
                  </div>
                  <h3 className="mt-3 font-semibold">{partner.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{partner.description}</p>
                  <p className="mt-3 text-xs text-muted-foreground">{partner.disclosure}</p>
                  <a
                    href={partner.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
                  >
                    Visit resource
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </MarketingCard>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Operator education</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {config.educationTopics.map((topic) => (
              <li key={topic.title}>
                <MarketingCard className="h-full p-6">
                  <h3 className="font-semibold">{topic.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{topic.body}</p>
                </MarketingCard>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 rounded-2xl border border-border/80 bg-muted/20 p-8">
          <h2 className="text-xl font-semibold">Already on OS Kitchen?</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Signed-in owners see a revenue context panel tied to Analytics — still not a lender-certified
            attestation. Verified export is on the Phase 2 roadmap.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link href="/login?next=/dashboard/analytics/capital">Open dashboard hub</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/contact-sales">Talk to sales</Link>
            </Button>
          </div>
        </section>

        <section className="mt-16 text-sm text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">Disclosures</h2>
          <ul className="mt-4 space-y-2">
            {config.hubDisclosures.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
          <p className="mt-4">{config.referralFeeDisclosure}</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
