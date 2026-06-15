import Link from "next/link";

import { FeatureGrid, Hero, PublicShell } from "@/components/marketing/public-page";

export const metadata = { title: "Developers" };

export default function DevelopersPage() {
  return (
    <PublicShell>
      <Hero eyebrow="Developer platform" title="OS Kitchen API, webhooks, and OAuth app marketplace pilot." description="Enterprise API, outbound webhooks, OAuth sandbox install, partner app review, and embedded admin surfaces — phased BETA, not a full Toast/Square marketplace yet." cta="Register OAuth app" ctaHref="/developers/apps/register" secondary="Webhook docs" secondaryHref="/developers/webhooks" />
      <FeatureGrid items={[
        { title: "OAuth apps (Phase 3–4)", description: "Sandbox install with scoped koa_ tokens, platform review pipeline, optional embedded admin iframe." },
        { title: "Outbound webhooks", description: "Signed order, reservation, waitlist, and inventory events with retries and delivery logs." },
        { title: "Public API", description: "Enterprise-gated v1 endpoints — partner OAuth tokens map to developer API scopes." },
      ]} />
      <section className="mx-auto max-w-2xl px-4 pb-16 text-center sm:px-6">
        <Link href="/dashboard/integrations/oauth-apps" className="text-sm text-muted-foreground underline">
          Open workspace OAuth apps hub →
        </Link>
      </section>
    </PublicShell>
  );
}
