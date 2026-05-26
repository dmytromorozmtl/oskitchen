import type { Metadata } from "next";
import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Data rights & subprocessors · ${APP_NAME}`,
  description: "Template-level data rights, subprocessors, and DPA positioning for pilots.",
  robots: { index: false, follow: false },
};

export default function DataRightsPage() {
  return (
    <div className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl px-4 py-12">
      <h1>Data rights & subprocessors</h1>
      <p>
        This page describes <strong>template-level</strong> data-rights posture for pilots. It is not a substitute for
        counsel-approved agreements. Production marketing must respect{" "}
        <code>LEGAL_POLICIES_PUBLISHED</code> and your finalized privacy program.
      </p>
      <h2>Access, correction, export</h2>
      <p>
        Workspace owners can export operational data from dashboard tools where implemented. For formal subject
        requests, contact the address listed in your executed privacy notice.
      </p>
      <h2>Deletion</h2>
      <p>
        Account deletion and hard data removal require a reviewed workflow to avoid accidental production loss. Use
        support for coordinated deletion requests.
      </p>
      <h2>Subprocessors</h2>
      <p>
        Typical infrastructure subprocessors include managed Postgres (e.g. Supabase), hosting (e.g. Vercel), email
        (Resend), payments (Stripe), and optional observability vendors when enabled. Maintain your own subprocessor
        list for customer contracts.
      </p>
      <h2>California residents (CCPA / CPRA)</h2>
      <p>
        California consumers may have rights to know, delete, correct, and opt out of certain data uses. KitchenOS does
        not sell personal information for monetary consideration. To submit a privacy request or opt out of analytics
        cookies on marketing pages, use the cookie banner or contact{" "}
        <a href="mailto:support@os-kitchen.com">support@os-kitchen.com</a> with subject line{" "}
        <strong>California Privacy Request</strong>.
      </p>
      <p>
        <strong>Do Not Sell or Share:</strong> We do not sell personal information. Marketing analytics (e.g. GA4,
        optional PostHog) may constitute “sharing” under CPRA when enabled — disable non-essential cookies via the site
        banner or browser controls.
      </p>
      <h2>DPA</h2>
      <p>
        A Data Processing Addendum is provided separately through your legal/commercial process — KitchenOS does not
        auto-generate binding legal instruments from this template page.
      </p>
      <p>
        <Link href="/legal/privacy">Privacy policy</Link> · <Link href="/legal/terms">Terms</Link> ·{" "}
        <Link href="/trust">Trust center</Link>
      </p>
    </div>
  );
}
