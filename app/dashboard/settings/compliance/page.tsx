import { notFound } from "next/navigation";

import { ComplianceForm } from "@/components/dashboard/settings/forms/compliance-form";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { canUseSettings } from "@/lib/settings/settings-permissions";
import { loadSettingsCenter } from "@/services/settings/settings-center-service";

export default async function ComplianceSettingsPage() {
  const { sessionUser: session, userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: session.id },
    select: { role: true, email: true },
  });
  const actor = { userId, email: profile?.email ?? session.email ?? null, role: (profile?.role ?? null) as string | null };
  if (!canUseSettings(actor, "manage_compliance")) notFound();
  const { payload } = await loadSettingsCenter(userId);
  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="compliance" />
      <ComplianceForm initial={payload.compliance} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data subject requests</CardTitle>
          <CardDescription>
            Customer-side data export and delete requests are processed via the existing Data
            Exports surface on the Workspace page. Use the Security Center for audit history.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          For GDPR / PIPEDA requests today: open the relevant customer in CRM and use the data
          export / delete actions; KitchenOS records the action in the audit log.
        </CardContent>
      </Card>
    </div>
  );
}
