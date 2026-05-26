import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NutritionLabelImportPage() {
  const headers = ["sku_or_product_id", "title_match", "calories", "serving_size", "protein", "allergens_csv"];

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <div>
        <Button asChild variant="ghost" className="mb-2 rounded-full px-0 text-muted-foreground">
          <Link href="/dashboard/nutrition-labels">← Label command center</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Import / export</h1>
        <p className="text-sm text-muted-foreground">
          CSV import with validation preview is planned next. Use per-item screens for production data entry today.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Template header row</CardTitle>
          <CardDescription>Copy into a spreadsheet to prepare a nutrition import.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">{headers.join(",")}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
