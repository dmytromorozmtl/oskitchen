import type { Metadata } from "next";
import Link from "next/link";

import { LegalDraftBanner } from "@/components/legal/legal-draft-banner";
import { APP_NAME } from "@/lib/constants";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "Security overview",
  description: `How ${APP_NAME} approaches security — high level, non-certification.`,
  path: "/legal/security",
});

export default function SecurityPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <LegalDraftBanner />
      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
        Overview only — not a SOC 2 report or penetration test summary.
      </p>
      <h1 className="font-semibold tracking-tight">Security</h1>
      <p>
        {APP_NAME} uses Supabase for authentication and Postgres hosting, encrypted integration
        secrets at the application layer, and HTTPS for transport. Webhook signatures are
        verified where providers support them.
      </p>
      <p>
        Document your incident response contacts, key rotation cadence, and vendor list here
        after review.
      </p>
      <p>
        <Link href="/" className="text-primary">
          ← Back home
        </Link>
      </p>
    </article>
  );
}
