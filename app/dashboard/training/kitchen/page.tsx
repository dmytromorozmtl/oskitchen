import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";

const steps = [
  "Open the production board and filter to today's prep.",
  "Check batch quantities against imported/test orders.",
  "Mark cooked only after the station lead confirms the tray.",
  "Escalate missing ingredients before packing begins.",
];

export default async function KitchenTrainingPage() {
  await getTenantActor();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Kitchen staff training</h1>
      <Card>
        <CardHeader>
          <CardTitle>Production board walkthrough</CardTitle>
          <CardDescription>Practice mode: read-only guidance unless a manager changes live data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            {steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <Button asChild>
            <Link href="/dashboard/production">Open production board</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
