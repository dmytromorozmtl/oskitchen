import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Shopify custom app",
  description: `How ${APP_NAME} connects via Shopify Admin API — readiness notes only (no marketplace approval claimed).`,
};

export default function ShopifyAppMarketingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-16 text-sm leading-relaxed text-muted-foreground sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Shopify custom app (OS Kitchen)
        </h1>
        <p>
          OS Kitchen uses a <strong className="text-foreground">custom app</strong> pattern today:
          merchants paste an Admin API access token and webhook signing secret into their encrypted
          OS Kitchen workspace — OAuth-based installs are the natural upgrade path before{" "}
          <strong className="text-foreground">Shopify App Store</strong> submission.
        </p>
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Listing readiness checklist</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Public app URL + GDPR webhooks (customer data request / erasure).</li>
            <li>App uninstall webhook (`app-uninstalled`) already scaffolded.</li>
            <li>Privacy policy + terms URLs hosted on kitchenos.app legal routes.</li>
            <li>Required scopes documented — start read-only on orders + products.</li>
            <li>Embedded admin optional — document session token strategy separately.</li>
          </ul>
        </section>
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-950 dark:text-amber-50">
          OS Kitchen does <strong>not</strong> claim Shopify App Store approval until an audit passes
          — treat this page as engineering preparation only.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/pricing" className="text-primary underline">
            Pricing
          </Link>
          <Link href="/book-demo" className="text-primary underline">
            Book demo
          </Link>
          <Link href="/dashboard/integrations/shopify" className="text-primary underline">
            Dashboard setup
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
