import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TEMPLATES: { slug: string; title: string; description: string; type: string }[] = [
  {
    slug: "restaurant-service-location",
    title: "Restaurant service location",
    description: "Single service location with dine-in hours, pickup window, and a kitchen line.",
    type: "RESTAURANT",
  },
  {
    slug: "cafe-with-pickup",
    title: "Café with pickup",
    description: "Morning hours, baked-goods pickup slots, and supplier delivery notes.",
    type: "CAFE",
  },
  {
    slug: "bar-event-venue",
    title: "Bar / event venue",
    description: "Evening service plus private event hours; alcohol disclaimer placeholder.",
    type: "BAR",
  },
  {
    slug: "bakery-pickup-point",
    title: "Bakery pickup point",
    description: "Daily batch days + scheduled pickup slots; allergen label QC checks.",
    type: "BAKERY",
  },
  {
    slug: "catering-commissary",
    title: "Catering commissary",
    description: "Production-only kitchen with loadout windows and event delivery hub.",
    type: "CATERING_KITCHEN",
  },
  {
    slug: "ghost-kitchen-multibrand",
    title: "Ghost kitchen (multi-brand)",
    description: "Shared kitchen with channel-based routing and per-brand production.",
    type: "GHOST_KITCHEN",
  },
  {
    slug: "delivery-hub",
    title: "Delivery hub",
    description: "Holding + handoff hub; no on-prem dining.",
    type: "DELIVERY_HUB",
  },
  {
    slug: "meal-prep-commissary",
    title: "Meal prep commissary",
    description: "Production + packing + route start; weekly menu publish cadence.",
    type: "COMMISSARY",
  },
];

export default function LocationTemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Location templates</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Starting points for common kitchen layouts. Pick a template, then fine-tune from the location detail page.
          Templates pre-fill the type and a default checklist on creation.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {TEMPLATES.map((t) => (
          <Card key={t.slug} className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t.title}</CardTitle>
              <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-2 pt-0">
              <span className="text-xs text-muted-foreground">Type: {t.type}</span>
              <Button asChild size="sm">
                <Link href={`/dashboard/locations/new?type=${encodeURIComponent(t.type)}`}>Use template</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Templates currently seed only the type — full per-template hour / fulfillment defaults land in a follow-up pass.
      </p>
    </div>
  );
}
