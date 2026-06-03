"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Building, Palette, ShieldCheck, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

import {
  importFranchiseMenuCatalogAction,
  updateFranchiseBrandControlAction,
  updateFranchiseMenuEnforcementAction,
} from "@/actions/franchise-enterprise";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { FranchiseSuiteDashboard, FranchiseUnitRow } from "@/lib/enterprise/franchise-types";
import { cn, formatCurrency } from "@/lib/utils";

type Props = {
  dashboard: FranchiseSuiteDashboard;
};

const BRAND_STATUS_CLASS: Record<FranchiseUnitRow["brandStatus"], string> = {
  compliant: "bg-emerald-600 hover:bg-emerald-600",
  review: "bg-amber-500 hover:bg-amber-500",
  non_compliant: "bg-red-600 hover:bg-red-600",
};

function UnitRow({ unit }: { unit: FranchiseUnitRow }) {
  return (
    <tr className="border-b border-border/50" data-testid={`franchise-unit-${unit.franchiseId}`}>
      <td className="py-2 pr-3 font-medium">{unit.franchiseName}</td>
      <td className="py-2 pr-3 text-right tabular-nums">{formatCurrency(unit.totalRevenue)}</td>
      <td className="py-2 pr-3 text-right tabular-nums">{unit.royaltyRate}%</td>
      <td className="py-2 pr-3 text-right tabular-nums font-medium">{formatCurrency(unit.royaltyAmount)}</td>
      <td className="py-2 pr-3 text-right tabular-nums">{unit.menuCompliancePercent}%</td>
      <td className="py-2">
        <Badge className={cn("capitalize", BRAND_STATUS_CLASS[unit.brandStatus])}>
          {unit.brandStatus.replace(/_/g, " ")}
        </Badge>
      </td>
    </tr>
  );
}

export function FranchiseSuitePanel({ dashboard }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [lockedItems, setLockedItems] = useState(
    dashboard.menuEnforcement.lockedMenuItems.join("\n"),
  );
  const { brandControl, summary, period } = dashboard;

  function run(action: () => Promise<{ ok: boolean; error?: string; data?: { message?: string } }>) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error ?? "Request failed.");
        return;
      }
      toast.success(result.data?.message ?? "Saved.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6" data-testid="franchise-suite-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <Building className="h-8 w-8 text-primary" aria-hidden />
            Franchise management suite
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Brand control, royalty tracking, and menu enforcement across franchisee workspaces.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className={cn("rounded-full", period === "month" && "border-primary bg-primary/10")}
          >
            <Link href="?period=month">Month</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className={cn("rounded-full", period === "quarter" && "border-primary bg-primary/10")}
          >
            <Link href="?period=quarter">Quarter</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/dashboard/franchise/royalties">Royalties CSV →</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Franchise units" value={summary.franchiseCount} />
        <Kpi label="Total royalties" value={formatCurrency(summary.totalRoyalties)} hint={`Since ${dashboard.since}`} />
        <Kpi label="Avg menu compliance" value={`${summary.averageMenuCompliance}%`} />
        <Kpi label="Needs review" value={summary.unitsNeedingReview} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4" aria-hidden />
              Brand control
            </CardTitle>
            <CardDescription>Franchisor brand kit applied to franchisee audits.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              action={(formData) => {
                run(() => updateFranchiseBrandControlAction(formData));
              }}
            >
              <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                <p className="font-medium">{brandControl.brandName ?? "No brand configured"}</p>
                {brandControl.brandColor ? (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: brandControl.brandColor }}
                      aria-hidden
                    />
                    {brandControl.brandColor}
                  </p>
                ) : null}
                {brandControl.logoUrl ? (
                  <p className="text-xs text-muted-foreground truncate">Logo on file</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tagline">Brand tagline</Label>
                <input
                  id="tagline"
                  name="tagline"
                  defaultValue={brandControl.tagline ?? ""}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  placeholder="Consistency you can taste"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="enforcementMode">Enforcement mode</Label>
                <select
                  id="enforcementMode"
                  name="enforcementMode"
                  defaultValue={brandControl.enforcementMode}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="guided">Guided (80% compliance)</option>
                  <option value="strict">Strict (95% compliance)</option>
                </select>
              </div>
              <Button type="submit" size="sm" disabled={pending}>
                Save brand control
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4" aria-hidden />
              Menu enforcement
            </CardTitle>
            <CardDescription>Required items franchisees must carry on active menus.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <form
              className="space-y-3"
              action={(formData) => {
                formData.set("lockedMenuItems", lockedItems);
                run(() => updateFranchiseMenuEnforcementAction(formData));
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="mode">Mode</Label>
                <select
                  id="mode"
                  name="mode"
                  defaultValue={dashboard.menuEnforcement.mode}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="guided">Guided</option>
                  <option value="strict">Strict</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lockedMenuItems">Required menu items (one per line)</Label>
                <textarea
                  id="lockedMenuItems"
                  value={lockedItems}
                  onChange={(e) => setLockedItems(e.target.value)}
                  rows={6}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                  placeholder="Signature burger&#10;House fries&#10;Craft cola"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" size="sm" disabled={pending} data-testid="franchise-menu-save">
                  Save menu rules
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  data-testid="franchise-menu-import"
                  onClick={() => run(importFranchiseMenuCatalogAction)}
                >
                  Import from master menu
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Franchise units — royalties & compliance
          </CardTitle>
          <CardDescription>
            Royalties estimated from non-cancelled order totals · {period} view.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboard.units.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active franchises linked. Add `Franchise` records with franchisee workspaces to begin tracking.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2">Unit</th>
                    <th className="pb-2 text-right">Revenue</th>
                    <th className="pb-2 text-right">Rate</th>
                    <th className="pb-2 text-right">Royalty</th>
                    <th className="pb-2 text-right">Menu</th>
                    <th className="pb-2">Brand</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.units.map((unit) => (
                    <UnitRow key={unit.franchiseId} unit={unit} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}
