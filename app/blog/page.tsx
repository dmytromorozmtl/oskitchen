import type { Metadata } from 'next';
import Link from 'next/link';

import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { BLOG_POSTS } from '@/lib/marketing/blog-posts';

export const metadata: Metadata = marketingPageMetadata({
  title: 'Blog — Restaurant & Kitchen Operations Guides | KitchenOS',
  description:
    'Guides on restaurant POS, kitchen management, meal prep business, and food cost optimization.',
  path: '/blog',
  keywords: ['restaurant POS guide', 'meal prep business', 'kitchen operations blog'],
});

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight">KitchenOS Blog</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Guides on restaurant POS, kitchen management, and food business operations.
        </p>
        <div className="mt-12 grid gap-8">
          {BLOG_POSTS.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group rounded-xl border border-border/80 bg-card p-6 hover:shadow-md hover:border-primary/40 transition-all"
            >
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {article.category}
                </span>
                <span className="text-xs text-muted-foreground">{article.date}</span>
                <span className="text-xs text-muted-foreground">{article.readTime}</span>
              </div>
              <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                {article.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{article.description}</p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
