import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Faq } from "@/components/marketing/public-page";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { SolutionLandingRich } from "@/components/marketing/solution-landing-rich";
import { SolutionGuideLinks } from "@/components/marketing/solution-guide-links";
import { SolutionRelatedLinks } from "@/components/seo/solution-related-links";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/schema-org";
import { isRichSolutionSlug } from "@/lib/marketing/solution-landing-content";
import { faqForSolution } from "@/lib/marketing/solution-page-faq";
import { PRODUCTION_APP_URL } from "@/lib/auth/public-site-url";
import {
  getDemoWorkspacePreset,
  parseSolutionPageSlug,
  solutionSlugToDemoVertical,
  SOLUTION_PAGE_SLUGS,
  type SolutionPageSlug,
} from "@/lib/demo-verticals";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";
import { SOLUTION_CHANNEL_FAQ } from "@/lib/marketing/solution-faq";
import { SOLUTION_SEO } from "@/lib/marketing/solution-seo";
import { solutionPages } from "@/lib/public-copy";

const headlines: Record<SolutionPageSlug, string> = {
  "meal-prep": "Run weekly preorder kitchens without spreadsheet chaos",
  catering: "Coordinate corporate catering drops from one Order hub",
  "ghost-kitchens": "Operate multiple delivery brands from a single pass-through queue",
  bakeries: "Align bake schedules, preorders, and pickup waves",
  "weekly-preorders": "Run weekly preorder operations from menu to pickup",
  "cloud-kitchens": "Coordinate cloud kitchen brands without channel chaos",
  "corporate-lunch": "Manage corporate lunch production from quote to route",
  cafes: "Run counter POS, barista throughput, and daily specials without losing the kitchen thread",
  "multi-brand": "Operate multiple brands from one shared kitchen with honest channel maturity",
  restaurants: "Restaurant POS, table management, and kitchen display in one platform",
  bars: "Bar POS with tabs, quick-order drinks, and kitchen sync",
  "fast-casual": "Fast-casual POS built for lines, KDS, and production throughput",
};

export function generateStaticParams() {
  return SOLUTION_PAGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = parseSolutionPageSlug(raw);
  if (!slug) return { title: "Solutions" };

  const seo = SOLUTION_SEO[slug];
  const headline = headlines[slug];
  const path = `/solutions/${slug}`;

  if (seo) {
    return marketingPageMetadata({
      title: seo.metaTitle,
      description: seo.metaDescription,
      path,
      keywords: seo.keywords,
    });
  }

  return marketingPageMetadata({
    title: headline,
    description: `${headline} — Centralize orders, production, and packing with OS Kitchen.`,
    path,
  });
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: raw } = await params;
  const slug = parseSolutionPageSlug(raw);
  if (!slug) notFound();

  const demoSlug = solutionSlugToDemoVertical(slug);
  const preset = getDemoWorkspacePreset(demoSlug);
  const seo = SOLUTION_SEO[slug];
  const breadcrumbLabel = seo?.breadcrumbLabel ?? headlines[slug];
  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Solutions", href: "/solutions" },
    { name: breadcrumbLabel, href: `/solutions/${slug}` },
  ];
  const breadcrumbSchemaItems = [
    { name: "Home", url: PRODUCTION_APP_URL },
    { name: "Solutions", url: `${PRODUCTION_APP_URL}/solutions` },
    { name: breadcrumbLabel, url: `${PRODUCTION_APP_URL}/solutions/${slug}` },
  ];
  const faqSchemaItems = faqForSolution(slug).length
    ? faqForSolution(slug)
    : SOLUTION_CHANNEL_FAQ.map(([question, answer]) => ({ question, answer }));

  if (isRichSolutionSlug(slug)) {
    return (
      <SolutionLandingRich slug={slug} breadcrumbLabel={seo?.breadcrumbLabel ?? breadcrumbLabel} />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbSchema items={breadcrumbSchemaItems} />
      <FAQSchema questions={faqSchemaItems} />
      <SiteHeader />
      <main className="mx-auto max-w-4xl space-y-10 px-4 py-16 sm:px-6">
        <Breadcrumbs items={breadcrumbItems} />
        <Badge variant="secondary" className="rounded-full">
          OS Kitchen for {preset.businessName.replace(/^Demo · /, "")}
        </Badge>
        <div className="space-y-4">
          <h1 className="text-balance text-4xl font-semibold tracking-tight">
            {headlines[slug]}
          </h1>
          <p className="text-lg text-muted-foreground">
            {solutionPages[slug].description || preset.tagline}
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-5">
          <h2 className="font-semibold">Who it is for</h2>
          <p className="mt-2 text-sm text-muted-foreground">{solutionPages[slug].whoFor}</p>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-5">
          <h2 className="font-semibold">Operational pain</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {solutionPages[slug].pain.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-5">
          <h2 className="font-semibold">Relevant modules</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {solutionPages[slug].modules.map((m) => (
              <Badge key={m} variant="outline" className="rounded-full text-xs font-normal">
                {m}
              </Badge>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
          <h2 className="font-semibold text-amber-950 dark:text-amber-100">Honest limitations</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {solutionPages[slug].limitations.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-5">
          <h2 className="font-semibold">OS Kitchen workflow</h2>
          <p className="mt-2 text-sm text-muted-foreground">{solutionPages[slug].workflow}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Order hub</CardTitle>
            <CardDescription>
              Manual rows alongside WooCommerce and Shopify shaped payloads when those channels are configured —
              Uber Eats and other marketplaces stay partner-gated. See sync health before food hits the line.
            </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Kitchen production</CardTitle>
              <CardDescription>
                Batch-friendly checkpoints so prep, cook, cool, pack, and label stay honest
                during service spikes.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Packing & labels</CardTitle>
              <CardDescription>
                Lane pickup vs delivery, export sheets, and printable paths ready for thermal
                workflows.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Owner analytics</CardTitle>
              <CardDescription>
                Revenue and channel snapshots grounded in your database — no mystery AI
                numbers.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Faq items={SOLUTION_CHANNEL_FAQ} />

        <SolutionGuideLinks slug={slug} />

        <SolutionRelatedLinks currentSlug={slug} />

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild className="rounded-full" variant="premium">
            <Link href={`/signup?redirect=${encodeURIComponent(`/demo/${demoSlug}`)}`}>
              Start free trial
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/demo/${demoSlug}`}>Try the interactive demo</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/pricing">View pricing</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/demo">Book demo</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/product">Explore product</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
