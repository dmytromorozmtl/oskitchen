import { redirect } from "next/navigation";

import { PwaBrandingStudio } from "@/components/branding/pwa-branding-studio";
import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { PlanGate } from "@/components/plans/plan-gate";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { generateBrandedPWA } from "@/services/branding/white-label-service";

export default async function BrandingSettingsPage() {
  const actor = await requireWorkspacePermissionActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: actor.sessionUserId },
    select: { role: true, email: true },
  });
  if (!actor.platformBypass && profile?.role !== UserRole.OWNER) {
    redirect("/dashboard/settings");
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: actor.userId },
    select: { plan: true },
  });
  const allowHide = sub?.plan === "ENTERPRISE" || actor.platformBypass;

  const ks = await prisma.kitchenSettings.findUnique({
    where: { userId: actor.userId },
    select: { hideKitchenOsBranding: true },
  });

  const workspaceId = await ensureOwnerWorkspaceId(actor.userId);
  const pwaConfig = await generateBrandedPWA(workspaceId);

  return (
    <PlanGate userId={actor.userId} feature="white_label" title="Branding & mobile app">
      <div className="space-y-6">
        <SectionHeader sectionKey="branding" />
        <PwaBrandingStudio
          initialConfig={pwaConfig}
          allowHideBranding={allowHide}
          hideKitchenOsBranding={ks?.hideKitchenOsBranding ?? false}
        />
      </div>
    </PlanGate>
  );
}
