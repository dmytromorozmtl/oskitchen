import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { SectionHeader } from '@/components/marketing/section-header';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { CustomerSegmentStrip } from '@/components/marketing/customer-segment-strip';
import { CASE_STUDIES, CASE_STUDIES_DISCLAIMER } from '@/lib/marketing/case-studies';

export function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <Breadcrumbs
          items={[
            { name: 'Home', href: '/' },
            { name: 'Customer stories', href: '/customers' },
          ]}
        />

        <section className="py-12 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Customer stories</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            How operators run calmer kitchens on OS Kitchen
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Real-world patterns from pilot cohorts — what changed in their weekly rhythm, not vanity metrics.
          </p>
          <p className="mt-4 max-w-3xl text-sm italic text-muted-foreground">{CASE_STUDIES_DISCLAIMER}</p>
          <div className="mt-10">
            <CustomerSegmentStrip />
          </div>
          <div className="mt-8">
            <MarketingButton href="/signup" size="lg">
              Start free trial
              <ArrowRight className="h-4 w-4" aria-hidden />
            </MarketingButton>
          </div>
        </section>

        <section className="space-y-12 pb-16 sm:pb-20">
          {CASE_STUDIES.map((study) => (
            <article
              key={study.id}
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-card"
            >
              <div className="border-b border-border/70 bg-muted/30 px-6 py-4 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {study.segment}
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  <Link href={`/customers/${study.id}`} className="hover:text-primary">
                    {study.title}
                  </Link>
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">{study.readTime}</p>
                <p className="mt-2 text-muted-foreground">{study.summary}</p>
              </div>

              <div className="grid gap-8 px-6 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Challenge
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed">{study.challenge}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Approach
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed">{study.approach}</p>
                  </div>
                  <blockquote className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4">
                    <p className="text-sm leading-relaxed">&ldquo;{study.quote}&rdquo;</p>
                    <footer className="mt-3 text-xs text-muted-foreground">— {study.attribution}</footer>
                  </blockquote>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Reported outcomes
                  </h3>
                  {study.outcomes.map((outcome) => (
                    <MarketingCard key={outcome.label} hover={false} className="p-4">
                      <p className="text-2xl font-bold tracking-tight text-primary">{outcome.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{outcome.label}</p>
                    </MarketingCard>
                  ))}
                  <MarketingButton href={`/customers/${study.id}`} variant="secondary" className="w-full">
                    Read full story
                  </MarketingButton>
                  <MarketingButton href={study.href} variant="ghost" className="w-full text-muted-foreground">
                    {study.ctaLabel}
                  </MarketingButton>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="border-t border-border/60 py-16 text-center">
          <SectionHeader
            tag="Your turn"
            title="Map your workflow in a 14-day trial"
            description="Start with one service model — meal prep week, dining room, or first virtual brand. Expand channels when credentials are verified."
            centered
            className="mx-auto"
          />
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <MarketingButton href="/book-demo">Book a demo</MarketingButton>
            <MarketingButton href="/demo" variant="secondary">
              Try interactive demo
            </MarketingButton>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
