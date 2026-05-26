"use client";

import * as Icons from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  SETTINGS_SECTION_GROUPS,
  type SettingsCapability,
  type SettingsSection,
  type SettingsSectionGroupKey,
} from "@/lib/settings/section-registry";
import {
  filterVisibleSettingsSections,
  resolveVisibleSettingsShortcuts,
} from "@/lib/settings/settings-navigation";

type LucideIcon = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

const ICON_FALLBACK: LucideIcon = (props) => <Icons.Circle {...props} />;
function resolveIcon(name: string): LucideIcon {
  const raw = (Icons as unknown as Record<string, LucideIcon | undefined>)[name];
  return raw ?? ICON_FALLBACK;
}

const PINS_STORAGE_KEY = "kos.settings.pins";
const RECENTS_STORAGE_KEY = "kos.settings.recents";
const RECENTS_LIMIT = 5;

function readStorage(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

function writeStorage(key: string, values: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // ignore quota
  }
}

export type SettingsSidebarProps = {
  capabilities: SettingsCapability[];
  /** When set, sidebar gets a scrollable desktop shell in layout usage. */
  collapsedDefault?: boolean;
};

export function SettingsSidebar({ capabilities, collapsedDefault }: SettingsSidebarProps) {
  const pathname = usePathname() ?? "";
  const [query, setQuery] = useState("");
  const [pins, setPins] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    setPins(readStorage(PINS_STORAGE_KEY));
    setRecents(readStorage(RECENTS_STORAGE_KEY));
  }, []);

  const visible = useMemo(() => {
    return filterVisibleSettingsSections(capabilities, query);
  }, [capabilities, query]);

  const grouped = useMemo(() => {
    const out: Record<SettingsSectionGroupKey, SettingsSection[]> = {
      workspace: [],
      operations: [],
      customers: [],
      platform: [],
      ops_admin: [],
      advanced: [],
    };
    for (const s of visible) out[s.group].push(s);
    return out;
  }, [visible]);

  const pinnedSections = useMemo(
    () => resolveVisibleSettingsShortcuts(pins, visible),
    [pins, visible],
  );
  const recentSections = useMemo(
    () => resolveVisibleSettingsShortcuts(recents, visible),
    [recents, visible],
  );

  function togglePin(key: SettingsSection["key"]): void {
    const next = pins.includes(key) ? pins.filter((p) => p !== key) : [key, ...pins].slice(0, 8);
    setPins(next);
    writeStorage(PINS_STORAGE_KEY, next);
  }

  function isActive(href: string): boolean {
    if (href === "/dashboard/settings") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/80 p-3 shadow-sm",
        collapsedDefault ? "lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto" : "",
      )}
      aria-label="Settings navigation"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <Icons.Settings className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-semibold tracking-tight">Settings</h2>
        </div>
        <Input
          aria-label="Search settings"
          placeholder="Search settings…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-8 text-xs"
        />
      </div>

      {pinnedSections.length > 0 && (
        <Group title="Pinned" sections={pinnedSections} isActive={isActive} onPin={togglePin} pins={pins} resolveIcon={resolveIcon} />
      )}
      {recentSections.length > 0 && (
        <Group title="Recent" sections={recentSections} isActive={isActive} onPin={togglePin} pins={pins} resolveIcon={resolveIcon} />
      )}

      <div className="space-y-3">
        {SETTINGS_SECTION_GROUPS.map((g) => {
          const list = grouped[g.key];
          if (!list || list.length === 0) return null;
          return (
            <Group
              key={g.key}
              title={g.label}
              sections={list}
              isActive={isActive}
              onPin={togglePin}
              pins={pins}
              resolveIcon={resolveIcon}
            />
          );
        })}
      </div>
    </aside>
  );
}

type GroupProps = {
  title: string;
  sections: SettingsSection[];
  isActive: (href: string) => boolean;
  onPin: (key: SettingsSection["key"]) => void;
  pins: string[];
  resolveIcon: (name: string) => LucideIcon;
};

function Group({ title, sections, isActive, onPin, pins, resolveIcon }: GroupProps) {
  return (
    <div className="space-y-1">
      <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <ul className="space-y-0.5">
        {sections.map((s) => {
          const Icon = resolveIcon(s.icon);
          const active = isActive(s.href);
          const pinned = pins.includes(s.key);
          return (
            <li key={s.key} className="flex items-center gap-1">
              <Link
                href={s.href}
                onClick={() => bumpRecent(s.key)}
                className={cn(
                  "group flex flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("h-3.5 w-3.5", active ? "text-primary" : "text-muted-foreground")} aria-hidden />
                <span className="flex-1 truncate">{s.label}</span>
                {s.badge && (
                  <Badge variant="secondary" className="px-1 py-0 text-[9px]">
                    {s.badge}
                  </Badge>
                )}
                {s.bridge && (
                  <Icons.ArrowUpRight className="h-3 w-3 opacity-60" aria-hidden />
                )}
              </Link>
              <button
                type="button"
                onClick={() => onPin(s.key)}
                aria-label={pinned ? `Unpin ${s.label}` : `Pin ${s.label}`}
                title={pinned ? "Unpin" : "Pin to top"}
                className={cn(
                  "rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  pinned ? "text-primary" : "",
                )}
              >
                <Icons.Pin className="h-3 w-3" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function bumpRecent(key: SettingsSection["key"]): void {
  const current = readStorage(RECENTS_STORAGE_KEY).filter((v) => v !== key);
  const next = [key, ...current].slice(0, RECENTS_LIMIT);
  writeStorage(RECENTS_STORAGE_KEY, next);
}
