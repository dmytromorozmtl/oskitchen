import { PlanGate } from "@/components/plans/plan-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { createChannelFeeRuleAction } from "@/actions/costing";

export default async function CostingChannelFeesPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const rules = await prisma.channelFeeRule.findMany({
    where: { userId: dataUserId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <PlanGate userId={dataUserId} feature="costing" title="Channel fees">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Channel fees</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Configure your own fee stacks (Uber Eats, DoorDash, Shopify, storefront, catering, etc.). OS Kitchen never
            impersonates partner pricing — estimates use only what you enter.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add fee rule</CardTitle>
            <CardDescription>Percentage applies to modeled sale price; fixed adds per item in currency.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createChannelFeeRuleAction} className="grid max-w-lg gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="channelProvider">Channel key</Label>
                <Input id="channelProvider" name="channelProvider" placeholder="STOREFRONT, UBER_EATS, …" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="feeType">Fee type</Label>
                <select
                  id="feeType"
                  name="feeType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  defaultValue="PERCENTAGE"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed</option>
                  <option value="MIXED">Mixed</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="percentage">Percent (0–100)</Label>
                <Input id="percentage" name="percentage" type="number" step="0.01" defaultValue="0" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="fixedAmount">Fixed amount ({`$`})</Label>
                <Input id="fixedAmount" name="fixedAmount" type="number" step="0.01" defaultValue="0" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" name="notes" placeholder="Optional" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" className="rounded-full">
                  Save rule
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configured rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {rules.map((r) => (
                <li key={r.id} className="py-2">
                  <span className="font-medium">{r.channelProvider}</span> · {r.feeType} · pct {Number(r.percentage)} ·
                  fixed {Number(r.fixedAmount)}
                  {r.active ? "" : " (inactive)"}
                </li>
              ))}
              {rules.length === 0 ? <li className="py-6 text-muted-foreground">No rules yet.</li> : null}
            </ul>
          </CardContent>
        </Card>
      </div>
    </PlanGate>
  );
}
