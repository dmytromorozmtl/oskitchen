import { ArrowRight, Quote, ShoppingBag } from "lucide-react";

import { MarketingButton } from "@/components/marketing/button";
import { MarketingCard } from "@/components/marketing/card";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { SolutionComparisonTable } from "@/components/marketing/solution-comparison-table";
import { SolutionFinalCta } from "@/components/marketing/solution-final-cta";
import { SectionHeader } from "@/components/marketing/section-header";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/schema-org";
import { PRODUCTION_APP_URL } from "@/lib/auth/public-site-url";
import {
  SHOPIFY_BUNDLE_BADGE,
  SHOPIFY_BUNDLE_COMPARISON,
  SHOPIFY_BUNDLE_CTA,
  SHOPIFY_BUNDLE_FAQ,
  SHOPIFY_BUNDLE_FEATURES,
  SHOPIFY_BUNDLE_HEADLINE,
  SHOPIFY_BUNDLE_SUBHEADLINE,
  SHOPIFY_BUNDLE_TESTIMONIAL,
  SHOPIFY_BUNDLE_TRUST_LINE,
  SHOPIFY_PAIN_POINTS,
  SHOPIFY_SOLUTION_POINTS,
} from "@/lib/marketing/shopify-bundle-content";

const breadcrumbItems = [
  { name: "Home", href: "/" },
  { name: "Shopify bundle", href: "/shopify" },
];

const breadcrumbSchemaItems = [
  { name: "Home", url: PRODUCTION_APP_URL },
  { name: "Shopify bundle", url: `${PRODUCTION_APP_URL}/shopify` },
];

export function ShopifyBundleLanding() {
  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbSchema items={breadcrumbSchemaItems} />
      <FAQSchema questions={SHOPIFY_BUNDLE_FAQ.map((item) => ({ question: item.q, answer: item.a }))} />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pt-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,255,0.08),_transparent_55%)]"
          />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 shadow-card">
              <ShoppingBag className="h-7 w-7 text-primary" aria-hidden />
            </div>
            <p className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              {SHOPIFY_BUNDLE_BADGE}
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl sm:leading-[1.08]">
              {SHOPIFY_BUNDLE_HEADLINE}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {SHOPIFY_BUNDLE_SUBHEADLINE}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <MarketingButton href="/signup" size="lg">
                Start free trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </MarketingButton>
              <MarketingButton href="/dashboard/integrations/shopify" variant="secondary" size="lg">
                Connect Shopify
              </MarketingButton>
              <MarketingButton href="/book-demo" variant="ghost" size="lg">
                Book a demo
              </MarketingButton>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{SHOPIFY_BUNDLE_TRUST_LINE}</p>
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20">
          <SectionHeader
            tag="The pain"
            title="Shopify is great at selling — not at running your kitchen"
            description="Operators on Shopify alone still juggle production, inventory, and wholesale outside the storefront."
            centered
            className="mx-auto"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {SHOPIFY_PAIN_POINTS.map((point) => (
              <MarketingCard key={point.title} className="h-full border-destructive/20 bg-destructive/5">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.description}</p>
              </MarketingCard>
            ))}
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20">
          <SectionHeader
            tag="The solution"
            title="Keep Shopify. Add the kitchen operating system."
            description="OS Kitchen sits behind your storefront — orders, inventory, production, and optional B2B AR in one workspace."
            centered
            className="mx-auto"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {SHOPIFY_SOLUTION_POINTS.map((point) => (
              <MarketingCard key={point.title} className="h-full border-primary/20 bg-primary/5">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.description}</p>
              </MarketingCard>
            ))}
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20">
          <SectionHeader
            tag="Features"
            title="What the Shopify bundle includes"
            description="Production-ready integrations today — with honest beta labels where scope is still expanding."
            centered
            className="mx-auto"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SHOPIFY_BUNDLE_FEATURES.map((feature) => (
              <MarketingCard key={feature.title} className="h-full">
                <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </MarketingCard>
            ))}
          </div>
        </section>

        <SolutionComparisonTable
          comparison={SHOPIFY_BUNDLE_COMPARISON}
          comparisonTag="Compare"
          disclaimer="Shopify POS and Plus capabilities vary by plan — confirm with Shopify before purchase. OS Kitchen custom app is beta and not App Store listed."
        />

        <section className="border-t border-border/60 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-card sm:p-10">
            <Quote className="h-8 w-8 text-primary/60" aria-hidden />
            <blockquote className="mt-4 text-xl font-medium leading-relaxed tracking-tight text-foreground">
              &ldquo;{SHOPIFY_BUNDLE_TESTIMONIAL.quote}&rdquo;
            </blockquote>
            <footer className="mt-6 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">{SHOPIFY_BUNDLE_TESTIMONIAL.attribution}</p>
              <p className="mt-1">{SHOPIFY_BUNDLE_TESTIMONIAL.context}</p>
            </footer>
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20">
          <SectionHeader tag="FAQ" title="Common questions" centered className="mx-auto" />
          <dl className="mx-auto mt-10 max-w-3xl space-y-6">
            {SHOPIFY_BUNDLE_FAQ.map((item) => (
              <div key={item.q}>
                <dt className="font-semibold text-foreground">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <SolutionFinalCta title={SHOPIFY_BUNDLE_CTA.title} subtitle={SHOPIFY_BUNDLE_CTA.subtitle} />
      </main>
      <SiteFooter />
    </div>
  );
}
