import Link from "next/link";

import { IngredientCsvPreviewForm } from "@/components/dashboard/import-export/ingredient-csv-preview-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";

const STEPS = [
  "Choose import type",
  "Download template",
  "Upload CSV",
  "Column mapping",
  "Validation preview",
  "Review actions",
  "Confirm import",
  "Results",
] as const;

export default async function ImportDataPage() {
  await getTenantActor();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import data</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Follow the wizard: templates → upload → mapping → validation preview → confirm. Production writes stay behind
          explicit confirmation and job records.
        </p>
      </div>

      <ol className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s} className="rounded-lg border border-border/80 bg-muted/40 px-3 py-2">
            <span className="font-mono text-xs text-muted-foreground">{i + 1}.</span> {s}
          </li>
        ))}
      </ol>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Ingredients (preview live)</CardTitle>
          <CardDescription>
            Upload a CSV to generate an <code className="rounded bg-muted px-1">ImportJob</code> with row-level validation
            and capped preview rows — no inserts yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <IngredientCsvPreviewForm />
          <p className="text-sm text-muted-foreground">
            Need the column layout first?{" "}
            <Link href="/dashboard/import-export/templates" className="font-medium text-primary underline underline-offset-4">
              Templates
            </Link>{" "}
            or{" "}
            <Link href="/api/import-export/template?kind=ingredients" className="font-medium text-primary underline underline-offset-4">
              Download ingredients template
            </Link>
            .
          </p>
        </CardContent>
      </Card>

      <Card className="border-dashed border-border/80">
        <CardHeader>
          <CardTitle className="text-lg">Other import types</CardTitle>
          <CardDescription>
            Customers, menu items, orders, recipes, and mappings reuse the same job + preview pipeline as those validators
            land — use templates and support-assisted imports until each type is wired.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
