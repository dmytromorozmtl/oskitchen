import { createMarginRuleAction, saveCostingSettingsAction } from "@/actions/costing";
import { PlanGate } from "@/components/plans/plan-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { mergeCostingSettings } from "@/lib/costing/costing-settings";
import { ALL_BUSINESS_TYPES_ORDERED, BUSINESS_TYPE_LABELS } from "@/lib/business-modes";
import { prisma } from "@/lib/prisma";

export default async function CostingSettingsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const kitchen = await prisma.kitchenSettings.findUnique({ where: { userId: dataUserId } });
  const s = mergeCostingSettings(kitchen?.costingSettingsJson ?? null);
  const marginRules = await prisma.marginRule.findMany({
    where: { userId: dataUserId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <PlanGate userId={dataUserId} feature="costing" title="Costing settings">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Costing settings</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Defaults apply when no labor row or margin rule matches. All modeled output remains an operational estimate.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kitchen defaults</CardTitle>
            <CardDescription>Stored in kitchen settings JSON — safe to tune per workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveCostingSettingsAction} className="grid max-w-xl gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="defaultLaborRatePerMinute">Labor $/minute (no rate table)</Label>
                  <Input
                    id="defaultLaborRatePerMinute"
                    name="defaultLaborRatePerMinute"
                    type="number"
                    step="0.001"
                    defaultValue={s.defaultLaborRatePerMinute}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="defaultPaymentProcessingPercent">Card fee (fraction, e.g. 0.029)</Label>
                  <Input
                    id="defaultPaymentProcessingPercent"
                    name="defaultPaymentProcessingPercent"
                    type="number"
                    step="0.0001"
                    defaultValue={s.defaultPaymentProcessingPercent}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="targetMarginPercent">Target gross margin %</Label>
                  <Input
                    id="targetMarginPercent"
                    name="targetMarginPercent"
                    type="number"
                    step="0.1"
                    defaultValue={s.targetMarginPercent}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="warningMarginPercent">Warning margin %</Label>
                  <Input
                    id="warningMarginPercent"
                    name="warningMarginPercent"
                    type="number"
                    step="0.1"
                    defaultValue={s.warningMarginPercent}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="foodCostTargetPercent">Food cost target %</Label>
                  <Input
                    id="foodCostTargetPercent"
                    name="foodCostTargetPercent"
                    type="number"
                    step="0.1"
                    defaultValue={s.foodCostTargetPercent ?? ""}
                    placeholder="e.g. 32"
                  />
                </div>
                <div className="flex items-end gap-2 pb-2">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" name="foodCostTargetClear" />
                    Clear food target
                  </label>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="overheadPercentOfPrimeCost">Overhead % of prime cost</Label>
                  <Input
                    id="overheadPercentOfPrimeCost"
                    name="overheadPercentOfPrimeCost"
                    type="number"
                    step="0.001"
                    defaultValue={s.overheadPercentOfPrimeCost}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="enableOverheadInTotalCost">Include overhead</Label>
                  <select
                    id="enableOverheadInTotalCost"
                    name="enableOverheadInTotalCost"
                    defaultValue={s.enableOverheadInTotalCost ? "true" : "false"}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="defaultChannelProvider">Default channel key</Label>
                  <Input
                    id="defaultChannelProvider"
                    name="defaultChannelProvider"
                    defaultValue={s.defaultChannelProvider}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="roundingStyle">Rounding</Label>
                  <select
                    id="roundingStyle"
                    name="roundingStyle"
                    defaultValue={s.roundingStyle}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="NONE">None</option>
                    <option value="NEAREST_NICKEL">Nearest nickel</option>
                    <option value="PSYCHOLOGICAL_99">Psychological .99</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="minimumSuggestedPrice">Minimum suggested price</Label>
                <Input
                  id="minimumSuggestedPrice"
                  name="minimumSuggestedPrice"
                  type="number"
                  step="0.01"
                  defaultValue={s.minimumSuggestedPrice}
                />
              </div>
              <Button type="submit" className="w-fit rounded-full">
                Save settings
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Margin rules (optional)</CardTitle>
            <CardDescription>More specific rules override kitchen defaults when they match business mode.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={createMarginRuleAction} className="grid max-w-lg gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="businessMode">Business mode (optional)</Label>
                <select
                  id="businessMode"
                  name="businessMode"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  defaultValue=""
                >
                  <option value="">Any</option>
                  {ALL_BUSINESS_TYPES_ORDERED.map((t) => (
                    <option key={t} value={t}>
                      {BUSINESS_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="mTarget">Target margin %</Label>
                <Input id="mTarget" name="targetMarginPercent" type="number" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="mWarn">Warning margin %</Label>
                <Input id="mWarn" name="warningMarginPercent" type="number" required />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" variant="secondary" className="rounded-full">
                  Add margin rule
                </Button>
              </div>
            </form>

            <ul className="divide-y text-sm">
              {marginRules.map((r) => (
                <li key={r.id} className="py-2">
                  Target {Number(r.targetMarginPercent)}% · warn {Number(r.warningMarginPercent)}%
                  {r.businessMode ? ` · ${BUSINESS_TYPE_LABELS[r.businessMode]}` : " · any mode"}
                  {r.active ? "" : " (inactive)"}
                </li>
              ))}
              {marginRules.length === 0 ? <li className="py-4 text-muted-foreground">No extra rules.</li> : null}
            </ul>
          </CardContent>
        </Card>
      </div>
    </PlanGate>
  );
}
