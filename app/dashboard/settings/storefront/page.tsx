import { notFound } from "next/navigation";

import { BridgeCard } from "@/components/dashboard/settings/bridge-card";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { canUseSettings } from "@/lib/settings/settings-permissions";

export default async function StorefrontSettingsPage() {
  const { sessionUser: session, userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = { userId, email: profile?.email ?? session.email ?? null, role: (profile?.role ?? null) as string | null };
  if (!canUseSettings(actor, "manage_storefront")) notFound();

  const [storefrontCount, domainCount, ks] = await Promise.all([
    prisma.storefrontSettings.count({ where: { userId } }).catch(() => 0),
    prisma.storefrontDomain.count({ where: { userId } }).catch(() => 0),
    prisma.kitchenSettings.findUnique({
      where: { userId },
      select: { storefrontThemeKey: true, hideKitchenOsBranding: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="storefront" />

      <BridgeCard
        title="Storefront workspace"
        description="Pages, navigation, banners, SEO, multilingual, and multi-brand storefronts live in the Storefront Center."
        href="/dashboard/storefronts"
        ctaLabel="Open Storefront Center"
        status={{ label: storefrontCount > 0 ? "Active" : "Not configured", tone: storefrontCount > 0 ? "ok" : "warn" }}
        stats={[
          { label: "Storefronts", value: storefrontCount.toString(), tone: storefrontCount > 0 ? "ok" : "warn" },
          { label: "Connected domains", value: domainCount.toString(), tone: domainCount > 0 ? "ok" : "warn" },
          { label: "Active theme", value: ks?.storefrontThemeKey ?? "default", tone: ks?.storefrontThemeKey ? "ok" : "warn" },
        ]}
        checks={[
          { label: "Theme selected", ok: Boolean(ks?.storefrontThemeKey), hint: "Pick a theme to publish customer-facing storefronts." },
          { label: "Custom domain mapped", ok: domainCount > 0, hint: "Map at least one custom domain for a branded experience." },
          { label: "Hide KitchenOS branding", ok: Boolean(ks?.hideKitchenOsBranding), hint: "Enterprise plans only." },
        ]}
        secondaryActions={[
          { label: "Domains", href: "/dashboard/settings/domains" },
          { label: "Branding", href: "/dashboard/settings/branding" },
        ]}
      />
    </div>
  );
}
