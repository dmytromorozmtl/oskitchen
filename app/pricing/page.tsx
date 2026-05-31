import type { Metadata } from "next";

import { PricingPage } from "@/components/marketing/pricing-page";
import { PricingViewTracker } from "@/components/marketing/pricing-view-tracker";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { FAQSchema } from "@/components/seo/schema-org";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";
import { PRICING_FAQ_ITEMS } from "@/lib/marketing/pricing-faq";

export const metadata: Metadata = marketingPageMetadata({
  title: "OS Kitchen Pricing — Restaurant POS & Kitchen Operations Plans",
  description:
    "Restaurant POS & kitchen software pricing. Starter $29, Pro $79, Team $199/mo. 14-day free trial. No hardware required.",
  path: "/pricing",
  keywords: ["meal prep software pricing", "catering software cost", "kitchen software plans"],
});

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <FAQSchema questions={PRICING_FAQ_ITEMS} />
      <PricingViewTracker />
      <SiteHeader />
      <PricingPage />
      <SiteFooter />
    </div>
  );
}
