import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, SITE_URL } from "@/lib/constants";
import { parseProductMarketingSlug, PRODUCT_MARKETING_SLUGS, productMarketingPages } from "@/lib/product-marketing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = parseProductMarketingSlug(raw);
  if (!slug) return { title: "Product" };
  const p = productMarketingPages[slug];
  const url = `${SITE_URL}/product/${slug}`;
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url },
    openGraph: { title: p.title, description: p.description, url, siteName: APP_NAME, type: "website" },
  };
}

export function generateStaticParams() {
  return PRODUCT_MARKETING_SLUGS.map((slug) => ({ slug }));
}

export default async function ProductMarketingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: raw } = await params;
  const slug = parseProductMarketingSlug(raw);
  if (!slug) notFound();
  const p = productMarketingPages[slug];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-16 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Product</p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight capitalize">{slug.replace(/-/g, " ")}</h1>
        <p className="text-lg text-muted-foreground">{p.description}</p>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">What it does</CardTitle>
            <CardDescription className="text-foreground/90">{p.headline}</CardDescription>
          </CardHeader>
        </Card>

        <div className="rounded-2xl border bg-muted/30 p-5">
          <h2 className="font-semibold">Connected modules</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {p.connectedModules.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-5">
          <h2 className="font-semibold">Example workflow</h2>
          <p className="mt-2 text-sm text-muted-foreground">{p.exampleWorkflow}</p>
        </div>

        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
          <h2 className="font-semibold text-amber-950 dark:text-amber-100">Integration & status notes</h2>
          <p className="mt-2 text-sm text-muted-foreground">{p.integrationNote}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button className="rounded-full" variant="premium" asChild>
            <Link href={p.ctaHref}>{p.ctaLabel}</Link>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/product">All product areas</Link>
          </Button>
          <Button variant="ghost" className="rounded-full" asChild>
            <Link href="/integrations">Integrations</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
