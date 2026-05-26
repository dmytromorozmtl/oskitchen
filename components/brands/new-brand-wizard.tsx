"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createBrand } from "@/actions/brands";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BRAND_CONCEPT_LABELS } from "@/lib/brands/brand-types";
import { brandDetailPath } from "@/lib/brands/brand-routing";
import { BUSINESS_TYPE_LABELS, ALL_BUSINESS_TYPES_ORDERED } from "@/lib/business-modes";
import type { BrandTemplateDefaults } from "@/lib/brands/brand-template-defaults";
import type { BrandConceptKind, BusinessType, MenuStrategy } from "@prisma/client";
import { MenuStrategy as MenuStrategyEnum } from "@prisma/client";

const STEPS = [
  "Basics",
  "Brand type",
  "Visual identity",
  "Storefront",
  "Menu strategy",
  "Sales channels",
  "Production",
  "Review",
] as const;

const STOREFRONT_TEMPLATES = [
  { id: "restaurant-classic", label: "Restaurant — classic" },
  { id: "cafe-warm", label: "Café — warm retail" },
  { id: "bar-events", label: "Bar & events" },
  { id: "bakery-preorder", label: "Bakery preorder" },
  { id: "catering-quote", label: "Catering / quotes" },
  { id: "meal-prep-weekly", label: "Meal prep weekly" },
  { id: "ghost-minimal", label: "Ghost kitchen minimal" },
  { id: "delivery-first", label: "Delivery-first" },
] as const;

const MENU_STRATEGIES = Object.values(MenuStrategyEnum) as MenuStrategy[];

type Draft = {
  name: string;
  slug: string;
  description: string;
  positioning: string;
  customerSegment: string;
  contactEmail: string;
  conceptKind: BrandConceptKind;
  brandColor: string;
  secondaryColor: string;
  logoUrl: string;
  coverImageUrl: string;
  websiteUrl: string;
  storefrontTemplate: string;
  menuStrategy: MenuStrategy;
  salesChannelNotes: string;
  productionNotes: string;
  defaultBusinessMode: BusinessType | "";
  activateImmediately: boolean;
};

const emptyDraft = (): Draft => ({
  name: "",
  slug: "",
  description: "",
  positioning: "",
  customerSegment: "",
  contactEmail: "",
  conceptKind: "OTHER",
  brandColor: "",
  secondaryColor: "",
  logoUrl: "",
  coverImageUrl: "",
  websiteUrl: "",
  storefrontTemplate: "restaurant-classic",
  menuStrategy: "RESTAURANT_MENU",
  salesChannelNotes: "",
  productionNotes: "",
  defaultBusinessMode: "",
  activateImmediately: true,
});

export function NewBrandWizard({ templateHints }: { templateHints: BrandTemplateDefaults | null }) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [draft, setDraft] = React.useState<Draft>(emptyDraft);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (!templateHints) return;
    setDraft((d) => ({
      ...d,
      conceptKind: templateHints.conceptKind,
      defaultBusinessMode: templateHints.defaultBusinessMode ?? "",
      description: d.description || templateHints.descriptionHint,
      storefrontTemplate: templateHints.storefrontTemplate,
      menuStrategy: templateHints.menuStrategy,
    }));
  }, [templateHints]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const canNext =
    step === 0
      ? draft.name.trim().length >= 2
      : step === 1
        ? Boolean(draft.conceptKind)
        : true;

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append("name", draft.name.trim());
      fd.append("slug", draft.slug.trim() || draft.name.trim());
      fd.append("description", draft.description);
      fd.append("positioning", draft.positioning);
      fd.append("customerSegment", draft.customerSegment);
      fd.append("contactEmail", draft.contactEmail);
      fd.append("brandColor", draft.brandColor);
      fd.append("secondaryColor", draft.secondaryColor);
      fd.append("logoUrl", draft.logoUrl);
      fd.append("coverImageUrl", draft.coverImageUrl);
      fd.append("websiteUrl", draft.websiteUrl);
      fd.append("conceptKind", draft.conceptKind);
      fd.append("storefrontTemplate", draft.storefrontTemplate);
      fd.append("menuStrategy", draft.menuStrategy);
      fd.append("salesChannelNotes", draft.salesChannelNotes);
      fd.append("productionNotes", draft.productionNotes);
      fd.append("lifecycleStatus", draft.activateImmediately ? "ACTIVE" : "DRAFT");
      if (draft.defaultBusinessMode) fd.append("defaultBusinessMode", draft.defaultBusinessMode);

      const res = await createBrand(fd);
      if ("error" in res) {
        setError(getActionError(res) ?? "Something went wrong");
        return;
      }
      router.push(brandDetailPath(res.id));
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="rounded-full" asChild>
          <Link href="/dashboard/brands">← Brands</Link>
        </Button>
        <p className="text-xs text-muted-foreground">
          Step {step + 1} of {STEPS.length}: {STEPS[step]}
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>New brand</CardTitle>
          <CardDescription>
            Guided setup for concepts, virtual labels, and multi-brand kitchens. Nothing publishes until you wire
            storefronts and channels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {step === 0 ? (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Brand name</Label>
                <Input
                  id="name"
                  value={draft.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Sweetdrop Bakery"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={draft.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  placeholder="auto-filled from name if empty"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={draft.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="positioning">Positioning</Label>
                <Textarea
                  id="positioning"
                  value={draft.positioning}
                  onChange={(e) => set("positioning", e.target.value)}
                  rows={2}
                  placeholder="Guest promise, price band, daypart focus"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="segment">Target customer segment</Label>
                <Input
                  id="segment"
                  value={draft.customerSegment}
                  onChange={(e) => set("customerSegment", e.target.value)}
                  placeholder="e.g. corporate lunch, neighborhood families"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Contact email</Label>
                <Input
                  id="email"
                  type="email"
                  value={draft.contactEmail}
                  onChange={(e) => set("contactEmail", e.target.value)}
                />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-2">
              <Label>Concept type</Label>
              <Select value={draft.conceptKind} onValueChange={(v) => set("conceptKind", v as BrandConceptKind)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose type" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(BRAND_CONCEPT_LABELS) as BrandConceptKind[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {BRAND_CONCEPT_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid gap-2 pt-2">
                <Label>Default business mode</Label>
                <Select
                  value={draft.defaultBusinessMode || "__none__"}
                  onValueChange={(v) => set("defaultBusinessMode", v === "__none__" ? "" : (v as BusinessType))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not set</SelectItem>
                    {ALL_BUSINESS_TYPES_ORDERED.map((bt) => (
                      <SelectItem key={bt} value={bt}>
                        {BUSINESS_TYPE_LABELS[bt]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4">
              <div className="grid gap-2 md:grid-cols-2 md:gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bc">Brand color</Label>
                  <Input id="bc" value={draft.brandColor} onChange={(e) => set("brandColor", e.target.value)} placeholder="#286ab8" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sc">Secondary color</Label>
                  <Input
                    id="sc"
                    value={draft.secondaryColor}
                    onChange={(e) => set("secondaryColor", e.target.value)}
                    placeholder="#111827"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input id="logo" value={draft.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} placeholder="https://…" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cover">Cover image URL</Label>
                <Input
                  id="cover"
                  value={draft.coverImageUrl}
                  onChange={(e) => set("coverImageUrl", e.target.value)}
                  placeholder="https://…"
                />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Storefront template</Label>
                <Select value={draft.storefrontTemplate} onValueChange={(v) => set("storefrontTemplate", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STOREFRONT_TEMPLATES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="web">Website URL</Label>
                <Input
                  id="web"
                  value={draft.websiteUrl}
                  onChange={(e) => set("websiteUrl", e.target.value)}
                  placeholder="https://brand.com"
                />
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="grid gap-2">
              <Label>Menu strategy preset</Label>
              <Select value={draft.menuStrategy} onValueChange={(v) => set("menuStrategy", v as MenuStrategy)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {MENU_STRATEGIES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="grid gap-2">
              <Label htmlFor="ch">Channel plans & notes</Label>
              <Textarea
                id="ch"
                rows={5}
                value={draft.salesChannelNotes}
                onChange={(e) => set("salesChannelNotes", e.target.value)}
                placeholder="Shopify / Woo / Uber Eats / native storefront — which belongs to this brand?"
              />
            </div>
          ) : null}

          {step === 6 ? (
            <div className="grid gap-2">
              <Label htmlFor="pr">Production defaults</Label>
              <Textarea
                id="pr"
                rows={5}
                value={draft.productionNotes}
                onChange={(e) => set("productionNotes", e.target.value)}
                placeholder="Batching, cutoff, station priorities, label copy"
              />
            </div>
          ) : null}

          {step === 7 ? (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border border-border/80 bg-muted/30 p-4 space-y-1">
                <p>
                  <span className="font-medium text-foreground">Name:</span> {draft.name}
                </p>
                <p>
                  <span className="font-medium text-foreground">Slug:</span> {draft.slug || "(from name)"}
                </p>
                <p>
                  <span className="font-medium text-foreground">Type:</span> {BRAND_CONCEPT_LABELS[draft.conceptKind]}
                </p>
                <p>
                  <span className="font-medium text-foreground">Lifecycle:</span>{" "}
                  {draft.activateImmediately ? "Active" : "Draft"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="act"
                  checked={draft.activateImmediately}
                  onCheckedChange={(c) => set("activateImmediately", c === true)}
                />
                <Label htmlFor="act" className="font-normal cursor-pointer">
                  Activate immediately (otherwise saved as draft)
                </Label>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={step === 0 || pending}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                className="rounded-full"
                disabled={!canNext || pending}
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              >
                Next
              </Button>
            ) : (
              <Button type="button" className="rounded-full" disabled={pending} onClick={submit}>
                {pending ? "Creating…" : "Create brand"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
