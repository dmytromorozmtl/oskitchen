import { ArrowRight, Calendar, Map } from 'lucide-react';

import { MarketingButton } from '@/components/marketing/button';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { BreadcrumbSchema } from '@/components/seo/schema-org';
import { PRODUCTION_APP_URL } from '@/lib/auth/public-site-url';
import {
  PUBLIC_ROADMAP_CONFIDENCE_LABELS,
  PUBLIC_ROADMAP_HONESTY_DISCLAIMER,
  PUBLIC_ROADMAP_OUT_OF_SCOPE,
  PUBLIC_ROADMAP_PATH,
  PUBLIC_ROADMAP_QUARTERS,
  PUBLIC_ROADMAP_STATUS_LABELS,
  publicRoadmapCtaHref,
  type PublicRoadmapStatus,
} from '@/lib/marketing/public-roadmap-content';
import { cn } from '@/lib/utils';

function statusBadgeClass(status: PublicRoadmapStatus): string {
  switch (status) {
    case 'live':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    case 'beta':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400';
    case 'roadmap':
      return 'border-primary/30 bg-primary/10 text-primary';
    case 'partner':
      return 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400';
    case 'deferred':
      return 'border-muted-foreground/30 bg-muted text-muted-foreground';
  }
}

function RoadmapItemBadges({
  status,
  confidence,
}: {
  status: PublicRoadmapStatus;
  confidence: keyof typeof PUBLIC_ROADMAP_CONFIDENCE_LABELS;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={cn(
          'rounded-full border px-2.5 py-0.5 text-xs font-medium',
          statusBadgeClass(status),
        )}
      >
        {PUBLIC_ROADMAP_STATUS_LABELS[status]}
      </span>
      <span
        className="rounded-full border border-border/80 bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground"
        data-testid="public-roadmap-confidence"
      >
        {PUBLIC_ROADMAP_CONFIDENCE_LABELS[confidence]}
      </span>
    </div>
  );
}

export function PublicRoadmapPage() {
  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Roadmap', href: PUBLIC_ROADMAP_PATH },
  ];
  const breadcrumbSchemaItems = [
    { name: 'Home', url: PRODUCTION_APP_URL },
    { name: 'Roadmap', url: `${PRODUCTION_APP_URL}${PUBLIC_ROADMAP_PATH}` },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="public-roadmap-page">
      <BreadcrumbSchema items={breadcrumbSchemaItems} />
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mt-8 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5">
            <Map className="h-7 w-7 text-primary" aria-hidden />
          </div>
          <p className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Public roadmap · honest status labels
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            What we are building at OS Kitchen
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Quarterly priorities for commissaries, ghost kitchens, and meal-prep operators — with
            BETA badges where certification is still in progress.
          </p>
        </div>

        <p
          className="mt-10 rounded-lg border border-border/80 bg-muted/40 p-4 text-sm text-muted-foreground"
          data-testid="public-roadmap-honesty-disclaimer"
        >
          <strong>Honesty disclaimer:</strong> {PUBLIC_ROADMAP_HONESTY_DISCLAIMER}
        </p>

        <div className="mt-12 space-y-12">
          {PUBLIC_ROADMAP_QUARTERS.map((quarter) => (
            <section key={quarter.id} aria-labelledby={`${quarter.id}-heading`}>
              <div className="flex items-center gap-2 text-primary">
                <Calendar className="h-5 w-5" aria-hidden />
                <h2 id={`${quarter.id}-heading`} className="text-2xl font-semibold">
                  {quarter.label}
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{quarter.theme}</p>
              <ul className="mt-6 space-y-4">
                {quarter.items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-border/80 bg-card p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <RoadmapItemBadges status={item.status} confidence={item.confidence} />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-16" aria-labelledby="out-of-scope-heading">
          <h2 id="out-of-scope-heading" className="text-2xl font-semibold">
            Out of scope (2026)
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We defer these until partner contracts or pilot signal justify the build cost.
          </p>
          <ul className="mt-6 space-y-4">
            {PUBLIC_ROADMAP_OUT_OF_SCOPE.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-medium text-foreground">{item.title}</h3>
                  <RoadmapItemBadges status={item.status} confidence={item.confidence} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="text-xl font-semibold">Shape the roadmap with us</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Design partners get weekly product feedback and direct influence on Q3 priorities.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <MarketingButton href={publicRoadmapCtaHref("/book-demo")}>
              Book a demo
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </MarketingButton>
            <MarketingButton variant="secondary" href={publicRoadmapCtaHref("/blog/why-we-built-os-kitchen")}>
              Read founder story
            </MarketingButton>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
