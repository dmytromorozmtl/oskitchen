import Link from "next/link";

import { Hero, PublicShell, FeatureGrid } from "@/components/marketing/public-page";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Partner portal" };

export default function PartnerPortalPage() {
  return (
    <PublicShell>
      <Hero
        eyebrow="Partner portal"
        title="Manage client implementations with OS Kitchen."
        description="Foundation for agencies and consultants: client readiness, implementation stage, blockers, and commission placeholders. Payout automation is not implemented."
        cta="View clients"
        ctaHref="/partner/clients"
        secondary="Apply as partner"
        secondaryHref="/partners"
      />
      <FeatureGrid items={[
        { title: "Implementation stage", description: "Track launch readiness and open blockers." },
        { title: "Client health", description: "Review plan status, support needs, and onboarding progress." },
        { title: "Revenue placeholder", description: "Referral/commission architecture without payout automation." },
      ]} />
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <Button asChild variant="outline"><Link href="/partner/implementation">Partner implementation view</Link></Button>
      </div>
    </PublicShell>
  );
}
