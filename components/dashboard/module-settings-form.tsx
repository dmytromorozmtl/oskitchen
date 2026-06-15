"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { toast } from "sonner";

import {
  clearKitchenModulePreferences,
  resetKitchenModulePreferencesToRecommended,
  saveKitchenModulePreferences,
} from "@/actions/module-preferences";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { BusinessType } from "@prisma/client";

import { moduleRecommendationBlurb } from "@/lib/business-mode-registry";
import type { ModuleKey } from "@/lib/module-visibility";
import { MODULE_REGISTRY } from "@/lib/module-visibility";
import { moduleEntry } from "@/lib/modules/module-registry";
import {
  getModuleReadinessByModuleKey,
  moduleReadinessRequiresEnrollment,
  moduleReadinessBadgeLabel,
} from "@/lib/product/module-readiness";

const LOCKED_ON: ReadonlySet<ModuleKey> = new Set([
  "dashboard",
  "today",
  "settings",
  "billing",
  "support",
]);

const TIER_LABEL: Record<(typeof MODULE_REGISTRY)[number]["tier"], string> = {
  core: "Core",
  menu: "Menu & sales",
  kitchen: "Kitchen",
  inventory: "Inventory & cost",
  customers: "Customers",
  ops: "Setup & rollout",
  insights: "Insights",
  admin: "Admin",
  internal: "Internal",
};

export function ModuleSettingsForm({
  initialEnabled,
  businessType = null,
  fullNavAccess = false,
  enrolledPilotModuleIds = [],
}: {
  initialEnabled: Record<ModuleKey, boolean>;
  businessType?: BusinessType | null;
  /** Platform super-admin — show internal-only modules in this list. */
  fullNavAccess?: boolean;
  enrolledPilotModuleIds?: readonly string[];
}) {
  const [state, setState] = React.useState(initialEnabled);
  const [pending, setPending] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const enrolledPilotSet = React.useMemo(
    () => new Set(enrolledPilotModuleIds),
    [enrolledPilotModuleIds],
  );

  const grouped = React.useMemo(() => {
    const tiers = new Map<string, (typeof MODULE_REGISTRY)[number][]>();
    for (const def of MODULE_REGISTRY) {
      if (def.tier === "internal" && !fullNavAccess) continue;
      const arr = tiers.get(def.tier) ?? [];
      arr.push(def);
      tiers.set(def.tier, arr);
    }
    return tiers;
  }, [fullNavAccess]);

  const filteredGrouped = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return grouped;
    const next = new Map<string, (typeof MODULE_REGISTRY)[number][]>();
    for (const [tier, defs] of grouped.entries()) {
      const matches = defs.filter(
        (def) =>
          def.label.toLowerCase().includes(q) ||
          def.key.toLowerCase().includes(q) ||
          (moduleEntry(def.key)?.description ?? "").toLowerCase().includes(q),
      );
      if (matches.length) next.set(tier, matches);
    }
    return next;
  }, [grouped, query]);

  async function persist(next: Record<ModuleKey, boolean>) {
    setPending(true);
    const modules = (Object.keys(next) as ModuleKey[]).map((key) => ({
      key,
      enabled: next[key] ?? true,
    }));
    const res = await saveKitchenModulePreferences({ modules });
    setPending(false);
    const _err = getActionError(res); if (_err) toast.error(_err);
    else toast.success("Module visibility saved");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search modules…"
          className="max-w-md rounded-full"
          aria-label="Search modules"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={pending}
          onClick={() => {
            void (async () => {
              setPending(true);
              const r = await resetKitchenModulePreferencesToRecommended();
              setPending(false);
              const _err = getActionError(r); if (_err) toast.error(_err);
              else {
                toast.success("Reset to recommended for your business type");
                window.location.reload();
              }
            })();
          }}
        >
          Reset to recommended
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="rounded-full"
          disabled={pending}
          onClick={() => {
            void (async () => {
              setPending(true);
              const r = await clearKitchenModulePreferences();
              setPending(false);
              const _err = getActionError(r); if (_err) toast.error(_err);
              else {
                toast.success("All standard modules enabled");
                window.location.reload();
              }
            })();
          }}
        >
          Enable all standard modules
        </Button>
      </div>

      {[...filteredGrouped.entries()].map(([tier, defs]) => (
        <Card key={tier} className="space-y-4 border-border/80 bg-card/90 p-6 shadow-sm">
          <p className="text-sm font-semibold">{TIER_LABEL[tier as keyof typeof TIER_LABEL]}</p>
          <div className="divide-y divide-border/60">
            {defs.map((def) => {
              const locked = LOCKED_ON.has(def.key);
              const on = state[def.key] ?? true;
              const readiness = getModuleReadinessByModuleKey(def.key);
              const readinessLabel = readiness
                ? moduleReadinessBadgeLabel(readiness.status)
                : null;
              const requiresEnrollment =
                readiness != null &&
                moduleReadinessRequiresEnrollment(readiness.status) &&
                !enrolledPilotSet.has(readiness.id) &&
                !fullNavAccess;
              return (
                <div
                  key={def.key}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Label className="text-sm font-medium">{def.label}</Label>
                      {readinessLabel ? (
                        <Badge
                          variant="secondary"
                          className="rounded-full px-1.5 py-0 text-[10px] uppercase tracking-wide"
                        >
                          {readinessLabel}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {moduleEntry(def.key)?.description ?? def.key}
                    </p>
                    <p className="mt-1 text-[11px] leading-snug text-muted-foreground/90">
                      {moduleRecommendationBlurb(businessType, def.key)}
                    </p>
                    {readiness?.status === "PILOT_ONLY" ? (
                      <p className="mt-1 text-[11px] leading-snug text-amber-700 dark:text-amber-300">
                        {requiresEnrollment
                          ? "This pilot module requires platform enrollment before the workspace can enable it."
                          : "This workspace is enrolled in the pilot. Enable it here when you are ready."}
                      </p>
                    ) : null}
                  </div>
                  {locked ? (
                    <span className="text-xs text-muted-foreground">Always on</span>
                  ) : (
                    <Switch
                      checked={on}
                      disabled={pending || requiresEnrollment}
                      onCheckedChange={(v) => {
                        const next = { ...state, [def.key]: Boolean(v) };
                        setState(next);
                        void persist(next);
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
