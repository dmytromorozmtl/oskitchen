import type { Metadata } from "next";

import { FeatureGrid, Hero, PublicShell } from "@/components/marketing/public-page";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "KitchenOS Support — Help Center & Resources",
  description:
    "Get help with KitchenOS setup, integrations, billing, and launch. Browse guides or contact our support team.",
  path: "/support",
});

export default function SupportPage() {
  return (
    <PublicShell>
      <Hero
        eyebrow="Support"
        title="Get help with KitchenOS setup, integrations, billing, and launch."
        description="Browse guides, contact support, or request features. We do not promise live marketplace integrations without your credentials and approvals."
        cta="Contact support"
        ctaHref="/support/contact"
        secondary="View resources"
        secondaryHref="/resources"
      />
      <FeatureGrid
        items={[
          {
            title: "Integration support",
            description:
              "WooCommerce, Shopify, Uber architecture, webhooks, and credential readiness.",
          },
          {
            title: "Billing & plans",
            description: "Subscriptions, trials, and entitlements for your workspace.",
          },
          {
            title: "Implementation",
            description: "Onboarding checklists, imports, and staff training resources.",
          },
        ]}
      />
    </PublicShell>
  );
}
