import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';

import { MarketingCard } from '@/components/marketing/card';
import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { SectionHeader } from '@/components/marketing/section-header';
import { BLOG_POSTS } from '@/lib/marketing/blog-posts';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { resourcePages } from '@/lib/public-copy';

export const metadata: Metadata = marketingPageMetadata({
  title: 'OS Kitchen Resources — Guides, Comparisons & Operator Stories',
  description:
    'Guides for meal prep, catering, and restaurant operations — plus POS comparisons, customer playbooks, and capability documentation.',
  path: '/resources',
});

const RESOURCE_HUB_LINKS = [
  {
    title: 'Restaurant financing resources',
    description: 'Third-party working-capital education — OS Kitchen does not originate loans.',
    href: '/resources/restaurant-financing',
  },
  {
    title: 'Get started by business type',
    description: 'Choose trial, demo, or sales path for your segment.',
    href: '/get-started',
  },
  {
    title: 'Compare POS & kitchen software',
    description: 'Toast vs Square vs OS Kitchen and meal prep comparisons.',
    href: '/compare',
  },
  {
    title: 'Customer stories (pilot playbooks)',
    description: 'Illustrative outcomes from pilot cohort conversations.',
    href: '/customers',
  },
  {
    title: 'Capability sheet (sales-safe)',
    description: 'Live, beta, and out-of-scope features — for procurement and pilots.',
    href: '/capabilities',
  },
  {
    title: 'Trust & security overview',
    description: 'How we handle data, uptime expectations, and what we do not claim.',
    href: '/trust',
  },
] as const;

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="py-12 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Resources</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Practical guides — no hype, no fake logos
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Content for operators and buyers evaluating kitchen software. Every claim ties back to what we ship
            today or label on the roadmap.
          </p>
        </section>

        <SectionHeader tag="Start here" title="Evaluation toolkit" />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {RESOURCE_HUB_LINKS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="group block h-full">
                <MarketingCard hover className="h-full p-6">
                  <h2 className="font-semibold group-hover:text-primary">{item.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Open
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </MarketingCard>
              </Link>
            </li>
          ))}
        </ul>

        <SectionHeader tag="Blog" title="Latest articles" className="mt-16" />
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <MarketingCard hover className="h-full p-6">
                  <p className="text-xs font-medium text-primary">{post.category}</p>
                  <h2 className="mt-2 font-semibold leading-snug group-hover:text-primary">{post.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{post.readTime}</p>
                </MarketingCard>
              </Link>
            </li>
          ))}
        </ul>

        <SectionHeader tag="Guides" title="Workflow playbooks" className="mt-16" />
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {Object.entries(resourcePages).map(([slug, title]) => (
            <li key={slug}>
              <Link href={`/resources/${slug}`} className="group block h-full">
                <MarketingCard hover className="h-full p-6">
                  <h2 className="font-semibold group-hover:text-primary">{title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Read guide →</p>
                </MarketingCard>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
