import Link from "next/link";

import { FeatureGrid, Hero, PublicShell } from "@/components/marketing/public-page";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Developer webhooks" };

export default function DeveloperWebhooksPage() {
  return (
    <PublicShell>
      <Hero
        eyebrow="Outbound webhooks — Phase 2 BETA"
        title="Signed event subscriptions for workspace partners."
        description="OS Kitchen processes inbound provider webhooks today. Outbound merchant-configured subscriptions with HMAC signing, retries, and delivery logs are available in dashboard BETA — OAuth app install remains Phase 3."
        cta="Dashboard setup"
        ctaHref="/dashboard/integrations/outbound-webhooks"
        secondary="Public API docs"
        secondaryHref="/developers/docs"
      />
      <FeatureGrid
        items={[
          {
            title: "Events",
            description:
              "order.created, order.updated, reservation.created, waitlist.joined, waitlist.seated, inventory.updated — PII-minimized payloads.",
          },
          {
            title: "Security",
            description:
              "X-KitchenOS-Signature HMAC-SHA256 over timestamp + body, secret rotation, HTTPS-only endpoints (localhost http in dev).",
          },
          {
            title: "Operations",
            description:
              "Exponential backoff retries, delivery logs, consecutive failure tracking, and cron drain worker.",
          },
        ]}
      />
      <section className="mx-auto max-w-2xl px-4 pb-16 text-center sm:px-6">
        <p className="text-sm text-muted-foreground">
          Operators configure subscriptions under Integrations → Outbound webhooks. Partners verify signatures
          using the signing secret shown once at creation.
        </p>
        <Button asChild className="mt-4 rounded-full">
          <Link href="/dashboard/integrations/outbound-webhooks">Open outbound webhooks</Link>
        </Button>
      </section>
    </PublicShell>
  );
}
