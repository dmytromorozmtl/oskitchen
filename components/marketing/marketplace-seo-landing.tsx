'use client';

import Link from 'next/link';
import { ArrowRight, Scale, ShoppingCart, Store, Truck } from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeaderClient } from '@/components/marketing/site-header-client';
import { SolutionFinalCta } from '@/components/marketing/solution-final-cta';
import { SectionHeader } from '@/components/marketing/section-header';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { BreadcrumbSchema, FAQSchema } from '@/components/seo/schema-org';
import { PRODUCTION_APP_URL } from '@/lib/auth/public-site-url';
import {
  getMarketplaceSeoConfig,
  MARKETPLACE_SEO_LIMITATIONS,
  MARKETPLACE_SEO_OPERATOR_LINKS,
  marketplaceSeoCtaHref,
} from '@/lib/marketing/marketplace-seo-pages-content';
import type { MarketplaceSeoSlug } from '@/lib/marketing/marketplace-seo-pages-policy';

const MARKETPLACE_SEO_LANDING_TEST_IDS: Record<MarketplaceSeoSlug, string> = {
  'restaurant-suppliers': 'restaurant-suppliers-seo-landing',
  'food-distributors': 'food-distributors-seo-landing',
  'restaurant-marketplace': 'restaurant-marketplace-seo-landing',
};

const FEATURE_ICONS = [Scale, Truck, Store, ShoppingCart] as const;

type Props = {
  slug: MarketplaceSeoSlug;
};

/** Blueprint P2-125 — Marketplace SEO landing page. */
export function MarketplaceSeoLanding({ slug }: Props) {
  const config = getMarketplaceSeoConfig(slug);
  const testId = MARKETPLACE_SEO_LANDING_TEST_IDS[slug];

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Marketplace', href: '/solutions' },
    { name: config.eyebrow, href: config.path },
  ];
  const breadcrumbSchemaItems = [
    { name: 'Home', url: PRODUCTION_APP_URL },
    { name: 'Marketplace', url: `${PRODUCTION_APP_URL}/solutions` },
    { name: config.eyebrow, url: `${PRODUCTION_APP_URL}${config.path}` },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid={testId}>
      <BreadcrumbSchema items={breadcrumbSchemaItems} />
      <FAQSchema questions={config.faqs} />
      <SiteHeaderClient isAuthenticated={false} />
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pt-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.1),_transparent_55%)]"
          />
          <div className="relative mx-auto max-w-4xl text-center">
            <p className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              {config.eyebrow} · BETA marketplace
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl sm:leading-[1.08]">
              {config.h1}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {config.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <MarketingButton href={marketplaceSeoCtaHref('/signup', slug)} size="lg">
                Start free trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </MarketingButton>
              <MarketingButton
                href={marketplaceSeoCtaHref('/book-demo', slug)}
                variant="secondary"
                size="lg"
              >
                Book a demo
              </MarketingButton>
              <MarketingButton href="/dashboard/marketplace" variant="ghost" size="lg">
                Marketplace hub
              </MarketingButton>
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 py-12">
          <SectionHeader
            tag="Capabilities"
            title="Side-by-side supplier comparison inside your OS"
            description="Compare vendors, build multi-vendor carts, and track POs — typical directional pricing, not certified bid audit."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {config.features.map((feature, index) => {
              const Icon = FEATURE_ICONS[index] ?? Scale;
              return (
                <MarketingCard key={feature.title} className="h-full p-6">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                  <h3 className="mt-3 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </MarketingCard>
              );
            })}
          </div>
        </section>

        <section className="border-t border-border/60 py-12">
          <SectionHeader tag="FAQ" title="Common questions" />
          <div className="mt-6 space-y-4">
            {config.faqs.map((faq) => (
              <MarketingCard key={faq.question} className="p-6">
                <h3 className="text-base font-semibold">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              </MarketingCard>
            ))}
          </div>
        </section>

        <section className="border-t border-border/60 py-12">
          <SectionHeader tag="Honest scope" title="Verify before external claims" />
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {MARKETPLACE_SEO_LIMITATIONS.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-border/60 py-8">
          <div className="flex flex-wrap gap-3">
            {MARKETPLACE_SEO_OPERATOR_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <SolutionFinalCta
          title="See marketplace inside OS Kitchen"
          subtitle="Catalog, compare, cart, and PO tracking — verify BETA labels on /trust before pilot claims."
          signupHref={marketplaceSeoCtaHref('/signup', slug)}
          bookDemoHref={marketplaceSeoCtaHref('/book-demo', slug)}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
