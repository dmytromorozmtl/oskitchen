import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PurchasingExportsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Exports"
        description="PO PDF and outbound email are placeholders — CSV and copy-to-clipboard keep workflows honest today."
      />
      <Card>
        <CardHeader>
          <CardTitle>Available today</CardTitle>
          <CardDescription>No fake integrations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            • Ingredient demand CSV — unchanged column layout: open{" "}
            <Link href="/dashboard/inventory/demand" className="underline underline-offset-4">
              Ingredient demand
            </Link>{" "}
            and use Download CSV.
          </p>
          <p>• PO PDF — planned; will reuse PO totals + supplier address JSON.</p>
          <p>• Email-ready PO — planned; will render plain-text block for manual paste into your mail client.</p>
        </CardContent>
      </Card>
    </div>
  );
}
