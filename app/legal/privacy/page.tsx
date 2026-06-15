import type { Metadata } from "next";
import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { areLegalPoliciesPublished, legalPolicyPageMetadata } from "@/lib/legal/legal-policies-published";

export function generateMetadata(): Metadata {
  return legalPolicyPageMetadata({ slug: "privacy", appName: APP_NAME });
}

export default function PrivacyPage() {
  const published = areLegalPoliciesPublished();

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      {published ? (
        <div className="not-prose mb-6 rounded-lg border border-emerald-500/40 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-500/40 dark:bg-emerald-950/35 dark:text-emerald-50">
          <p className="font-semibold">Marked as published</p>
          <p className="mt-1 text-xs leading-relaxed opacity-90">
            This build sets <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">LEGAL_POLICIES_PUBLISHED=true</code>.
            Search engines are allowed to index this URL; ensure the page body matches counsel-approved text for every
            jurisdiction you operate in.
          </p>
        </div>
      ) : (
        <>
          <div className="not-prose mb-6 rounded-lg border border-amber-400/60 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-50">
            <p className="font-semibold">Draft — not legal advice</p>
            <p className="mt-1 text-xs leading-relaxed opacity-90">
              This page is an engineering starter template. Do not rely on it as a privacy policy until qualified
              counsel reviews and replaces it for each jurisdiction you operate in. Billing and payments are processed by
              Stripe under their terms; {APP_NAME} remains the data controller for workspace content you enter. Metadata
              uses <span className="font-medium">noindex</span> until you set{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">LEGAL_POLICIES_PUBLISHED=true</code> after
              review.
            </p>
          </div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            Starter template — have counsel review before launch.
          </p>
        </>
      )}
      <h1 className="font-semibold tracking-tight">Privacy policy</h1>
      <p>
        This placeholder describes how {APP_NAME} may collect and process data. Replace with
        jurisdiction-specific language, subprocessors, retention windows, and contact details.
      </p>
      <h2>Data we process</h2>
      <p>
        Account identifiers from Supabase Auth, operational kitchen data you enter, integration
        payloads required for order sync, and transactional email metadata when email is
        enabled.
      </p>
      <h2>Your rights</h2>
      <p>
        Describe access, correction, deletion, and portability consistent with GDPR/CCPA as
        applicable.
      </p>
      <p className="not-prose flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link href="/trust" className="text-primary hover:underline">
          Trust center
        </Link>
        <Link href="/legal/security" className="text-primary hover:underline">
          Security summary
        </Link>
        <Link href="/" className="text-primary hover:underline">
          ← Back home
        </Link>
      </p>
    </article>
  );
}
