import { notFound } from "next/navigation";

import { BridgeCard } from "@/components/dashboard/settings/bridge-card";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { canUseSettings } from "@/lib/settings/settings-permissions";

export default async function ImportsSettingsPage() {
  const { sessionUser: session, userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = { userId, email: profile?.email ?? session.email ?? null, role: (profile?.role ?? null) as string | null };
  if (!canUseSettings(actor, "manage_imports")) notFound();

  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="imports" />
      <BridgeCard
        title="Import Center"
        description="CSV imports for products, customers, menus, ingredients. Mapping templates, validation logs, and failure recovery."
        href="/dashboard/import-center"
        ctaLabel="Open Import Center"
        secondaryActions={[
          { label: "Product mapping", href: "/dashboard/product-mapping" },
          { label: "Import/export", href: "/dashboard/import-export" },
        ]}
      />
    </div>
  );
}
