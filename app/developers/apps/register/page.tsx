import Link from "next/link";

import { PartnerAppRegisterForm } from "@/components/developers/partner-app-register-form";
import { Hero, PublicShell } from "@/components/marketing/public-page";

export const metadata = { title: "Register partner OAuth app" };

export default function PartnerAppRegisterPage() {
  return (
    <PublicShell>
      <Hero
        eyebrow="Developer platform — Phase 4"
        title="Submit your OAuth app for KitchenOS review."
        description="Partners register client metadata, redirect URIs, scopes, and optional embedded admin URLs. Platform staff approve to SANDBOX before merchants can install via the OAuth consent flow."
        cta="OAuth apps hub"
        ctaHref="/dashboard/integrations/oauth-apps"
        secondary="Webhook docs"
        secondaryHref="/developers/webhooks"
      />
      <section className="mx-auto max-w-2xl px-4 pb-16 sm:px-6">
        <div className="mb-6 rounded-lg border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
          Not a self-serve app store — submissions enter{" "}
          <Link href="/platform/partner-apps" className="underline">
            platform review
          </Link>
          . Payment/card scopes are never granted. Embedded surfaces must declare explicit origins.
        </div>
        <PartnerAppRegisterForm />
      </section>
    </PublicShell>
  );
}
