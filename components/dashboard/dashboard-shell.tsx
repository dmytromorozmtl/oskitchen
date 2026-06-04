"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { BusinessType, UserRole } from "@prisma/client";
import { MenuSquare, Shield, User, Bell, KeyRound, Users, Sparkles } from "lucide-react";

import { BillingAccessGuard } from "@/components/billing/billing-access-guard";
import { TrialBanner } from "@/components/billing/trial-banner";

import { CommandPalette } from "@/components/dashboard/command-palette";
import {
  DashboardBreadcrumbs,
  DashboardSidebarNav,
  type NavLinkItem,
} from "@/components/dashboard/dashboard-nav";
import { BrandSwitcher, type BrandSwitcherOption } from "@/components/brands/brand-switcher";
import { BrandContextProvider } from "@/components/brands/brand-context";
import { signOutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { OSKitchenLogo } from "@/components/ui/os-kitchen-logo";
import {
  dashboardShellHeaderClass,
  dashboardShellRootClass,
  dashboardShellSidebarClass,
} from "@/lib/design/dark-mode-consistency-policy";
import { APP_NAME } from "@/lib/constants";
import type { Locale, MessageKey } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { ModuleKey } from "@/lib/module-visibility";
import type { SetupHintPayload } from "@/lib/setup-hint";
import type { NavReleaseProfile } from "@/services/modules/module-release-service";

export function DashboardShell({
  children,
  userEmail,
  workspaceUserId = null,
  businessName,
  businessType = null,
  businessModeLabel = null,
  locale = "en",
  isOwner = false,
  userRole = "OWNER",
  supportEmail,
  billingAccess,
  disabledModuleKeys = [],
  setupHint = null,
  workspaceBrands = [],
  /** When true, user can open Growth + beta program routes (⌘K) without workspace ownership. */
  gtmSurfaceAccess = false,
  /** Pilot navigation profile — hides deep modules from sidebar (see `NEXT_PUBLIC_NAV_RELEASE_PROFILE`). */
  navReleaseProfile = "full",
}: {
  children: React.ReactNode;
  userEmail?: string | null;
  /** Authenticated workspace owner id — enables ⌘K entity search. */
  workspaceUserId?: string | null;
  businessName?: string | null;
  /** Kitchen operating mode — drives adaptive nav & terminology. */
  businessType?: BusinessType | null;
  /** Human-readable business mode label (e.g. “Bar / lounge”). */
  businessModeLabel?: string | null;
  locale?: Locale;
  /** Owner-only links (Developer, beta inbox). */
  isOwner?: boolean;
  /** Workspace role from profile — used for nav + ⌘K filtering. */
  userRole?: UserRole;
  /** Mailto target for feedback / bugs — set NEXT_PUBLIC_SUPPORT_EMAIL */
  supportEmail?: string | null;
  billingAccess?: {
    trialExpiredNoPayment: boolean;
    devBypass: boolean;
    trialDaysRemaining: number | null;
    platformBypass?: boolean;
  };
  /** User-disabled modules (empty for platform super-admin). */
  disabledModuleKeys?: readonly ModuleKey[];
  /** Optional compact setup progress (server-derived, no client fetch). */
  setupHint?: SetupHintPayload | null;
  /** When 2+ workspace brands exist, show header brand context (persisted client-side). */
  workspaceBrands?: readonly BrandSwitcherOption[];
  gtmSurfaceAccess?: boolean;
  navReleaseProfile?: NavReleaseProfile;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const brand = businessName?.trim() || APP_NAME;

  const ownerExtras = [
    ...(billingAccess?.platformBypass
      ? [{ href: "/platform/dashboard", labelKey: "nav.platform" as MessageKey, icon: Shield }]
      : []),
  ] as NavLinkItem[];

  const platformSuper = billingAccess?.platformBypass === true;
  const showBillingLink = isOwner || platformSuper;
  const navContextBase = {
    fullNavAccess: platformSuper,
    isPlatformSuper: platformSuper,
    isOwner,
    userRole,
    gtmSurfaceAccess: Boolean(gtmSurfaceAccess),
  };

  const commandExtras = [
    ...(isOwner || gtmSurfaceAccess
      ? [
          { href: "/dashboard/growth", label: "Growth", k: "growth" },
          { href: "/dashboard/growth/leads", label: "Beta leads", k: "leads" },
          { href: "/dashboard/growth/launch-analytics", label: "Launch analytics", k: "launch" },
          { href: "/dashboard/beta-applications", label: "Beta program", k: "beta-ops" },
        ]
      : []),
    ...(billingAccess?.platformBypass
      ? [{ href: "/platform/dashboard", label: "Platform admin", k: "platform" }]
      : []),
  ];

  return (
    <div className={dashboardShellRootClass}>
      <aside className={dashboardShellSidebarClass}>
        <div className="flex h-16 items-center gap-2 border-b border-border/70 px-6">
          <OSKitchenLogo href="/dashboard" size="sm" />
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">{brand}</p>
          </div>
        </div>
        <ScrollArea className="flex-1 py-4">
          <DashboardSidebarNav
            locale={locale}
            pathname={pathname}
            ownerExtras={ownerExtras}
            businessType={businessType}
            businessModeLabel={businessModeLabel}
            navContext={navContextBase}
            disabledModuleKeys={disabledModuleKeys}
            setupHint={setupHint}
            navReleaseProfile={navReleaseProfile}
          />
        </ScrollArea>
        <div className="border-t border-border/70 p-4">
          <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          <form action={signOutAction} className="mt-3">
            <Button variant="outline" size="sm" className="w-full rounded-full">
              Log out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className={dashboardShellHeaderClass}>
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full lg:hidden">
                  <MenuSquare className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-[280px] flex-col gap-0 p-0">
                <SheetHeader className="shrink-0 border-b border-border/70 px-6 py-4 text-left">
                  <SheetTitle className="font-display">
                    <OSKitchenLogo href={null} size="sm" />
                  </SheetTitle>
                  <p className="text-xs text-muted-foreground">{brand}</p>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto py-4">
                  <DashboardSidebarNav
                    locale={locale}
                    pathname={pathname}
                    ownerExtras={ownerExtras}
                    businessType={businessType}
                    businessModeLabel={businessModeLabel}
                    navContext={navContextBase}
                    disabledModuleKeys={disabledModuleKeys}
                    setupHint={setupHint}
                    navReleaseProfile={navReleaseProfile}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <div className="min-w-0 lg:pl-2">
              <p className="truncate text-sm font-semibold lg:text-base">{brand}</p>
              <div className="hidden sm:block">
                <DashboardBreadcrumbs
                  pathname={pathname}
                  locale={locale}
                  ownerExtras={ownerExtras}
                  businessType={businessType}
                  navContext={navContextBase}
                  disabledModuleKeys={disabledModuleKeys}
                />
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <BrandSwitcher brands={[...workspaceBrands]} />
            <CommandPalette
              locale={locale}
              businessType={businessType}
              disabledModuleKeys={disabledModuleKeys}
              fullNavAccess={platformSuper}
              userRole={userRole}
              isPlatformSuper={platformSuper}
              gtmSurfaceAccess={Boolean(gtmSurfaceAccess)}
              extraRoutes={commandExtras}
              searchWorkspaceUserId={workspaceUserId}
            />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  aria-label="Open account menu"
                >
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Account</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {userEmail ?? "Signed in"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings/notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help/getting-started">Help center</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/book-demo">Book onboarding call</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/changelog" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    What&apos;s new
                  </Link>
                </DropdownMenuItem>
                {supportEmail ? (
                  <>
                    <DropdownMenuItem asChild>
                      <a
                        href={`mailto:${supportEmail}?subject=${encodeURIComponent("OS Kitchen feedback")}`}
                      >
                        Send feedback
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href={`mailto:${supportEmail}?subject=${encodeURIComponent("OS Kitchen bug report")}`}
                      >
                        Report a bug
                      </a>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    Feedback (set NEXT_PUBLIC_SUPPORT_EMAIL)
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">{t(locale, "nav.settings")}</Link>
                </DropdownMenuItem>
                {isOwner ? (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/developer/api-keys" className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4" />
                      API Keys
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                {showBillingLink ? (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/billing">{t(locale, "nav.billing")}</Link>
                  </DropdownMenuItem>
                ) : null}
                {isOwner ? (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/staff" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Team
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <form action={signOutAction} className="w-full">
                  <button
                    type="submit"
                    className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  >
                    Log out
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <BillingAccessGuard
          trialExpiredNoPayment={Boolean(
            billingAccess?.trialExpiredNoPayment && !billingAccess?.platformBypass,
          )}
          isOwner={isOwner}
        >
          {billingAccess ? (
            <TrialBanner
              devBypass={billingAccess.devBypass}
              trialDaysRemaining={billingAccess.trialDaysRemaining}
              trialExpired={Boolean(
                billingAccess.trialExpiredNoPayment && !billingAccess.platformBypass,
              )}
              isOwner={isOwner}
            />
          ) : null}
          <BrandContextProvider>
            <main className="flex-1 px-4 py-8 pb-24 sm:px-8 lg:pb-8">{children}</main>
          </BrandContextProvider>
        </BillingAccessGuard>
      </div>
    </div>
  );
}
