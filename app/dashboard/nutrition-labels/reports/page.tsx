import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { getLabelCommandCenterStats } from "@/services/nutrition-labels/command-center-stats";

export default async function NutritionLabelReportsPage() {
  const { dataUserId } = await getTenantActor();
  const s = await getLabelCommandCenterStats(dataUserId);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      <div>
        <Button asChild variant="ghost" className="mb-2 rounded-full px-0 text-muted-foreground">
          <Link href="/dashboard/nutrition-labels">← Label command center</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Label reports</h1>
        <p className="text-sm text-muted-foreground">Lightweight rollups — detailed BI can query the same tables.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Verification</CardTitle>
            <CardDescription>Row counts by state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>Nutrition verified: {s.nutritionVerified}</p>
            <p>Allergen verified: {s.allergenVerified}</p>
            <p>Nutrition needs review: {s.nutritionNeedsReview}</p>
            <p>Allergen needs review: {s.allergenNeedsReview}</p>
            <p>Expired nutrition flags: {s.expiredNutrition}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Printing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>Queued: {s.labelsQueued}</p>
            <p>Printed today: {s.labelsPrintedToday}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
