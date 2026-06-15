import { ArrowRight, Package, Quote } from "lucide-react";

import { MarketingButton } from "@/components/marketing/button";
import { MarketingCard } from "@/components/marketing/card";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { SolutionFinalCta } from "@/components/marketing/solution-final-cta";
import { SectionHeader } from "@/components/marketing/section-header";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/schema-org";
import { PRODUCTION_APP_URL } from "@/lib/auth/public-site-url";
import {
  VENDOR_RECRUITMENT_BADGE,
  VENDOR_RECRUITMENT_BENEFITS,
  VENDOR_RECRUITMENT_CTA,
  VENDOR_RECRUITMENT_FAQ,
  VENDOR_RECRUITMENT_HEADLINE,
  VENDOR_RECRUITMENT_LIMITATIONS,
  VENDOR_RECRUITMENT_PAIN_POINTS,
  VENDOR_RECRUITMENT_STEPS,
  VENDOR_RECRUITMENT_SUBHEADLINE,
  VENDOR_RECRUITMENT_TRUST_LINE,
} from "@/lib/marketing/vendor-recruitment-content";

const breadcrumbItems = [
  { name: "Home", href: "/" },
  { name: "Become a vendor", href: "/vendor" },
];

const breadcrumbSchemaItems = [
  { name: "Home", url: PRODUCTION_APP_URL },
  { name: "Become a vendor", url: `${PRODUCTION_APP_URL}/vendor` },
];

export function VendorRecruitmentLanding() {
  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbSchema items={breadcrumbSchemaItems} />
      <FAQSchema questions={VENDOR_RECRUITMENT_FAQ.map((item) => ({ question: item.q, answer: item.a }))} />
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
              <Package className="h-7 w-7 text-primary" aria-hidden />
            </div>
            <p className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              {VENDOR_RECRUITMENT_BADGE}
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl sm:leading-[1.08]">
              {VENDOR_RECRUITMENT_HEADLINE}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {VENDOR_RECRUITMENT_SUBHEADLINE}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <MarketingButton href="/vendor/register" size="lg">
                Start vendor application
                <ArrowRight className="h-4 w-4" aria-hidden />
              </MarketingButton>
              <MarketingButton href="/dashboard/marketplace" variant="secondary" size="lg">
                Buyer marketplace hub
              </MarketingButton>
              <MarketingButton href="/book-demo" variant="ghost" size="lg">
                Talk to partnerships
              </MarketingButton>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{VENDOR_RECRUITMENT_TRUST_LINE}</p>
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20">
          <SectionHeader
            tag="Supplier pain"
            title="Restaurants run ops in OS Kitchen — suppliers need a honest path in"
            description="Fragmented ordering and unclear payout scope slow HoReCa supply relationships."
            centered
            className="mx-auto"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {VENDOR_RECRUITMENT_PAIN_POINTS.map((point) => (
              <MarketingCard key={point.title} className="h-full border-destructive/20 bg-destructive/5">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{point.description}</p>
              </MarketingCard>
            ))}
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20">
          <SectionHeader
            tag="Why OS Kitchen"
            title="Vendor tools on the same B2B marketplace spine"
            description="Catalog, orders, and Connect onboarding — with BETA labels until pilot proof lands."
            centered
            className="mx-auto"
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {VENDOR_RECRUITMENT_BENEFITS.map((benefit) => (
              <MarketingCard key={benefit.title} className="h-full border-primary/20 bg-primary/5">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
              </MarketingCard>
            ))}
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20">
          <SectionHeader
            tag="How it works"
            title="From application to first purchase order"
            description="Platform verification required — typical pilot path below."
            centered
            className="mx-auto"
          />
          <ol className="mx-auto mt-12 max-w-3xl space-y-4">
            {VENDOR_RECRUITMENT_STEPS.map((item) => (
              <li
                key={item.step}
                className="flex gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-card"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-2xl border border-amber-500/25 bg-amber-500/5 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-amber-950 dark:text-amber-100">Honest limitations</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We label marketplace maturity honestly — no fake LIVE supplier network claims.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              {VENDOR_RECRUITMENT_LIMITATIONS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-card sm:p-10">
            <Quote className="h-8 w-8 text-primary/60" aria-hidden />
            <blockquote className="mt-4 text-xl font-medium leading-relaxed tracking-tight text-foreground">
              &ldquo;We wanted restaurants already on OS Kitchen to find our packaging SKUs without a separate portal.
              Verification took a manual review — but once approved, POs showed up beside their kitchen orders.&rdquo;
            </blockquote>
            <footer className="mt-6 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Packaging supplier — design partner persona</p>
              <p className="mt-1">Pilot feedback — composite from vendor seeding strategy workshops</p>
            </footer>
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-20">
          <SectionHeader tag="FAQ" title="Vendor application FAQ" centered className="mx-auto" />
          <dl className="mx-auto mt-10 max-w-3xl space-y-6">
            {VENDOR_RECRUITMENT_FAQ.map((item) => (
              <div key={item.q}>
                <dt className="font-semibold text-foreground">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <SolutionFinalCta
          title={VENDOR_RECRUITMENT_CTA.title}
          subtitle={VENDOR_RECRUITMENT_CTA.subtitle}
          signupHref="/vendor/register"
          bookDemoHref="/book-demo"
        />
      </main>
      <SiteFooter />
    </div>
  );
}
