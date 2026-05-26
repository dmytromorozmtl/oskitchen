import { notFound } from "next/navigation";

import { BridgeCard } from "@/components/dashboard/settings/bridge-card";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { getStripeDiagnostics } from "@/lib/billing/stripe-config";
import { canUseSettings } from "@/lib/settings/settings-permissions";

export default async function BillingSettingsBridgePage() {
  const { sessionUser: session, userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = { userId, email: profile?.email ?? session.email ?? null, role: (profile?.role ?? null) as string | null };
  if (!canUseSettings(actor, "manage_billing")) notFound();

  const [sub, invoices, lastEvent] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.invoiceRecord.count({ where: { userId } }).catch(() => 0),
    prisma.billingEvent.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { eventType: true, createdAt: true },
    }).catch(() => null),
  ]);
  const stripe = (() => { try { return getStripeDiagnostics(); } catch { return null; } })();

  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="billing" />
      <BridgeCard
        title="Billing & Subscription Center"
        description="Plan, usage, invoices, payment methods, and Stripe diagnostics live in the Billing Center."
        href="/dashboard/billing"
        ctaLabel="Open Billing Center"
        status={sub?.status ? { label: sub.status, tone: sub.status === "ACTIVE" || sub.status === "TRIALING" ? "ok" : "warn" } : { label: "No subscription", tone: "warn" }}
        stats={[
          { label: "Plan", value: sub?.plan ?? "—", tone: sub?.plan ? "ok" : "warn" },
          { label: "Status", value: sub?.status ?? "—", tone: sub?.status === "ACTIVE" ? "ok" : sub?.status === "TRIALING" ? "warn" : "down" },
          { label: "Invoices on file", value: invoices.toString(), tone: "neutral" },
          { label: "Stripe", value: stripe?.configured ? "Ready" : "Not configured", tone: stripe?.configured ? "ok" : "warn" },
          { label: "Last billing event", value: lastEvent ? `${lastEvent.eventType} · ${lastEvent.createdAt.toISOString().slice(0, 10)}` : "—", tone: "neutral" },
        ]}
        secondaryActions={[
          { label: "Usage & limits", href: "/dashboard/billing/usage" },
          { label: "Invoices", href: "/dashboard/billing/invoices" },
          { label: "Plans", href: "/dashboard/billing/plans" },
        ]}
      />
    </div>
  );
}
