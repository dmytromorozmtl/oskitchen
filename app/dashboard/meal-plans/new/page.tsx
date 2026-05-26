import Link from "next/link";

import { createMealPlanFormAction } from "@/actions/meal-plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { brandListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import {
  MEAL_PLAN_BILLING_LABEL,
  MEAL_PLAN_BILLING_VALUES,
  MEAL_PLAN_FREQUENCY_LABEL,
  MEAL_PLAN_FREQUENCY_VALUES,
  MEAL_PLAN_FULFILLMENT_LABEL,
  MEAL_PLAN_FULFILLMENT_VALUES,
  MEAL_PLAN_GENERATION_LABEL,
  MEAL_PLAN_GENERATION_VALUES,
  MEAL_PLAN_TYPE_LABEL,
  MEAL_PLAN_TYPE_VALUES,
  isMealPlanGenerationModeAllowed,
} from "@/lib/meal-plans/meal-plan-types";

function todayIso(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default async function NewMealPlanPage() {
  const { userId } = await getTenantActor();
  const brandWhere = await brandListWhereForOwner(userId);
  const [brands, locations] = await Promise.all([
    prisma.brand.findMany({
      where: brandWhere,
      orderBy: { name: "asc" },
      select: { id: true, name: true },
      take: 100,
    }).catch(() => []),
    prisma.location.findMany({
      where: { userId, status: { not: "ARCHIVED" } },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">New meal plan</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Set up a recurring meal customer in one form. KitchenOS materialises the first cycle for you —
            you can edit selections and generate the draft order from the plan detail page.
          </p>
        </div>
        <Button asChild variant="ghost">
          <Link href="/dashboard/meal-plans">Cancel</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer</CardTitle>
          <CardDescription>Email is required — KitchenOS upserts the customer in the CRM.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createMealPlanFormAction} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer email *</Label>
              <Input id="customerEmail" name="customerEmail" type="email" required maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer name</Label>
              <Input id="customerName" name="customerName" maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone</Label>
              <Input id="customerPhone" name="customerPhone" maxLength={64} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company</Label>
              <Input id="companyName" name="companyName" maxLength={255} placeholder="For corporate plans" />
            </div>

            <div className="space-y-2 md:col-span-2 border-t border-border/60 pt-4">
              <h3 className="text-sm font-semibold">Plan details</h3>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Plan name *</Label>
              <Input id="name" name="name" required maxLength={255} placeholder="Family Dinner Bundle" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                defaultValue="INDIVIDUAL"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {MEAL_PLAN_TYPE_VALUES.map((v) => (
                  <option key={v} value={v}>{MEAL_PLAN_TYPE_LABEL[v]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <select
                id="frequency"
                name="frequency"
                defaultValue="WEEKLY"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {MEAL_PLAN_FREQUENCY_VALUES.map((v) => (
                  <option key={v} value={v}>{MEAL_PLAN_FREQUENCY_LABEL[v]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mealsPerCycle">Meals per cycle</Label>
              <Input id="mealsPerCycle" name="mealsPerCycle" type="number" min={1} max={99} defaultValue={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servingsPerMeal">Servings per meal</Label>
              <Input id="servingsPerMeal" name="servingsPerMeal" type="number" min={1} max={99} defaultValue={1} />
            </div>

            <div className="space-y-2 md:col-span-2 border-t border-border/60 pt-4">
              <h3 className="text-sm font-semibold">Schedule &amp; fulfillment</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date *</Label>
              <Input id="startDate" name="startDate" type="date" defaultValue={todayIso()} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" name="endDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fulfillmentMode">Fulfillment</Label>
              <select
                id="fulfillmentMode"
                name="fulfillmentMode"
                defaultValue="PICKUP"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {MEAL_PLAN_FULFILLMENT_VALUES.map((v) => (
                  <option key={v} value={v}>{MEAL_PLAN_FULFILLMENT_LABEL[v]}</option>
                ))}
              </select>
            </div>
            {brands.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="brandId">Brand</Label>
                <select id="brandId" name="brandId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">— optional —</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            ) : null}
            {locations.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="locationId">Location</Label>
                <select id="locationId" name="locationId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">— optional —</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="space-y-2 md:col-span-2 border-t border-border/60 pt-4">
              <h3 className="text-sm font-semibold">Preferences</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Input id="allergies" name="allergies" placeholder="peanuts, shellfish" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dietary">Dietary</Label>
              <Input id="dietary" name="dietary" placeholder="vegetarian, halal" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="favorites">Favorite items</Label>
              <Input id="favorites" name="favorites" placeholder="house salad, chicken bowl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dislikes">Disliked items</Label>
              <Input id="dislikes" name="dislikes" placeholder="cilantro, olives" />
            </div>

            <div className="space-y-2 md:col-span-2 border-t border-border/60 pt-4">
              <h3 className="text-sm font-semibold">Billing &amp; generation</h3>
              <p className="text-xs text-muted-foreground">
                KitchenOS does not auto-charge customers and does not auto-confirm orders.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingMode">Billing mode</Label>
              <select id="billingMode" name="billingMode" defaultValue="PAY_LATER" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {MEAL_PLAN_BILLING_VALUES.map((v) => (
                  <option key={v} value={v}>{MEAL_PLAN_BILLING_LABEL[v]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePerCycle">Price per cycle</Label>
              <Input id="pricePerCycle" name="pricePerCycle" type="number" min={0} step={0.01} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="generationMode">Generation mode</Label>
              <select id="generationMode" name="generationMode" defaultValue="PREVIEW_BEFORE_CREATE" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {MEAL_PLAN_GENERATION_VALUES.filter(isMealPlanGenerationModeAllowed).map((v) => (
                  <option key={v} value={v}>{MEAL_PLAN_GENERATION_LABEL[v]}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={3} maxLength={4000} placeholder="Anything the kitchen needs to know" />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" className="rounded-full">Create meal plan</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
