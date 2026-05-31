import type { Metadata } from "next";
import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "WooCommerce Extension Readiness — OS Kitchen",
  description: `WordPress-friendly overview for connecting WooCommerce to ${APP_NAME} with REST keys and signed webhooks.`,
  path: "/integrations/woocommerce/extension",
});

/** Content only — shell from `app/integrations/layout.tsx`. */
export default function WooCommerceExtensionPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-16 text-sm leading-relaxed text-muted-foreground sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">WooCommerce</p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        WooCommerce extension positioning
      </h1>
      <p>
        OS Kitchen connects with WooCommerce REST API keys and signed webhooks — no GPL plugin is
        strictly required because credentials are entered into OS Kitchen directly. A future
        WordPress extension could streamline key rotation and webhook registration for merchants.
      </p>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Security considerations</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Keys must use HTTPS endpoints only.</li>
          <li>Webhook secrets validate HMAC signatures server-side.</li>
          <li>Never log raw payloads in production diagnostics.</li>
        </ul>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Merchant instructions</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Create REST keys with order + product read scopes.</li>
          <li>Paste keys into OS Kitchen WooCommerce card.</li>
          <li>Register webhook URL shown after saving the connection.</li>
        </ol>
      </section>
      <div className="flex flex-wrap gap-3">
        <Link href="/integrations/woocommerce" className="font-medium text-primary hover:underline">
          Integration overview
        </Link>
        <Link href="/book-demo" className="font-medium text-primary hover:underline">
          Book demo
        </Link>
        <Link href="/pricing" className="font-medium text-primary hover:underline">
          Pricing
        </Link>
      </div>
    </div>
  );
}
