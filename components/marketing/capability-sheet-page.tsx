import Link from 'next/link';

import { MarketingButton } from '@/components/marketing/button';
import { MarketingCard } from '@/components/marketing/card';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { BreadcrumbSchema } from '@/components/seo/schema-org';
import { PRODUCTION_APP_URL } from '@/lib/auth/public-site-url';
import {
  APPROVED_CAPABILITIES,
  BETA_DISCLOSURES,
  CAPABILITY_SHEET_COPY,
  NOT_AVAILABLE,
  STATUS_LABELS,
  type CapabilityRow,
  type CapabilityStatus,
} from '@/lib/marketing/capability-sheet-content';

const STATUS_STYLES: Record<CapabilityStatus, string> = {
  live: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  beta: 'bg-amber-500/10 text-amber-800 dark:text-amber-300',
  setup: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  partial: 'bg-muted text-muted-foreground',
  roadmap: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
  unavailable: 'bg-muted text-muted-foreground',
};

function CapabilityList({ rows }: { rows: CapabilityRow[] }) {
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.name}>
          <MarketingCard hover={false} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-semibold text-foreground">{row.name}</p>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[row.status]}`}
              >
                {STATUS_LABELS[row.status]}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{row.summary}</p>
          </MarketingCard>
        </li>
      ))}
    </ul>
  );
}

export function CapabilitySheetPage() {
  const copy = CAPABILITY_SHEET_COPY;

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: PRODUCTION_APP_URL },
          { name: 'Capabilities', url: `${PRODUCTION_APP_URL}/capabilities` },
        ]}
      />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Breadcrumbs
          items={[
            { name: 'Home', href: '/' },
            { name: 'Capabilities', href: '/capabilities' },
          ]}
        />

        <header className="py-10 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{copy.eyebrow}</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{copy.headline}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{copy.subheadline}</p>
          <p className="mt-4 text-sm italic text-muted-foreground">{copy.disclaimer}</p>
          <p className="mt-2 text-xs text-muted-foreground">Last updated {copy.updated}</p>
        </header>

        <section className="space-y-4 pb-10">
          <h2 className="text-lg font-semibold">Approved to sell (pilot)</h2>
          <CapabilityList rows={APPROVED_CAPABILITIES} />
        </section>

        <section className="space-y-4 border-t border-border/60 py-10">
          <h2 className="text-lg font-semibold">Beta — disclose in contract</h2>
          <CapabilityList rows={BETA_DISCLOSURES} />
        </section>

        <section className="space-y-4 border-t border-border/60 py-10">
          <h2 className="text-lg font-semibold">Not available or roadmap only</h2>
          <CapabilityList rows={NOT_AVAILABLE} />
        </section>

        <section className="rounded-2xl border border-primary/15 bg-primary/5 px-6 py-8 text-center">
          <p className="text-sm font-medium">Evaluating a pilot?</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Pair this sheet with a{' '}
            <Link href="/compare/restaurant-pos" className="text-primary hover:underline">
              competitive comparison
            </Link>{' '}
            or{' '}
            <Link href="/pricing" className="text-primary hover:underline">
              TCO model
            </Link>
            .
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <MarketingButton href="/signup">Start free trial</MarketingButton>
            <MarketingButton href="/contact-sales" variant="secondary">
              Contact sales
            </MarketingButton>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
