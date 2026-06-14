import Link from "next/link";
import type { Metadata } from "next";

import { Disclaimer, FeatureGrid, Hero, PublicShell } from "@/components/marketing/public-page";
import { TrustMaturityLabelsSection } from "@/components/marketing/trust-maturity-labels-section";
import { TrustPageSecurityDetailsSection } from "@/components/marketing/trust-page-security-details-section";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

/** Trust page — BETA / PREVIEW / SKIPPED maturity labels (MKT-08, FINAL-19). */
export const metadata: Metadata = marketingPageMetadata({
  title: "Trust center — security, uptime, GDPR, PCI & honest feature labels",
  description:
    "Webhook security 59/59 verified, uptime probes, US-primary data residency, GDPR/PCI posture, and BETA/Preview/SKIPPED maturity labels — not fake compliance badges.",
  path: "/trust",
  keywords: [
    "OS Kitchen BETA badge",
    "integration health SKIPPED",
    "restaurant software trust",
    "feature maturity labels",
  ],
});

export default function TrustPage() {
  return (
    <PublicShell>
      <Hero
        eyebrow="Trust & feature honesty"
        title="We label what is live, beta, or skipped — so rush hour never surprises you."
        description="OS Kitchen uses BETA, Preview, Pilot ready, and SKIPPED badges across dashboard nav and Integration Health. This page explains each label for operators, sales, and security reviewers. Security practices are summarized below."
        cta="Integration matrix"
        ctaHref="/integrations"
        secondary="Pilot pricing & SKUs"
        secondaryHref="/pricing"
      />
      <TrustMaturityLabelsSection />
      <TrustPageSecurityDetailsSection />
      <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">Security & data handling</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Enterprise-ready control language below — not formal SOC 2, HIPAA, or PCI attestation
          claims.
        </p>
      </section>
      <FeatureGrid
        items={[
          {
            title: "Security overview",
            description:
              "Tenant-scoped queries, server-side secrets, Prisma-backed data access, and production safety docs — designed with enterprise-ready controls.",
          },
          {
            title: "Data handling",
            description:
              "Customer data export tools are available; destructive deletion is handled through reviewed workflows.",
          },
          {
            title: "Infrastructure",
            description:
              "Designed for managed Postgres/Supabase, Vercel deployment, encrypted env vars, and audit-ready setup docs.",
          },
          {
            title: "Authentication",
            description:
              "Supabase Auth-backed sessions with owner/staff roles and billing-aware access controls.",
          },
          {
            title: "Payment security",
            description:
              "Stripe handles payment processing. OS Kitchen stores subscription identifiers, not raw card data.",
          },
          {
            title: "Integrations security",
            description:
              "Credentials are stored server-side; production access depends on proper customer-provided credentials.",
          },
          {
            title: "Webhook security",
            description:
              "Webhook signing checks are documented and used where provider secrets are configured.",
          },
          {
            title: "Data export",
            description:
              "Workspace exports exist for orders, customers, products, and integration metadata.",
          },
          {
            title: "Responsible AI note",
            description:
              "AI/copilot experiences should be treated as assistance, not authoritative legal, tax, nutrition, or operational decisions.",
          },
          {
            title: "SOC 2 roadmap",
            description:
              "SOC 2 in progress — Type I target Q4 2026 (not certified). See SOC2 roadmap doc for controls timeline.",
          },
          {
            title: "Platform / admin access",
            description:
              "Platform routes are internal-only; end-customers are redirected. Sensitive support actions should be permission-gated and audited when enabled.",
          },
          {
            title: "Security questions",
            description:
              "Contact support with security questions, vendor review forms, or responsible disclosure notes.",
          },
        ]}
      />
      <Disclaimer>
        OS Kitchen SOC 2 Type I is in progress (Q4 2026 target, not certified). We do not claim HIPAA,
        PCI compliance, GDPR compliance, or food labeling compliance. Full enterprise SSO/SCIM is
        roadmap unless explicitly enabled for your tenant in writing. SKIPPED integration states are
        honest — not production LIVE claims.
      </Disclaimer>
      <p className="mx-auto max-w-3xl px-4 pb-8 text-center text-sm text-muted-foreground">
        <Link href="/trust/status" className="underline">
          Service snapshot (engineering)
        </Link>
        {" · "}
        <Link href="/ai" className="underline">
          AI modules (honest positioning)
        </Link>
        {" · "}
        <Link href="/legal/data-rights" className="underline">
          Data rights template
        </Link>
        {" · "}
        <Link href="/pricing" className="underline">
          Pilot pricing SKUs
        </Link>
        {" · "}
        <Link href="/trust/forbidden-claims-training" className="underline">
          Forbidden claims quiz
        </Link>
      </p>
    </PublicShell>
  );
}
