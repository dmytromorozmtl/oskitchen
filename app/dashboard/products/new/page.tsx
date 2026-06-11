import Link from "next/link";
import { ArrowLeft, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";

const STEPS = [
  "Choose item type",
  "Basic info",
  "Pricing",
  "Availability",
  "Production / fulfillment",
  "Nutrition / allergens",
  "Channels / storefront",
  "Review",
] as const;

export default async function NewProductWizardPage() {
  await getTenantActor();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="rounded-full gap-2">
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
            Back to catalog
          </Link>
        </Button>
      </div>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">New item wizard</h1>
        <p className="mt-2 text-muted-foreground">
          Full step-by-step creation (types, channels, production, nutrition) is rolling out next.
          Use the catalog for now — every item type in your workspace can start there, then attach to
          menus and storefronts when you are ready.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="h-5 w-5" />
            Planned steps
          </CardTitle>
          <CardDescription>
            Mirrors the FoodOps catalog model: one library, many menus and channels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            {STEPS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <Button asChild className="mt-6 rounded-full">
            <Link href="/dashboard/products">Add item in catalog</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
