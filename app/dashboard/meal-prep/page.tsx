import type { Metadata } from "next";

import { MealPrepOsPanel } from "@/components/meal-prep/meal-prep-os-panel";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadMealPrepOsDashboard } from "@/services/meal-prep/meal-prep-os-service";

export const metadata: Metadata = {
  title: "Meal Prep OS",
  description: "Weekly menus, cutoffs, forecasting, and subscription cycles for meal prep operators.",
};

export const dynamic = "force-dynamic";

export default async function MealPrepOsPage() {
  const { workspaceId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Meal Prep OS requires a workspace</CardTitle>
          <CardDescription>
            Configure weekly menus and meal plans to run preorder cutoffs and production forecasting.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const dashboard = await loadMealPrepOsDashboard(workspaceId);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 pb-10">
      <MealPrepOsPanel dashboard={dashboard} />
    </div>
  );
}
