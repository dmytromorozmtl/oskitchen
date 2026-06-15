import { MarketingCard } from '@/components/marketing/card';

export interface RelatedPage {
  title: string;
  href: string;
  description: string;
}

export function RelatedPages({ pages }: { pages: RelatedPage[] }) {
  if (pages.length === 0) return null;

  return (
    <section className="border-t border-border/60 py-16 sm:py-20">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Continue exploring</p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Related solutions & resources</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <MarketingCard
            key={page.href}
            href={page.href}
            className="p-4 hover:border-primary/50 group"
          >
            <h3 className="font-semibold transition-colors group-hover:text-primary">{page.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{page.description}</p>
          </MarketingCard>
        ))}
      </div>
    </section>
  );
}
