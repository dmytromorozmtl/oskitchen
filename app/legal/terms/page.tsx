import type { Metadata } from "next";
import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { areLegalPoliciesPublished, legalPolicyPageMetadata } from "@/lib/legal/legal-policies-published";

export function generateMetadata(): Metadata {
  return legalPolicyPageMetadata({ slug: "terms", appName: APP_NAME });
}

export default function TermsPage() {
  const published = areLegalPoliciesPublished();

  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      {published ? (
        <div className="not-prose mb-6 rounded-lg border border-emerald-500/40 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 dark:border-emerald-500/40 dark:bg-emerald-950/35 dark:text-emerald-50">
          <p className="font-semibold">Marked as published</p>
          <p className="mt-1 text-xs leading-relaxed opacity-90">
            This build sets <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">LEGAL_POLICIES_PUBLISHED=true</code>.
            Search engines are allowed to index this URL; ensure the body reflects counsel-approved terms before keeping
            this flag on in production.
          </p>
        </div>
      ) : (
        <>
          <div className="not-prose mb-6 rounded-lg border border-amber-400/60 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-50">
            <p className="font-semibold">Draft — not legal advice</p>
            <p className="mt-1 text-xs leading-relaxed opacity-90">
              This page is an engineering starter template. It is not a binding contract until counsel replaces it.
              Subscription billing may be processed by Stripe; operators remain responsible for their own policies toward
              end customers. Metadata uses <span className="font-medium">noindex</span> until you set{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">LEGAL_POLICIES_PUBLISHED=true</code> after
              review.
            </p>
          </div>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            Starter template — requires legal review.
          </p>
        </>
      )}
      <h1 className="font-semibold tracking-tight">Terms of service</h1>
      <p>
        Summarize acceptable use, subscription billing via Stripe, limitation of liability,
        uptime expectations, and termination. Replace this stub before accepting paying
        customers.
      </p>
      <h2>Service description</h2>
      <p>
        {APP_NAME} provides software for food operations — not food safety certification or
        insurance.
      </p>
      <p>
        <Link href="/trust" className="text-primary hover:underline">
          Trust center
        </Link>
        {" · "}
        <Link href="/legal/security" className="text-primary hover:underline">
          Security summary
        </Link>
        {" · "}
        <Link href="/" className="text-primary hover:underline">
          ← Back home
        </Link>
      </p>
    </article>
  );
}
