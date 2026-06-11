import { savePriceScenarioAction } from "@/actions/costing";
import { PlanGate } from "@/components/plans/plan-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function CostingScenariosPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const scenarios = await prisma.priceScenario.findMany({
    where: { userId: dataUserId },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <PlanGate userId={dataUserId} feature="costing" title="Pricing scenarios">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pricing scenarios</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Save what-if inputs for later; full interactive margin replay will use your latest costing baselines. This
            build stores scenario JSON for audit trail.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Record a scenario</CardTitle>
            <CardDescription>Deltas are percent change on modeled ingredient, labor, or packaging cost.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={savePriceScenarioAction} className="grid max-w-lg gap-3">
              <div className="space-y-1">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="Chicken +15% cost" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="salePrice">Modeled sale price</Label>
                <Input id="salePrice" name="salePrice" type="number" step="0.01" defaultValue="12" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="ingredientCostDeltaPercent">Ingredient Δ %</Label>
                  <Input id="ingredientCostDeltaPercent" name="ingredientCostDeltaPercent" type="number" defaultValue="0" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="laborCostDeltaPercent">Labor Δ %</Label>
                  <Input id="laborCostDeltaPercent" name="laborCostDeltaPercent" type="number" defaultValue="0" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="packagingCostDeltaPercent">Packaging Δ %</Label>
                  <Input id="packagingCostDeltaPercent" name="packagingCostDeltaPercent" type="number" defaultValue="0" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="discountPercent">Discount %</Label>
                  <Input id="discountPercent" name="discountPercent" type="number" defaultValue="0" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="targetMarginPercent">Target margin % (optional)</Label>
                  <Input id="targetMarginPercent" name="targetMarginPercent" type="number" placeholder="65" />
                </div>
              </div>
              <Button type="submit" className="w-fit rounded-full">
                Save scenario
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {scenarios.map((s) => (
                <li key={s.id} className="py-2">
                  <span className="font-medium">{s.title}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(s.createdAt)}
                  </span>
                </li>
              ))}
              {scenarios.length === 0 ? (
                <li className="py-6 text-muted-foreground">No scenarios saved yet.</li>
              ) : null}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Evaluate saved scenarios against a baseline in the costing engine — see docs/PRICING_SCENARIOS.md in the
              repository.
            </p>
          </CardContent>
        </Card>
      </div>
    </PlanGate>
  );
}
