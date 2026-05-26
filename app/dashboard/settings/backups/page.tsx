import { notFound } from "next/navigation";

import { BackupsForm } from "@/components/dashboard/settings/forms/backups-form";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { canUseSettings } from "@/lib/settings/settings-permissions";
import { loadSettingsCenter } from "@/services/settings/settings-center-service";

export default async function BackupsSettingsPage() {
  const { sessionUser: session, userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = { userId, email: profile?.email ?? session.email ?? null, role: (profile?.role ?? null) as string | null };
  if (!canUseSettings(actor, "manage_imports")) notFound();
  const { payload } = await loadSettingsCenter(userId);

  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="backups" />
      <BackupsForm initial={payload.backups} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Operator note</CardTitle>
          <CardDescription>How backups are produced today.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            KitchenOS does not yet manage automated database snapshots from inside the app. The
            preferences above are honored by import + export flows in the Import Center, and by the
            CSV/JSON exports available in the Data Exports card on the Workspace page.
          </p>
          <p>
            For full database snapshots, point your Supabase backups to an off-site bucket and treat
            this section as the in-app preference store for restore workflows.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
