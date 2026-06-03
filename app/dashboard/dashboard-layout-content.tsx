import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { dashboardLayoutErrorDetail } from "@/lib/dashboard/layout-error-detail";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { DemoBanner } from "@/components/demo/demo-banner";
import { NpsSurveyPrompt } from "@/components/dashboard/nps-survey-prompt";
import { SupportWidget } from "@/components/dashboard/support-widget";
import { PageMaturityRouteNotice } from "@/components/dashboard/page-maturity-route-notice";
import { PilotReleaseRouteNotice } from "@/components/dashboard/pilot-release-route-notice";
import { PlatformImpersonationNotice } from "@/components/dashboard/platform-impersonation-notice";
import { SupportSessionCustomerNotice } from "@/components/dashboard/support-session-customer-notice";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ModuleRouteGate } from "@/components/dashboard/module-route-gate";
import { PageShell } from "@/components/layout/page-shell";
import { WorkspacePermissionsProvider } from "@/components/permissions/workspace-permissions-provider";
import { ensureAppUser, requireSessionUser } from "@/lib/auth";
import { isDemoSessionExpired, isGuestDemoEmail } from "@/lib/demo/demo-session";
import { resolveUiWorkspacePermissions } from "@/lib/permissions/resolve-ui-permissions";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getBillingAccess, type BillingAccess } from "@/lib/billing/access";
import { BUSINESS_TYPE_LABELS, resolveBusinessType } from "@/lib/business-modes";
import { canAccessGrowthModule } from "@/lib/growth/growth-permissions";
import { effectiveDisabledModuleKeysFromRows } from "@/lib/product/module-readiness";
import { buildWorkspaceSetupHint } from "@/lib/setup-hint";
import type { Locale } from "@/lib/i18n";
import { getBlockedPathPrefixes, type ModuleKey } from "@/lib/module-visibility";
import { prisma } from "@/lib/prisma";
import { isSuperAdminUser } from "@/lib/platform-super-bypass";
import { navReleaseProfileFromEnv } from "@/services/modules/module-release-service";
import { getEnrolledPilotReadinessIdsForWorkspace } from "@/services/platform/workspace-pilot-enrollment-service";
import { UserRole } from "@prisma/client";

const DEFAULT_BILLING_ACCESS: BillingAccess = {
  hasAppAccess: true,
  hasPaidSubscription: false,
  inLocalTrial: true,
  trialDaysRemaining: null,
  trialEndsAt: null,
  trialExpiredNoPayment: false,
  plan: "STARTER",
  devBypass: false,
  platformBypass: false,
};

export async function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await requireSessionUser();
  const pathname = (await headers()).get("x-kos-pathname") ?? "";
  const onQuickStart = pathname === "/dashboard/quick-start";

  let isPlatformSuperEarly = false;
  try {
    isPlatformSuperEarly = await isSuperAdminUser(
      sessionUser.id,
      sessionUser.email ?? null,
    );
  } catch (error) {
    console.error("[dashboard-layout] isSuperAdminUser failed", error);
  }

  const profileGate = await prisma.userProfile
    .findUnique({
      where: { id: sessionUser.id },
      select: { onboardingCompleted: true },
    })
    .catch((error) => {
      console.error("[dashboard-layout] onboarding gate profile failed", error);
      return null;
    });

  const needsOnboarding =
    profileGate == null || profileGate.onboardingCompleted === false;
  if (needsOnboarding && !isPlatformSuperEarly && !onQuickStart) {
    redirect("/onboarding");
  }

  const { userId, workspaceId } = await getTenantActor();
  if (sessionUser.email) {
    try {
      await ensureAppUser(sessionUser.id, sessionUser.email);
    } catch (error) {
      console.error("[dashboard-layout] ensureAppUser failed", error);
    }
  }

  let profile: {
    email: string;
    companyName: string | null;
    role: UserRole;
    onboardingCompleted: boolean;
  } | null = null;
  let kitchenSettings: Awaited<
    ReturnType<typeof prisma.kitchenSettings.findUnique>
  > = null;
  let workspaceForNps: { createdAt: Date } | null = null;

  try {
    [profile, kitchenSettings, workspaceForNps] = await Promise.all([
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
  } catch (error) {
    console.error("[dashboard-layout] core profile load failed", error);
  }

  let billingAccess = DEFAULT_BILLING_ACCESS;
  try {
    billingAccess = await getBillingAccess(sessionUser.id, { workspaceId });
  } catch (error) {
    console.error("[dashboard-layout] getBillingAccess failed", error);
  }
  const isPlatformSuper = billingAccess.platformBypass === true || isPlatformSuperEarly;

  if (
    kitchenSettings?.demoMode &&
    kitchenSettings.demoExpiresAt &&
    isDemoSessionExpired(kitchenSettings.demoExpiresAt) &&
    isGuestDemoEmail(profile?.email ?? sessionUser.email)
  ) {
    redirect("/demo/expired");
  }

  const businessName =
    kitchenSettings?.businessName ??
    profile?.companyName ??
    undefined;
  const locale: Locale =
    kitchenSettings?.locale === "fr" ? "fr" : "en";

  let prefRows: { moduleKey: string; enabled: boolean }[] = [];
  if (!isPlatformSuper) {
    try {
      prefRows = await prisma.kitchenModulePreference.findMany({
        where: { userId },
        select: { moduleKey: true, enabled: true },
      });
    } catch (error) {
      console.error("[dashboard-layout] kitchenModulePreference failed", error);
    }
  }

  let enrolledPilotIds = new Set<string>();
  try {
    enrolledPilotIds = await getEnrolledPilotReadinessIdsForWorkspace(workspaceId);
  } catch (error) {
    console.error("[dashboard-layout] pilot enrollment load failed", error);
  }

  const disabledModuleKeysSet = isPlatformSuper
    ? new Set<ModuleKey>()
    : effectiveDisabledModuleKeysFromRows(prefRows, enrolledPilotIds);
  const disabledModuleKeys: ModuleKey[] = [...disabledModuleKeysSet];
  const blockedPathPrefixes = isPlatformSuper
    ? []
    : getBlockedPathPrefixes(disabledModuleKeysSet);

  const setupHint = kitchenSettings ? buildWorkspaceSetupHint(kitchenSettings) : null;

  let gtmSurfaceAccess = false;
  try {
    gtmSurfaceAccess =
      profile != null &&
      (await canAccessGrowthModule(
        sessionUser.id,
        sessionUser.email ?? null,
        profile.role,
      ));
  } catch (error) {
    console.error("[dashboard-layout] canAccessGrowthModule failed", error);
  }

  const businessModeLabel =
    kitchenSettings?.businessType != null
      ? BUSINESS_TYPE_LABELS[resolveBusinessType(kitchenSettings.businessType)]
      : null;

  let workspace: {
    brands: { id: string; name: string; slug: string }[];
  } | null = null;
  try {
    workspace = await prisma.workspace.findFirst({
      where: { ownerUserId: userId },
      select: {
        brands: {
          select: { id: true, name: true, slug: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
    });
  } catch (error) {
    console.error("[dashboard-layout] workspace brands load failed", error);
  }

  const navReleaseProfile = navReleaseProfileFromEnv();
  let workspaceGrantedKeys: PermissionKey[] = [];
  try {
    workspaceGrantedKeys = await resolveUiWorkspacePermissions();
  } catch (error) {
    console.error("[dashboard-layout] resolveUiWorkspacePermissions failed", error);
  }

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
          <DemoBanner
            expiresAtIso={kitchenSettings.demoExpiresAt?.toISOString() ?? null}
            isGuestDemo={isGuestDemoEmail(profile?.email ?? sessionUser.email)}
          />
        ) : null}
        <PlatformImpersonationNotice />
        <SupportSessionCustomerNotice userId={sessionUser.id} />
        <PageShell>
          <PilotReleaseRouteNotice navReleaseProfile={navReleaseProfile} />
          <PageMaturityRouteNotice />
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
        <OfflineIndicator />
        <NpsSurveyPrompt workspaceCreatedAt={workspaceForNps?.createdAt?.toISOString() ?? null} />
      </DashboardShell>
    </WorkspacePermissionsProvider>
  );
}

export { dashboardLayoutErrorDetail } from "@/lib/dashboard/layout-error-detail";
