import { FeatureGrid, Hero, PublicShell } from "@/components/marketing/public-page";

export const metadata = { title: "Developers" };

export default function DevelopersPage() {
  return (
    <PublicShell>
      <Hero eyebrow="Developer platform" title="OS Kitchen API and webhook roadmap." description="Enterprise API foundations exist today. A broader developer ecosystem, app marketplace, SDKs, and embedded widgets are roadmap items." cta="Read docs" ctaHref="/developers/docs" secondary="Webhook roadmap" secondaryHref="/developers/webhooks" />
      <FeatureGrid items={[
        { title: "Public API", description: "Current v1 endpoints are Enterprise-gated and tenant-scoped." },
        { title: "Webhook subscriptions", description: "Roadmap for event subscriptions, retries, and signing." },
        { title: "Integration SDK", description: "Future SDK for partner-built channel connectors." },
      ]} />
    </PublicShell>
  );
}
