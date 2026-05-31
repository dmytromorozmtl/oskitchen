import Link from "next/link";

import { PlatformChrome } from "@/components/platform/platform-chrome";
import { PlatformImpersonationBar } from "@/components/platform/platform-impersonation-bar";
import { PlatformSearchShortcut } from "@/components/platform/platform-search-shortcut";
import { SupportSessionPlatformBanner } from "@/components/platform/support-session-platform-banner";
import { filterNavForPermissions, PLATFORM_NAV_GROUPS } from "@/lib/platform/platform-navigation";
import { requirePlatformAccess } from "@/lib/platform/platform-guards";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requirePlatformAccess();
  const navGroups = filterNavForPermissions(PLATFORM_NAV_GROUPS, ctx.permissions, {
    isFounder: ctx.isFounder,
  });
  const envLabel = (process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development").toUpperCase();
  const roleLabel = ctx.isFounder
    ? "Founder"
    : ctx.roles.length
      ? ctx.roles.join(" · ")
      : "Platform";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <PlatformSearchShortcut />
      <header className="fixed top-0 z-50 flex h-14 w-full items-center gap-3 border-b border-zinc-800 bg-zinc-950/90 px-4 backdrop-blur">
        <Link href="/platform/dashboard" className="text-sm font-semibold tracking-tight text-white">
          OS Kitchen <span className="text-zinc-500">Platform</span>
        </Link>
        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-200">Internal</span>
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-[10px] uppercase text-zinc-400">
          {envLabel}
        </span>
        <span className="hidden rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-400 sm:inline">
          {roleLabel}
        </span>
        <span className="ml-auto hidden text-xs text-zinc-500 md:inline">Search · ⌘K</span>
      </header>
      <PlatformChrome navGroups={navGroups} />
      <div className="pt-14 lg:pl-60">
        <SupportSessionPlatformBanner />
        <PlatformImpersonationBar />
        <div className="px-4 py-6 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
