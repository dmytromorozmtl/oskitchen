import { PublicShell, FeatureGrid, Hero } from "@/components/marketing/public-page";

export const metadata = { title: "Developer webhooks" };

export default function DeveloperWebhooksPage() {
  return (
    <PublicShell>
      <Hero eyebrow="Webhooks roadmap" title="Future event subscriptions for partners." description="KitchenOS already processes provider webhooks. Customer-facing outbound webhook subscriptions are planned, not live." />
      <FeatureGrid items={[
        { title: "Events", description: "orders.created, products.updated, production.completed, packing.failed, delivery.dispatched." },
        { title: "Security", description: "Signed payloads, replay protection, and secret rotation are required before launch." },
        { title: "Operations", description: "Retries, delivery logs, and rate limits are planned." },
      ]} />
    </PublicShell>
  );
}
