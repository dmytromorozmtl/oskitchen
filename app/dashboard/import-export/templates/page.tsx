import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { TEMPLATE_KINDS } from "@/lib/import-export/template-definitions";

const TITLES: Record<(typeof TEMPLATE_KINDS)[number], { title: string; notes: string }> = {
  customers: { title: "Customers", notes: "Email, name, phone — CRM alignment." },
  menu_items: { title: "Menu items", notes: "Title, menu, category, price, active flag." },
  ingredients: { title: "Ingredients", notes: "Name, unit, supplier, cost — powers purchasing + demand." },
  recipes: { title: "Recipes", notes: "Yield and labor — ties to costing." },
  suppliers: { title: "Suppliers", notes: "Vendor master for PO workflow." },
  orders: { title: "Orders", notes: "High-level guest + fulfillment placeholders." },
  brands: { title: "Brands", notes: "Ghost kitchen / multi-brand setups." },
  locations: { title: "Locations", notes: "Operational sites and timezones." },
  nutrition_allergens: { title: "Nutrition & allergens", notes: "Numeric macros + allergen tokens." },
  product_mapping: { title: "Product mapping", notes: "External IDs for sales channels." },
  menu_assignments: { title: "Menu assignments", notes: "Visibility and ordering per menu." },
};

export default async function ImportExportTemplatesPage() {
  await getTenantActor();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">CSV templates</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Canonical headers and sample rows. Extra columns are ignored during mapping; missing required columns surface as
          validation errors before import.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Templates</CardTitle>
          <CardDescription>Download CSV, copy column names from the first row, or open sample data in a sheet tool.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/80 text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Dataset</th>
                <th className="py-2 pr-4 font-medium">Notes</th>
                <th className="py-2 font-medium">Download</th>
              </tr>
            </thead>
            <tbody>
              {TEMPLATE_KINDS.map((kind) => {
                const meta = TITLES[kind];
                const href = `/api/import-export/template?kind=${encodeURIComponent(kind)}`;
                return (
                  <tr key={kind} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pr-4 font-medium">{meta.title}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{meta.notes}</td>
                    <td className="py-3">
                      <Link href={href} className="text-primary underline underline-offset-4">
                        {kind}_template.csv
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
