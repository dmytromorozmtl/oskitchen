"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { PlatformNavGroup } from "@/lib/platform/platform-navigation";

export type PlatformChromeProps = {
  navGroups: PlatformNavGroup[];
};

export function PlatformChrome({ navGroups }: PlatformChromeProps) {
  const currentPath = usePathname() ?? "";
  const hrefs = navGroups
    .flatMap((g) => g.items.map((i) => i.href))
    .sort((a, b) => b.length - a.length);

  const navMatch = (path: string, href: string) => {
    if (path === href) return true;
    if (!path.startsWith(`${href}/`)) return false;
    const rest = path.slice(href.length + 1).split("/")[0] ?? "";
    if (
      href === "/platform/support" &&
      rest &&
      !["queue", "escalations", "knowledge-base"].includes(rest)
    ) {
      return false;
    }
    return true;
  };

  const activeHref = hrefs.find((h) => navMatch(currentPath, h));
  const isActive = (href: string) => activeHref === href;
  return (
    <aside className="fixed inset-y-0 left-0 z-drawer hidden w-60 overflow-y-auto border-r border-zinc-800 bg-zinc-950/95 pt-14 lg:block">
      <div className="px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">OS Kitchen</p>
        <p className="text-sm font-medium text-zinc-200">Platform operations</p>
      </div>
      <nav className="flex flex-col gap-4 px-2 pb-8">
        {navGroups.map((group) => (
          <div key={group.id}>
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    isActive(l.href) ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
        <Link
          href="/dashboard"
          className="mt-2 rounded-lg px-3 py-2 text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← Customer dashboard
        </Link>
      </nav>
    </aside>
  );
}
