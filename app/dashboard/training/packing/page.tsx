import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";

const steps = [
  "Open packing verification and scan or select a test order.",
  "Confirm every line item before marking the bag complete.",
  "Print a sample label and check allergens, pickup date, and customer name.",
  "Escalate unmatched products instead of substituting manually.",
];

export default async function PackingTrainingPage() {
  await getTenantActor();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Packing staff training</h1>
      <Card>
        <CardHeader>
          <CardTitle>Packing verification walkthrough</CardTitle>
          <CardDescription>Use fake/test orders during onboarding; confirm before touching live orders.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            {steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/dashboard/packing/verify">Open packing verify</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/packing">Open labels</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
