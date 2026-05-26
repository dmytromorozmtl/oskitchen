import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { brandHubPath, brandNewWizardPath } from "@/lib/brands/brand-routing";
import type { BrandTemplateKey } from "@/lib/brands/brand-template-defaults";

const ENTRIES: { key: BrandTemplateKey; title: string; body: string }[] = [
  {
    key: "restaurant",
    title: "Restaurant concept",
    body: "Restaurant menu strategy, classic storefront shell, dine-in + takeout positioning.",
  },
  {
    key: "cafe",
    title: "Café concept",
    body: "Café specials strategy and warm retail storefront tone.",
  },
  {
    key: "bar_events",
    title: "Bar & events brand",
    body: "Drinks-first menu, events-oriented storefront, compliance copy placeholders in docs.",
  },
  {
    key: "bakery_preorder",
    title: "Bakery preorder brand",
    body: "Preorder menu strategy, pickup-slot emphasis, allergen-forward merchandising.",
  },
  {
    key: "catering",
    title: "Catering brand",
    body: "Catering packages menu strategy and quote-first storefront shell.",
  },
  {
    key: "meal_prep",
    title: "Meal prep brand",
    body: "Weekly preorder strategy, batch production notes, packing-friendly defaults.",
  },
  {
    key: "ghost_kitchen",
    title: "Ghost kitchen virtual brand",
    body: "Multi-brand menu strategy, minimal storefront, delivery-first positioning.",
  },
  {
    key: "cloud_kitchen",
    title: "Cloud kitchen delivery brand",
    body: "Daily menu cadence, delivery-first storefront, marketplace-oriented notes.",
  },
];

export default async function BrandTemplatesPage() {
  await getTenantActor();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Brand templates</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Each template seeds concept type, business mode, menu strategy, and storefront shell in the new-brand
            wizard. Customize after creation — nothing migrates legacy records automatically.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={brandHubPath()}>Back to brands</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {ENTRIES.map((e) => (
          <Card key={e.key} className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{e.title}</CardTitle>
              <CardDescription>{e.body}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="rounded-full" variant="premium">
                <Link href={`${brandNewWizardPath()}?template=${e.key}`}>Use template</Link>
              </Button>
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <Link href={`${brandNewWizardPath()}?template=${e.key}`}>Preview in wizard</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
