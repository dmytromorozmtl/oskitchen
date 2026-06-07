import { notFound } from "next/navigation";

import { MultiCurrencySettingsPanel } from "@/components/dashboard/settings/multi-currency-settings-panel";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { canUseSettings } from "@/lib/settings/settings-permissions";
import { loadMultiCurrencySettingsModel } from "@/services/finance/multi-currency-service";

export default async function CurrencySettingsPage() {
  const { sessionUser: session, userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = {
    userId,
    email: profile?.email ?? session.email ?? null,
    role: (profile?.role ?? null) as string | null,
  };
  if (!canUseSettings(actor, "manage_workspace")) {
    notFound();
  }

  const model = await loadMultiCurrencySettingsModel(userId);

  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="currency" />
      <MultiCurrencySettingsPanel model={model} />
    </div>
  );
}
