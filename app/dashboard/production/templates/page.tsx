import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { defaultProductionModeForBusiness } from "@/lib/production/production-modes";
import { prisma } from "@/lib/prisma";

const TEMPLATE_NAMES = [
  "Restaurant Daily Prep",
  "Café Morning Prep",
  "Bar Prep Checklist",
  "Bakery Batch Day",
  "Catering Event Production",
  "Meal Prep Production Day",
  "Ghost Kitchen Rush",
] as const;

export default async function ProductionTemplatesPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: { kitchenSettings: { select: { businessType: true } } },
  });
  const bt = profile?.kitchenSettings?.businessType ?? null;
  const suggestedMode = defaultProductionModeForBusiness(bt);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Production
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Templates</h1>
          <p className="mt-2 text-muted-foreground">
            Starter workflows for stages, stations, and checklists. Applying a template to a date will ship
            after template persistence is wired to `ProductionTemplate`.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard/production">Back to command center</Link>
        </Button>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Suggested mode for your workspace</CardTitle>
          <CardDescription>
            Derived from kitchen business type. Command-center batches use this as the default when
            generating prep.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            {suggestedMode}
          </Badge>
        </CardContent>
      </Card>

      <ul className="space-y-3">
        {TEMPLATE_NAMES.map((name) => (
          <li key={name}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{name}</CardTitle>
                <CardDescription>Included in roadmap — save/apply flows use production templates API.</CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
