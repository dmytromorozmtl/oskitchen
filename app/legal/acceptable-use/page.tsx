import type { Metadata } from "next";
import Link from "next/link";

import { LegalDraftBanner } from "@/components/legal/legal-draft-banner";
import { PublicShell } from "@/components/marketing/public-page";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "Acceptable Use Policy",
  description:
    "KitchenOS acceptable use guidelines for operators, integrations, and customer-facing content.",
  path: "/legal/acceptable-use",
});

export default function AcceptableUsePage() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-16 sm:px-6">
        <LegalDraftBanner />
        <h1 className="text-3xl font-semibold tracking-tight">Acceptable Use Policy</h1>
        <p className="text-muted-foreground">
          Starter policy template requiring legal review before production reliance.
        </p>
        <p>
          Do not use KitchenOS to store unlawful content, abuse integrations, scrape platforms
          without authorization, or misrepresent food, allergen, tax, delivery, or marketplace
          approval information.
        </p>
        <p>
          Businesses are responsible for verifying nutrition, allergen, tax, and delivery-platform
          availability before using customer-facing materials.
        </p>
        <p>KitchenOS may suspend access for security abuse, fraudulent activity, or harmful behavior.</p>
        <p className="text-sm text-muted-foreground">
          <Link href="/legal/terms" className="underline">
            Terms of service
          </Link>{" "}
          ·{" "}
          <Link href="/" className="underline">
            Home
          </Link>
        </p>
      </main>
    </PublicShell>
  );
}
