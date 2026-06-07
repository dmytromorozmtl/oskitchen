import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";
import { PRODUCT_MARKETING_SLUGS, productMarketingPages } from "@/lib/product-marketing";

export const metadata: Metadata = marketingPageMetadata({
  title: "OS Kitchen Product — POS, Production, Packing & Integrations",
  description: `${APP_NAME} is the operating system for modern food operations — POS, orders, production, packing, delivery, customers, and integrations in one workspace.`,
  path: "/product",
  keywords: [
    "kitchen production software",
    "food business pos system",
    "packing management software",
    "kitchen order management",
  ],
});

export default function ProductIndexPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl space-y-10 px-4 py-16 sm:px-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Product</p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight">Modules that share one workspace</h1>
          <p className="text-lg text-muted-foreground">
            Run POS sales, online orders, production, packing, delivery, customers, and integrations from one operating
            system. Capabilities depend on your plan, credentials, and configured data — integration status is always
            labeled honestly (live, beta, setup-ready, partner-required, roadmap).
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base">POS Terminal</CardTitle>
              <CardDescription>
                Counter-first POS tied into the same orders and downstream workflows — not a generic restaurant POS
                replacement promise.
              </CardDescription>
              <Button asChild variant="link" className="mt-2 h-auto px-0 text-primary">
                <Link href="/product/pos-terminal">Read more</Link>
              </Button>
            </CardHeader>
          </Card>
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base">Integration Health Center</CardTitle>
              <CardDescription>
                Honest channel maturity, health scores, recovery playbooks, and hardware fleet — SKIPPED labels instead
                of fake green badges.
              </CardDescription>
              <Button asChild variant="link" className="mt-2 h-auto px-0 text-primary">
                <Link href="/product/integration-health-center">Read more</Link>
              </Button>
            </CardHeader>
          </Card>
          {PRODUCT_MARKETING_SLUGS.map((slug) => {
            const p = productMarketingPages[slug];
            return (
              <Card key={slug} className="border-border/80">
                <CardHeader>
                  <CardTitle className="text-base capitalize">{slug.replace(/-/g, " ")}</CardTitle>
                  <CardDescription>{p.headline}</CardDescription>
                  <Button asChild variant="link" className="mt-2 h-auto px-0 text-primary">
                    <Link href={`/product/${slug}`}>Read more</Link>
                  </Button>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button className="rounded-full" variant="premium" asChild>
            <Link href="/signup">Start trial</Link>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/demo">Try demo</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
