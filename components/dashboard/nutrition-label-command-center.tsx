"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, FileSpreadsheet, Printer, Settings2 } from "lucide-react";

import { ensureDefaultLabelTemplatesAction } from "@/actions/label-print-queue";
import { updateNutritionPackingGatesFormAction, updateStorefrontLabelVisibilityFormAction } from "@/actions/nutrition-label-settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { INTERNAL_VERIFICATION_BADGE, LABEL_DATA_DISCLAIMER } from "@/lib/nutrition/label-disclaimers";
import type { LabelCommandCenterStats } from "@/services/nutrition-labels/command-center-stats";

export type NutritionLabelNeedRow = {
  id: string;
  title: string;
  menuTitle: string;
  nutrition: string;
  allergen: string;
  ingredient: string;
};

export function NutritionLabelCommandCenter({
  pageTitle,
  stats,
  needsReview,
  kitchenBlockAllergen,
  kitchenBlockNutrition,
  storefrontNutritionUnverified,
  storefrontAllergenUnverified,
  storefrontIngredientUnverified,
}: {
  pageTitle: string;
  stats: LabelCommandCenterStats;
  needsReview: NutritionLabelNeedRow[];
  kitchenBlockAllergen: boolean;
  kitchenBlockNutrition: boolean;
  storefrontNutritionUnverified: boolean;
  storefrontAllergenUnverified: boolean;
  storefrontIngredientUnverified: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = React.useState("overview");

  async function flush(fn: () => Promise<unknown>) {
    await fn();
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">{pageTitle}</h1>
            <Badge variant="outline" className="rounded-full border-amber-500/50 text-amber-900 dark:text-amber-100">
              {INTERNAL_VERIFICATION_BADGE}
            </Badge>
          </div>
          <p className="mt-2 max-w-3xl text-muted-foreground">{LABEL_DATA_DISCLAIMER}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-full">
            <Link href="/dashboard/products">Add menu item</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/nutrition-labels/import">Import label data</Link>
          </Button>
        </div>
      </div>

      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4" />
            Packaging workflow safety
          </CardTitle>
          <CardDescription>
            Fields here support internal prep and packing only. Always validate against lab tests or supplier
            documentation before guest-facing prints.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {(
          [
            ["overview", "Overview"],
            ["review", "Needs review"],
            ["links", "More"],
            ["settings", "Settings"],
          ] as const
        ).map(([k, label]) => (
          <Button
            key={k}
            type="button"
            variant={tab === k ? "secondary" : "ghost"}
            className="rounded-full"
            onClick={() => setTab(k)}
          >
            {label}
          </Button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="space-y-4">
          {stats.totalActiveProducts === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>No items to label yet</CardTitle>
                <CardDescription>
                  Add menu items, drinks, baked goods, meals, or catering packages first. Then enter nutrition, allergen,
                  ingredient, and packing label data from this command center.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button asChild className="rounded-full">
                  <Link href="/dashboard/products">Add menu item</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/dashboard/nutrition-labels/import">Import label data</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Active catalog items" value={stats.totalActiveProducts} hint="From active menus" />
          <StatCard title="Missing nutrition profile" value={stats.missingNutritionProfile} tone="warn" />
          <StatCard title="Missing allergen profile" value={stats.missingAllergenProfile} tone="warn" />
          <StatCard title="Missing ingredient declaration" value={stats.missingIngredientDeclaration} tone="warn" />
          <StatCard title="Nutrition needs review" value={stats.nutritionNeedsReview} />
          <StatCard title="Allergen needs review" value={stats.allergenNeedsReview} />
          <StatCard title="Ingredient needs review" value={stats.ingredientNeedsReview} />
          <StatCard title="Verified nutrition rows" value={stats.nutritionVerified} tone="ok" />
          <StatCard title="Verified allergen rows" value={stats.allergenVerified} tone="ok" />
          <StatCard title="Blocked (nutrition)" value={stats.nutritionBlocked} tone="bad" />
          <StatCard title="Labels queued" value={stats.labelsQueued} />
          <StatCard title="Printed today" value={stats.labelsPrintedToday} />
          </div>
        </div>
      ) : null}

      {tab === "review" ? (
        <Card>
          <CardHeader>
            <CardTitle>Needs review</CardTitle>
            <CardDescription>Items missing structured profiles or still in review.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {needsReview.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing in this queue right now.</p>
            ) : (
              <ul className="divide-y rounded-xl border">
                {needsReview.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{r.menuTitle}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Badge variant="outline" className="rounded-full text-[10px]">
                          N:{r.nutrition}
                        </Badge>
                        <Badge variant="outline" className="rounded-full text-[10px]">
                          A:{r.allergen}
                        </Badge>
                        <Badge variant="outline" className="rounded-full text-[10px]">
                          I:{r.ingredient}
                        </Badge>
                      </div>
                    </div>
                    <Button asChild size="sm" className="rounded-full">
                      <Link href={`/dashboard/nutrition-labels/items/${r.id}`}>Open</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}

      {tab === "links" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <LinkCard
            href="/dashboard/nutrition-labels/print-queue"
            title="Print queue"
            desc="Queued and printed label jobs."
            icon={<Printer className="h-5 w-5" />}
          />
          <LinkCard
            href="/dashboard/nutrition-labels/import"
            title="Import / export"
            desc="CSV templates and validation (preview)."
            icon={<FileSpreadsheet className="h-5 w-5" />}
          />
          <LinkCard
            href="/dashboard/nutrition-labels/reports"
            title="Reports"
            desc="Rollups for audits and QA."
            icon={<FileSpreadsheet className="h-5 w-5" />}
          />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Starter templates</CardTitle>
              <CardDescription>Create default label templates for this workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                className="rounded-full"
                onClick={() => void flush(() => ensureDefaultLabelTemplatesAction())}
              >
                Add starter templates
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "settings" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="h-4 w-4" />
                Packing gates
              </CardTitle>
              <CardDescription>Optional hard checks before packing (packing UI should surface warnings).</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateNutritionPackingGatesFormAction} className="space-y-4">
                <LabeledSelect
                  label="Block packing without verified allergen profile"
                  name="blockAllergen"
                  defaultValue={kitchenBlockAllergen ? "on" : "off"}
                />
                <LabeledSelect
                  label="Block packing without verified nutrition profile"
                  name="blockNutrition"
                  defaultValue={kitchenBlockNutrition ? "on" : "off"}
                />
                <Button type="submit" className="rounded-full">
                  Save packing rules
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Storefront visibility</CardTitle>
              <CardDescription>
                By default, unverified nutrition / structured allergens / ingredient declarations stay off the public menu.
                Enable only when you accept the compliance risk.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateStorefrontLabelVisibilityFormAction} className="space-y-4">
                <LabeledSelect
                  label="Show nutrition when not verified"
                  name="publicNutrition"
                  defaultValue={storefrontNutritionUnverified ? "on" : "off"}
                />
                <LabeledSelect
                  label="Show allergens when not verified"
                  name="publicAllergens"
                  defaultValue={storefrontAllergenUnverified ? "on" : "off"}
                />
                <LabeledSelect
                  label="Show ingredients when not verified"
                  name="publicIngredients"
                  defaultValue={storefrontIngredientUnverified ? "on" : "off"}
                />
                <Button type="submit" className="rounded-full">
                  Save storefront rules
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  tone,
}: {
  title: string;
  value: number;
  hint?: string;
  tone?: "warn" | "ok" | "bad";
}) {
  const border =
    tone === "warn"
      ? "border-amber-500/30"
      : tone === "ok"
        ? "border-emerald-500/30"
        : tone === "bad"
          ? "border-red-500/30"
          : "border-border/80";
  return (
    <Card className={`shadow-sm ${border}`}>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}

function LinkCard({
  href,
  title,
  desc,
  icon,
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <Card className="h-full border-border/80 transition hover:border-primary/40 hover:shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">{icon}</div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{desc}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

function LabeledSelect({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{label}</p>
      <select
        name={name}
        defaultValue={defaultValue}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
      >
        <option value="off">Off</option>
        <option value="on">On</option>
      </select>
    </div>
  );
}
