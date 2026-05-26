import { notFound } from "next/navigation";

import { BusinessHoursForm } from "@/components/dashboard/settings/forms/business-hours-form";
import { BusinessModeForm } from "@/components/dashboard/settings/forms/business-mode-form";
import { OperatingModeForm } from "@/components/dashboard/settings/forms/operating-mode-form";
import { WorkspaceIdentityForm } from "@/components/dashboard/settings/forms/workspace-identity-form";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { canUseSettings } from "@/lib/settings/settings-permissions";
import { loadSettingsCenter } from "@/services/settings/settings-center-service";

export default async function WorkspaceSettingsPage() {
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
  const [{ kitchenSettings, payload }] = await Promise.all([loadSettingsCenter(userId)]);

  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="workspace" />

      <BusinessModeForm current={kitchenSettings?.businessType ?? null} />

      <OperatingModeForm current={kitchenSettings?.operatingMode ?? "WEEKLY_PREORDER"} />

      <WorkspaceIdentityForm
        initial={{
          legalName: payload.workspaceIdentity.legalName,
          doingBusinessAs: payload.workspaceIdentity.doingBusinessAs,
          businessNumber: payload.workspaceIdentity.businessNumber,
          taxIds: payload.workspaceIdentity.taxIds,
          supportEmail: payload.workspaceIdentity.supportEmail,
          supportPhone: payload.workspaceIdentity.supportPhone,
          website: payload.workspaceIdentity.website,
          socialLinks: payload.workspaceIdentity.socialLinks,
          invoiceFooter: payload.workspaceIdentity.invoiceFooter,
          operatingLanguage: payload.workspaceIdentity.operatingLanguage,
          defaultTaxRulesNote: payload.workspaceIdentity.defaultTaxRulesNote,
          businessName: kitchenSettings?.businessName ?? null,
          currency: kitchenSettings?.currency ?? "USD",
          timezone: kitchenSettings?.timezone ?? "UTC",
          country: kitchenSettings?.country ?? null,
          locale: kitchenSettings?.locale ?? "en",
        }}
      />

      <BusinessHoursForm initial={payload.businessHours} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Legacy workflow preferences</CardTitle>
          <CardDescription>
            The simple toggles that powered the original Settings page. They still control existing
            flows — Operations / Orders / Notifications sections override these for new operators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm
            initial={{
              businessType: kitchenSettings?.businessType ?? null,
              businessName: kitchenSettings?.businessName ?? null,
              logoUrl: kitchenSettings?.logoUrl ?? null,
              pickupAddress: kitchenSettings?.pickupAddress ?? null,
              deliveryEnabled: kitchenSettings?.deliveryEnabled ?? false,
              deliveryNotes: kitchenSettings?.deliveryNotes ?? null,
              kitchenWorkflowDefault: kitchenSettings?.kitchenWorkflowDefault ?? null,
              notifyOrderConfirmation: kitchenSettings?.notifyOrderConfirmation ?? true,
              notifyPreorderReminder: kitchenSettings?.notifyPreorderReminder ?? true,
              notifyPickupReminder: kitchenSettings?.notifyPickupReminder ?? true,
              notifyDeliveryReminder: kitchenSettings?.notifyDeliveryReminder ?? true,
              locale: kitchenSettings?.locale ?? "en",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
