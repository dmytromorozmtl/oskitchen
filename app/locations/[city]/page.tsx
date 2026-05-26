import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingButton } from "@/components/marketing/button";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { GEO_CITIES, geoCityBySlug } from "@/lib/marketing/geo-cities";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

type PageProps = { params: Promise<{ city: string }> };

export function generateStaticParams() {
  return GEO_CITIES.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const content = geoCityBySlug(city);
  if (!content) return { title: "Locations | KitchenOS" };
  return marketingPageMetadata({
    title: content.headline,
    description: content.subheadline,
    path: `/locations/${content.slug}`,
    keywords: content.keywords,
  });
}

export default async function GeoCityPage({ params }: PageProps) {
  const { city } = await params;
  const content = geoCityBySlug(city);
  if (!content) notFound();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-sm font-medium text-primary">{content.region}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">{content.headline}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{content.subheadline}</p>
        <p className="mt-6 rounded-lg border bg-muted/30 p-4 text-sm">{content.marketStat}</p>
        <p className="mt-4 text-muted-foreground">{content.localContext}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <MarketingButton href="/signup?utm_source=geo&utm_medium=organic">
            Start free trial
          </MarketingButton>
          <MarketingButton href="/book-demo" variant="secondary">
            Book demo
          </MarketingButton>
        </div>
        <p className="mt-12 text-sm text-muted-foreground">
          <Link href="/compare" className="underline underline-offset-4">
            Compare KitchenOS to other stacks
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
