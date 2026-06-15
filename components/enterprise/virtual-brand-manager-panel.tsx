"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, Clock, Rocket, Sparkles } from "lucide-react";

import { provisionVirtualBrandQuick } from "@/actions/virtual-brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { VirtualBrandManagerDashboard } from "@/lib/enterprise/virtual-brand-types";
import { cn } from "@/lib/utils";

type Props = {
  dashboard: VirtualBrandManagerDashboard;
  initialTemplate?: string;
};

export function VirtualBrandManagerPanel({ dashboard, initialTemplate }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [templateKey, setTemplateKey] = useState(
    dashboard.templates.some((row) => row.key === initialTemplate) ? initialTemplate! : "ghost_kitchen",
  );

  const totalStepMinutes = dashboard.provisionSteps.reduce((sum, step) => sum + step.estimatedMinutes, 0);

  function handleProvision(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    formData.set("templateKey", templateKey);
    startTransition(async () => {
      const res = await provisionVirtualBrandQuick(formData);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      router.push(`/dashboard/brands/${res.brandId}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6" data-testid="virtual-brand-manager-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <Sparkles className="h-8 w-8 text-primary" aria-hidden />
            Virtual Brand Manager
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Launch a ghost, cloud, meal-prep, or catering virtual brand in about{" "}
            {dashboard.provisionTargetMinutes} minutes — template defaults, starter menu, and storefront link
            in one flow.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/enterprise/multi-brand">Multi-Brand Command Center</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/brands/new">Full brand wizard</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Virtual brands</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{dashboard.summary.virtualBrandCount}</p>
            <p className="text-xs text-muted-foreground">Ghost, cloud, meal-prep, catering</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg setup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {Math.round(dashboard.summary.avgSetupProgress * 100)}%
            </p>
            <p className="text-xs text-muted-foreground">Logo, menu, storefront completeness</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ready to launch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{dashboard.summary.brandsReadyToLaunch}</p>
            <p className="text-xs text-muted-foreground">≥ 80% setup progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clone sources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{dashboard.summary.cloneSourceCount}</p>
            <p className="text-xs text-muted-foreground">Active menus with products</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Rocket className="h-5 w-5 text-primary" aria-hidden />
              Create in {dashboard.provisionTargetMinutes} minutes
            </CardTitle>
            <CardDescription>
              Pick a template, name the brand, optionally clone an existing menu — auto-provision handles the rest.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {dashboard.templates.map((template) => (
                <button
                  key={template.key}
                  type="button"
                  onClick={() => setTemplateKey(template.key)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-colors",
                    templateKey === template.key
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <p className="font-medium">{template.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                </button>
              ))}
            </div>

            <form onSubmit={handleProvision} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="vb-name">Brand name</Label>
                <Input id="vb-name" name="name" placeholder="Night Owl Tacos" required minLength={2} />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="vb-slug">Slug (optional)</Label>
                  <Input id="vb-slug" name="slug" placeholder="night-owl-tacos" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vb-color">Brand color</Label>
                  <Input id="vb-color" name="brandColor" type="color" defaultValue="#7c3aed" />
                </div>
              </div>
              {dashboard.cloneSources.length > 0 ? (
                <div className="grid gap-2">
                  <Label htmlFor="vb-clone">Clone menu (optional)</Label>
                  <select
                    id="vb-clone"
                    name="cloneFromMenuId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue=""
                  >
                    <option value="">Start with empty starter menu</option>
                    {dashboard.cloneSources.map((source) => (
                      <option key={source.menuId} value={source.menuId}>
                        {source.title} ({source.productCount} items)
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="rounded-full" disabled={pending}>
                {pending ? "Provisioning…" : "Launch virtual brand"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" aria-hidden />
              5-minute flow
            </CardTitle>
            <CardDescription>{totalStepMinutes} minutes total across {dashboard.provisionSteps.length} steps.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {dashboard.provisionSteps.map((step, index) => (
                <li key={step.id} className="flex gap-3 rounded-lg border border-border/70 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">
                      {step.label}{" "}
                      <span className="text-xs font-normal text-muted-foreground">~{step.estimatedMinutes} min</span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {dashboard.virtualBrands.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent virtual brands</CardTitle>
            <CardDescription>Setup progress and quick links to brand hub, menu, and integrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.virtualBrands.map((brand) => (
              <div
                key={brand.brandId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 p-4"
              >
                <div>
                  <p className="font-medium">{brand.name}</p>
                  <p className="text-xs text-muted-foreground">
                    /{brand.slug} · {brand.menuCount} menu{brand.menuCount === 1 ? "" : "s"} ·{" "}
                    {brand.storefrontCount} storefront{brand.storefrontCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={brand.setupProgress >= 0.8 ? "default" : "secondary"}>
                    {Math.round(brand.setupProgress * 100)}% setup
                  </Badge>
                  {brand.setupProgress >= 0.8 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />
                  ) : null}
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href={`/dashboard/brands/${brand.brandId}`}>Open</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
