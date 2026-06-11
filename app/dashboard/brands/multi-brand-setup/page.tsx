import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { brandAssignmentPath, brandHubPath, brandTemplatesPath } from "@/lib/brands/brand-routing";

const STEPS = [
  {
    title: "How many brands?",
    body: "List each guest-facing concept or virtual label, even if they share a kitchen.",
  },
  {
    title: "Shared kitchen or separate locations?",
    body: "Ghost kitchens usually share one location; groups may span sites — affects production boards and inventory.",
  },
  {
    title: "Shared menu items or separate?",
    body: "Shared SKUs reduce duplication; separate catalogs simplify pricing and channel mapping.",
  },
  {
    title: "Shared inventory or separate?",
    body: "Shared ingredients with brand-scoped demand is common; separate inventory is heavier but clearer.",
  },
  {
    title: "Storefront topology",
    body: "Pick per-brand domains, subdomains, or a multi-brand landing hub — see BRAND_STOREFRONTS.md.",
  },
  {
    title: "Sales channels",
    body: "Map each external store to a brand for clean order ingestion and KPI rollups.",
  },
  {
    title: "Production boards",
    body: "Shared stations with brand badges vs brand-specific boards — choose based on ticket volume.",
  },
  {
    title: "Reporting",
    body: "Ensure orders carry brand_id; use assignment tools for historical rows without destructive migration.",
  },
];

export default async function MultiBrandSetupPage() {
  await getTenantActor();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Multi-brand setup</h1>
          <p className="mt-2 text-muted-foreground">
            Structured checklist for ghost kitchens and multi-concept operators. Outputs: recommended templates,
            modules to enable, and follow-up tasks (no auto-migration).
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={brandHubPath()}>Back</Link>
        </Button>
      </div>

      <ol className="space-y-4">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {i + 1}. {s.title}
                </CardTitle>
                <CardDescription>{s.body}</CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ol>

      <Card className="border-dashed border-border/80">
        <CardHeader>
          <CardTitle>Next actions</CardTitle>
          <CardDescription>Jump to tooling without leaving the Brands area.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild className="rounded-full">
            <Link href={brandTemplatesPath()}>Open templates</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href={brandAssignmentPath()}>Open assignment tools</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
