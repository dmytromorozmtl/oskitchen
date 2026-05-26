import { notFound } from "next/navigation";

import { PackingForm } from "@/components/dashboard/settings/forms/packing-form";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { canUseSettings } from "@/lib/settings/settings-permissions";
import { loadSettingsCenter } from "@/services/settings/settings-center-service";

export default async function PackingSettingsPage() {
  const { sessionUser: session, userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = { userId, email: profile?.email ?? session.email ?? null, role: (profile?.role ?? null) as string | null };
  if (!canUseSettings(actor, "manage_packing")) notFound();
  const { payload } = await loadSettingsCenter(userId);
  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="packing" />
      <PackingForm initial={payload.packing} />
    </div>
  );
}
