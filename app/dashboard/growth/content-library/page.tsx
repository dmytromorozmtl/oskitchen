import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function GrowthContentLibraryPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Outreach snippets</CardTitle>
          <CardDescription>
            Canonical scripts also live in{" "}
            <code className="rounded bg-muted px-1">docs/OUTREACH_LIBRARY.md</code> in the repo —
            edit there for version control.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-muted-foreground">
          <section>
            <h3 className="font-medium text-foreground">Cold opener — meal prep</h3>
            <p className="mt-2 leading-relaxed">
              Most weekly meal prep teams lose hours reconciling Shopify or Woo orders against a
              printed prep sheet. OS Kitchen gives you one queue with cutoff-aware menus — worth a
              15-minute walkthrough?
            </p>
          </section>
          <section>
            <h3 className="font-medium text-foreground">Catering — coordination angle</h3>
            <p className="mt-2 leading-relaxed">
              Corporate drops live or die by schedule fidelity. We consolidate quotes, production,
              and packing labels so your crew isn&apos;t bouncing between spreadsheets mid-week.
            </p>
          </section>
          <section>
            <h3 className="font-medium text-foreground">WooCommerce stores</h3>
            <p className="mt-2 leading-relaxed">
              If Woo is your source of truth, we normalize incoming orders into a kitchen-ready
              board — mapping SKUs once beats manual CSV exports every night.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
