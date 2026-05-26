import type { Metadata } from "next";
import Link from "next/link";

import { LegalDraftBanner } from "@/components/legal/legal-draft-banner";
import { PublicShell } from "@/components/marketing/public-page";
import { APP_NAME } from "@/lib/constants";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "Cookie Policy",
  description: `How ${APP_NAME} uses essential and analytics cookies, and how to manage consent.`,
  path: "/legal/cookie-policy",
});

export default function CookiePolicyPage() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-16 sm:px-6">
        <LegalDraftBanner />
        <h1 className="text-3xl font-semibold tracking-tight">Cookie Policy</h1>
        <p className="text-muted-foreground">
          This page describes how {APP_NAME} uses cookies and similar technologies on our marketing
          site and product. Replace with counsel-reviewed language for each jurisdiction you operate
          in.
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Essential cookies</h2>
          <p>
            Required for authentication, session security, CSRF protection, and core product
            operation. These cannot be disabled while using signed-in features.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Analytics cookies</h2>
          <p>
            We use Google Analytics (GA4) on marketing pages to understand traffic and improve the
            site. Analytics cookies are disabled by default until you choose &quot;Accept All&quot;
            on the cookie banner. If you choose &quot;Essential Only&quot;, analytics storage stays
            denied and GA does not send measurement hits.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">How to decline or withdraw consent</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              Use the cookie banner on your first visit: &quot;Essential Only&quot; keeps analytics
              off.
            </li>
            <li>
              Clear the <code className="rounded bg-muted px-1">kitchenos-cookie-consent</code>{" "}
              cookie in your browser and reload to see the banner again.
            </li>
            <li>
              Block or delete cookies in your browser settings. See your browser&apos;s help docs
              for instructions (Chrome, Safari, Firefox, Edge).
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Third parties</h2>
          <p>
            Google may process analytics data under their policies when you grant consent. Stripe
            may set cookies during checkout flows on billing pages.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p>
            Questions about cookies or privacy:{" "}
            <Link href="/support/contact" className="text-primary underline">
              contact support
            </Link>{" "}
            or email your account representative.
          </p>
        </section>

        <p className="text-sm text-muted-foreground">
          <Link href="/legal/privacy" className="underline">
            Privacy policy
          </Link>{" "}
          ·{" "}
          <Link href="/" className="underline">
            Home
          </Link>
        </p>
      </main>
    </PublicShell>
  );
}
