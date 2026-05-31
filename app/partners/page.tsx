import type { Metadata } from "next";

import { submitPartnerLeadFormAction } from "@/actions/external";
import { FeatureGrid, Hero, PublicShell } from "@/components/marketing/public-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "OS Kitchen Partners — Integration & Agency Program",
  description:
    "Partner with OS Kitchen. Integration partners, agency referrals, and technology alliances for food business software.",
  path: "/partners",
});

export default function PartnersPage() {
  return (
    <PublicShell>
      <Hero
        eyebrow="Partner program"
        title="Help food businesses launch better operations."
        description="Agencies, consultants, and technology partners who implement OS Kitchen for meal prep, catering, and bakery operators."
        cta="Apply to partner"
        ctaHref="#apply"
        secondary="Book demo"
        secondaryHref="/book-demo"
      />
      <FeatureGrid
        items={[
          {
            title: "Implementation partners",
            description: "Onboard clients with honest capability boundaries and pilot nav profiles.",
          },
          {
            title: "Technology alliances",
            description: "Complement WooCommerce, Shopify, and operational tooling — not replace them.",
          },
          {
            title: "Referral program",
            description: "Introduce qualified operators; we handle product truth and support handoff.",
          },
        ]}
      />
      <section id="apply" className="mx-auto max-w-xl px-4 pb-16 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Partner application</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={submitPartnerLeadFormAction} className="grid gap-4">
              <Input name="companyName" placeholder="Company name" required />
              <Input name="contactName" placeholder="Your name" required />
              <Input name="email" type="email" placeholder="Email" required />
              <Textarea name="message" placeholder="How you plan to work with OS Kitchen" rows={4} />
              <Button type="submit">Submit</Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </PublicShell>
  );
}
