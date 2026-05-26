import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { ArticleSchema } from '@/components/seo/schema-org';
import { Button } from '@/components/ui/button';
import { PRODUCTION_APP_URL } from '@/lib/auth/public-site-url';
import type { BlogPostMeta } from '@/lib/marketing/blog-posts';
import { relatedBlogPosts } from '@/lib/marketing/blog-related';

export function BlogArticleShell({
  meta,
  children,
}: {
  meta: BlogPostMeta;
  children: React.ReactNode;
}) {
  const path = `/blog/${meta.slug}`;
  const url = `${PRODUCTION_APP_URL}${path}`;
  const related = relatedBlogPosts(meta.slug, 3);

  return (
    <div className="min-h-screen bg-background">
      <ArticleSchema
        title={meta.title}
        description={meta.description}
        url={url}
        datePublished={meta.date}
      />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Breadcrumbs
          items={[
            { name: 'Home', href: '/' },
            { name: 'Blog', href: '/blog' },
            { name: meta.category, href: path },
          ]}
        />
        <header className="mt-8 mb-10">
          <p className="text-xs font-medium text-primary bg-primary/10 inline-block px-2 py-0.5 rounded-full">
            {meta.category}
          </p>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            {meta.title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {meta.date} · {meta.readTime}
          </p>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{meta.description}</p>
        </header>
        <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-primary">
          {children}
        </article>
        {related.length > 0 ? (
          <section className="mt-14 border-t pt-10" aria-labelledby="related-articles">
            <h2 id="related-articles" className="text-lg font-semibold tracking-tight">
              Related guides
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {related.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block rounded-xl border border-border/80 p-4 transition-colors hover:border-primary/40 hover:bg-muted/30"
                  >
                    <span className="text-xs font-medium text-primary">{post.category}</span>
                    <span className="mt-1 block font-medium leading-snug">{post.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <div className="mt-16 rounded-2xl border bg-primary/5 p-8 text-center">
          <h2 className="text-xl font-bold">Run your kitchen on KitchenOS</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            14-day free trial · POS, production, packing, and storefront in one workspace.
          </p>
          <Button asChild className="mt-6 rounded-full" size="lg">
            <Link href="/signup">
              Start free trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
