import type { Metadata } from "next";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { FAQ } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MultiLocation } from "@/components/landing/multi-location";
import { PosEcosystem } from "@/components/landing/pos-ecosystem";
import { Pricing } from "@/components/landing/pricing";
import { ProductionIntelligence } from "@/components/landing/production-intelligence";
import { Testimonials } from "@/components/landing/testimonials";
import { PilotCohortStrip } from "@/components/landing/pilot-cohort-strip";
import { TrustedBy } from "@/components/landing/trusted-by";
import { TrustStrip } from "@/components/landing/trust-strip";
import { WhoItsFor } from "@/components/landing/who-its-for";
import { FAQSchema } from "@/components/seo/schema-org";
import { APP_NAME } from "@/lib/constants";
import { LANDING_FAQS } from "@/lib/marketing/landing-faq";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: `${APP_NAME} — Restaurant POS & Kitchen Operations Platform`,
  description:
    "All-in-one POS, kitchen display, table management, and online ordering for restaurants, bars, cafés, and meal prep kitchens. 14-day free trial. No hardware required.",
  path: "/",
  keywords: [
    "restaurant POS software",
    "kitchen display system",
    "table management software",
    "meal prep software",
    "bar POS software",
    "ghost kitchen software",
  ],
});

const faqSchemaItems = LANDING_FAQS.map((item) => ({
  question: item.q,
  answer: item.a,
}));

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <FAQSchema questions={faqSchemaItems} />
      <SiteHeader />
      <main>
        <Hero />
        <TrustedBy />
        <PilotCohortStrip />
        <TrustStrip />
        <WhoItsFor />
        <ProductionIntelligence />
        <PosEcosystem />
        <HowItWorks />
        <MultiLocation />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
