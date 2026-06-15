import type { Metadata } from "next";
import Link from "next/link";

import { LegalDraftBanner } from "@/components/legal/legal-draft-banner";
import { APP_NAME } from "@/lib/constants";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "Data processing agreement (template)",
  description: `DPA template placeholder for ${APP_NAME}.`,
  path: "/legal/dpa",
});

export default function DpaPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <LegalDraftBanner />
      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
        Template — execute a proper DPA with enterprise customers.
      </p>
      <h1 className="font-semibold tracking-tight">Data Processing Agreement (outline)</h1>
      <p>
        Defines roles (controller/processor), subprocessors (Supabase, Stripe, Resend, Vercel),
        technical measures, subprocessors change notice, and deletion timelines.
      </p>
      <p>Replace with counsel-approved exhibit before enterprise sales.</p>
      <p>
        <Link href="/" className="text-primary">
          ← Back home
        </Link>
      </p>
    </article>
  );
}
