import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { bufferDefaultForMode } from "@/lib/forecast/forecast-buffers";
import { forecastTerminologyForMode } from "@/lib/forecast/forecast-types";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function ForecastSettingsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: dataUserId },
    include: { kitchenSettings: { select: { businessType: true } } },
  });
  const businessMode = profile?.kitchenSettings?.businessType ?? null;
  const terminology = forecastTerminologyForMode(businessMode);
  const defaultBuffer = bufferDefaultForMode(businessMode);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Forecast settings</h1>
        <p className="text-muted-foreground">
          Buffer defaults and source defaults follow your business mode. Per-run overrides remain
          available in the wizard.
        </p>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Business mode</CardTitle>
          <CardDescription>{businessMode ?? "Not set"} · Title: {terminology.pageTitle}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <p>Default buffer: <span className="font-medium">{defaultBuffer}%</span></p>
          <p className="mt-1 text-muted-foreground">
            Default sources: {terminology.defaultSources.join(", ")}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Buffer guidance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Bakery</strong> — 12% default, supports batch rounding.</p>
          <p><strong>Bar</strong> — 8% default; garnish prep handled per-line.</p>
          <p><strong>Catering</strong> — 15% default to absorb event surprises.</p>
          <p><strong>Meal prep</strong> — 10% default; pairs with meal plan committed demand.</p>
          <p><strong>Restaurant / Café</strong> — 8% default; rely on weekday averages.</p>
          <p><strong>Ghost / Multi-brand</strong> — 12% default across attribution channels.</p>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Related modules</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <Link href="/dashboard/analytics" className="underline">Analytics</Link>
          <Link href="/dashboard/production" className="underline">Production</Link>
          <Link href="/dashboard/ingredients" className="underline">Ingredient demand</Link>
          <Link href="/dashboard/menus" className="underline">Menus</Link>
          <Link href="/dashboard/meal-plans" className="underline">Meal plans</Link>
          <Link href="/dashboard/catering-quotes" className="underline">Catering quotes</Link>
        </CardContent>
      </Card>
    </div>
  );
}
