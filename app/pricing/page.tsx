import type { Metadata } from "next";

import { PilotPricingSection } from "@/components/marketing/pilot-pricing-section";
import { PricingPage } from "@/components/marketing/pricing-page";
import { PricingViewTracker } from "@/components/marketing/pricing-view-tracker";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { FAQSchema } from "@/components/seo/schema-org";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";
import { PRICING_FAQ_ITEMS } from "@/lib/marketing/pricing-faq";

export const metadata: Metadata = marketingPageMetadata({
  title: "OS Kitchen Pricing — 4 Transparent Plans",
  description:
    "Published plans: Starter $49, Pro $79, Team $199, Enterprise $499/mo. Self-serve signup with 14-day trial — no credit card required. Cancel anytime, no hardware lock-in.",
  path: "/pricing",
  keywords: [
    "meal prep software pricing",
    "ghost kitchen pilot pricing",
    "kitchen software plans",
    "restaurant pilot SKU",
  ],
});

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <FAQSchema questions={PRICING_FAQ_ITEMS} />
      <PricingViewTracker />
      <SiteHeader />
      <PricingPage />
      <PilotPricingSection />
      <SiteFooter />
    </div>
  );
}
