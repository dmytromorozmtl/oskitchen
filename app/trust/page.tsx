import Link from "next/link";
import type { Metadata } from "next";

import { Disclaimer, FeatureGrid, Hero, PublicShell } from "@/components/marketing/public-page";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = marketingPageMetadata({
  title: "Trust center",
  description:
    "KitchenOS security posture, data handling, infrastructure, and compliance roadmap.",
  path: "/trust",
});

export default function TrustPage() {
  return (
    <PublicShell>
      <Hero
        eyebrow="Trust center"
        title="Designed with security-conscious practices for food operations data."
        description="KitchenOS centralizes orders, menus, customers, production, packing, and integrations with role-based access, audit logs, and credential redaction. This page summarizes current safeguards using enterprise-ready control language — not formal certification claims."
        cta="Contact security"
        ctaHref="/support/contact"
        secondary="Read legal templates"
        secondaryHref="/legal/security"
      />
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
              "Stripe handles payment processing. KitchenOS stores subscription identifiers, not raw card data.",
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
            title: "Compliance roadmap",
            description:
              "Formal compliance certifications are future roadmap items, not current claims.",
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
        KitchenOS does not currently claim SOC 2, HIPAA, PCI compliance, GDPR compliance, or food
        labeling compliance. Full enterprise SSO/SCIM is roadmap unless explicitly enabled for your
        tenant in writing. Formal compliance certifications are future roadmap items.
      </Disclaimer>
      <p className="mx-auto max-w-3xl px-4 pb-8 text-center text-sm text-muted-foreground">
        <Link href="/trust/status" className="underline">
          Service snapshot (engineering)
        </Link>{" "}
        ·{" "}
        <Link href="/legal/data-rights" className="underline">
          Data rights template
        </Link>
      </p>
    </PublicShell>
  );
}
