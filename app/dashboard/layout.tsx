import { redirect } from "next/navigation";

import { DemoBanner } from "@/components/demo/demo-banner";
import { NpsSurveyPrompt } from "@/components/dashboard/nps-survey-prompt";
import { SupportWidget } from "@/components/dashboard/support-widget";
import { PilotReleaseRouteNotice } from "@/components/dashboard/pilot-release-route-notice";
import { PlatformImpersonationNotice } from "@/components/dashboard/platform-impersonation-notice";
import { SupportSessionCustomerNotice } from "@/components/dashboard/support-session-customer-notice";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ModuleRouteGate } from "@/components/dashboard/module-route-gate";
import { PageShell } from "@/components/layout/page-shell";
import { WorkspacePermissionsProvider } from "@/components/permissions/workspace-permissions-provider";
import { ensureAppUser } from "@/lib/auth";
import { resolveUiWorkspacePermissions } from "@/lib/permissions/resolve-ui-permissions";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getBillingAccess } from "@/lib/billing/access";
import { BUSINESS_TYPE_LABELS, resolveBusinessType } from "@/lib/business-modes";
import { canAccessGrowthModule } from "@/lib/growth/growth-permissions";
import { effectiveDisabledModuleKeysFromRows } from "@/lib/product/module-readiness";
import { buildWorkspaceSetupHint } from "@/lib/setup-hint";
import type { Locale } from "@/lib/i18n";
import { getBlockedPathPrefixes, type ModuleKey } from "@/lib/module-visibility";
import { prisma } from "@/lib/prisma";
import { navReleaseProfileFromEnv } from "@/services/modules/module-release-service";
import { getEnrolledPilotReadinessIdsForWorkspace } from "@/services/platform/workspace-pilot-enrollment-service";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionUser, userId, workspaceId } = await getTenantActor();
  if (sessionUser.email) {
    await ensureAppUser(sessionUser.id, sessionUser.email);
  }

  const [profile, kitchenSettings, workspaceForNps] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { id: sessionUser.id },
      select: {
        email: true,
        companyName: true,
        role: true,
        onboardingCompleted: true,
      },
    }),
    prisma.kitchenSettings.findUnique({ where: { userId } }),
    workspaceId
      ? prisma.workspace.findUnique({
          where: { id: workspaceId },
          select: { createdAt: true },
        })
      : Promise.resolve(null),
  ]);

  const billingAccess = await getBillingAccess(sessionUser.id, { workspaceId });
  const isPlatformSuper = billingAccess.platformBypass === true;

  if (profile && !profile.onboardingCompleted && !isPlatformSuper) {
    redirect("/onboarding");
  }

  const businessName =
    kitchenSettings?.businessName ??
    profile?.companyName ??
    undefined;
  const locale: Locale =
    kitchenSettings?.locale === "fr" ? "fr" : "en";

  const prefRows = isPlatformSuper
    ? []
    : await prisma.kitchenModulePreference.findMany({
        where: { userId },
        select: { moduleKey: true, enabled: true },
      });
  const disabledModuleKeysSet = isPlatformSuper
    ? new Set<ModuleKey>()
    : effectiveDisabledModuleKeysFromRows(
        prefRows,
        await getEnrolledPilotReadinessIdsForWorkspace(workspaceId),
      );
  const disabledModuleKeys: ModuleKey[] = [...disabledModuleKeysSet];
  const blockedPathPrefixes = isPlatformSuper
    ? []
    : getBlockedPathPrefixes(disabledModuleKeysSet);

  const setupHint = kitchenSettings ? buildWorkspaceSetupHint(kitchenSettings) : null;

  const gtmSurfaceAccess =
    profile != null &&
    (await canAccessGrowthModule(
      sessionUser.id,
      sessionUser.email ?? null,
      profile.role,
    ));

  const businessModeLabel =
    kitchenSettings?.businessType != null
      ? BUSINESS_TYPE_LABELS[resolveBusinessType(kitchenSettings.businessType)]
      : null;

  const workspace = await prisma.workspace.findFirst({
    where: { ownerUserId: userId },
    select: {
      brands: {
        select: { id: true, name: true, slug: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
  });

  const navReleaseProfile = navReleaseProfileFromEnv();
  const workspaceGrantedKeys = await resolveUiWorkspacePermissions();

  return (
    <WorkspacePermissionsProvider grantedKeys={workspaceGrantedKeys}>
    <DashboardShell
      userEmail={profile?.email ?? sessionUser.email}
      workspaceUserId={userId}
      businessName={businessName}
      businessType={kitchenSettings?.businessType ?? null}
      businessModeLabel={businessModeLabel}
      locale={locale}
      isOwner={profile?.role === UserRole.OWNER || isPlatformSuper}
      gtmSurfaceAccess={gtmSurfaceAccess}
      userRole={profile?.role ?? UserRole.OWNER}
      supportEmail={process.env.NEXT_PUBLIC_SUPPORT_EMAIL}
      disabledModuleKeys={disabledModuleKeys}
      setupHint={setupHint}
      workspaceBrands={workspace?.brands ?? []}
      navReleaseProfile={navReleaseProfile}
      billingAccess={{
        trialExpiredNoPayment: billingAccess.trialExpiredNoPayment,
        devBypass: billingAccess.devBypass,
        trialDaysRemaining: billingAccess.trialDaysRemaining,
        platformBypass: billingAccess.platformBypass,
      }}
    >
      {kitchenSettings?.demoMode ? (
        <DemoBanner userId={userId} />
      ) : null}
      <PlatformImpersonationNotice />
      <SupportSessionCustomerNotice userId={sessionUser.id} />
      <PageShell>
        <PilotReleaseRouteNotice navReleaseProfile={navReleaseProfile} />
        <ModuleRouteGate
          blockedPathPrefixes={blockedPathPrefixes}
          userRole={profile?.role ?? UserRole.OWNER}
          isPlatformSuper={isPlatformSuper}
          gtmSurfaceAccess={gtmSurfaceAccess}
        >
          {children}
        </ModuleRouteGate>
      </PageShell>
      <SupportWidget />
      <NpsSurveyPrompt workspaceCreatedAt={workspaceForNps?.createdAt?.toISOString() ?? null} />
    </DashboardShell>
    </WorkspacePermissionsProvider>
  );
}
