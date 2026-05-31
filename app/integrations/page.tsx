import type { Metadata } from "next";
import Link from "next/link";

import { CapabilityMatrixPanel } from "@/components/capabilities/capability-matrix-panel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { INTEGRATION_HUB_LINKS } from "@/lib/marketing/integration-seo";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";
import { listMarketingCapabilities } from "@/lib/marketing/marketing-capabilities";

export const metadata: Metadata = marketingPageMetadata({
  title: "Integrations & Sales Channels — OS Kitchen",
  description: `Connect WooCommerce, Shopify, manual orders, and storefront preorders to ${APP_NAME} production — with honest Live, Beta, partner-required, and roadmap statuses.`,
  path: "/integrations",
  keywords: [
    "restaurant order integrations",
    "meal prep WooCommerce kitchen software",
    "Shopify fulfillment operations",
  ],
});

export default function IntegrationsMarketingHubPage() {
  const capabilities = listMarketingCapabilities();
  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-16 sm:px-6">
      <div className="space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Integrations
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight">
          Integrations &amp; sales channels
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {APP_NAME} centralizes incoming orders without pretending unsupported channels are live.
          Connect real credentials when you&apos;re ready — or rehearse with simulated demo data.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="premium" className="rounded-full">
            <Link href="/signup">Start free trial</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/book-demo">Book demo</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/capabilities">Capability sheet</Link>
          </Button>
        </div>
      </div>

      <CapabilityMatrixPanel rows={capabilities} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATION_HUB_LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="h-full border-border/80 bg-card/90 shadow-sm transition hover:border-primary/30">
              <CardHeader>
                <CardTitle>{l.title}</CardTitle>
                <CardDescription className="line-clamp-2">{l.body}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
