import { SectionHeader } from "@/components/dashboard/settings/section-header";
import { ModuleSettingsForm } from "@/components/dashboard/module-settings-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getBillingAccess } from "@/lib/billing/access";
import { MODULE_KEYS, type ModuleKey } from "@/lib/module-visibility";
import { prisma } from "@/lib/prisma";
import { effectiveDisabledModuleKeysFromRows } from "@/lib/product/module-readiness";
import { getEnrolledPilotReadinessIdsForWorkspace } from "@/services/platform/workspace-pilot-enrollment-service";

export default async function ModuleSettingsPage() {
  const { sessionUser, userId, workspaceId } = await getTenantActor();
  const [rows, settings, billingAccess, enrolledPilotModuleIds] = await Promise.all([
    prisma.kitchenModulePreference.findMany({
      where: { userId },
      select: { moduleKey: true, enabled: true },
    }),
    prisma.kitchenSettings.findUnique({
      where: { userId },
      select: { businessType: true },
    }),
    getBillingAccess(sessionUser.id),
    getEnrolledPilotReadinessIdsForWorkspace(workspaceId),
  ]);
  const disabled = effectiveDisabledModuleKeysFromRows(rows, enrolledPilotModuleIds);

  const initialEnabled = {} as Record<ModuleKey, boolean>;
  for (const key of MODULE_KEYS) {
    initialEnabled[key] = !disabled.has(key);
  }

  return (
    <div className="space-y-6">
      <SectionHeader sectionKey="modules" />

      <Card className="border-border/80 bg-muted/20 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">How this works</CardTitle>
          <CardDescription>
            Your business type still suggests a focused sidebar; this page controls hard off states.
            Pilot-only modules stay off until this workspace is enrolled and then explicitly enabled.
            Platform administrators bypass module blocks.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Pins in the sidebar stay local to this browser. Database-backed pinning can follow in a
          later release.
        </CardContent>
      </Card>

      <ModuleSettingsForm
        initialEnabled={initialEnabled}
        businessType={settings?.businessType ?? null}
        fullNavAccess={billingAccess.platformBypass}
        enrolledPilotModuleIds={[...enrolledPilotModuleIds]}
      />
    </div>
  );
}
