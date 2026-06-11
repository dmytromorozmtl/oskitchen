import Link from "next/link";
import { notFound } from "next/navigation";

import {
  createSelectionFormAction,
  generateCycleDraftFormAction,
  materializeCyclesFormAction,
  removeSelectionFormAction,
  setMealPlanStatusFormAction,
  skipCycleFormAction,
  updateMealPlanFormAction,
} from "@/actions/meal-plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
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
import {
  MEAL_PLAN_CYCLE_STATUS_BADGE,
  MEAL_PLAN_CYCLE_STATUS_LABEL,
  MEAL_PLAN_STATUS_BADGE,
  MEAL_PLAN_STATUS_LABEL,
} from "@/lib/meal-plans/meal-plan-status";
import { parseAllergies, parseDietaryPreferences } from "@/lib/crm/customer-privacy";
import { productListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { getMealPlanForUser } from "@/services/meal-plans/meal-plan-service";

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default async function MealPlanDetailPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { userId } = await getTenantActor();
  const { planId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(planId)) notFound();
  const plan = await getMealPlanForUser({ userId }, planId);
  if (!plan) notFound();

  const products = await prisma.product.findMany({
    where: await productListWhereForOwnerAnd(userId, { active: true }),
    orderBy: { title: "asc" },
    take: 200,
    select: { id: true, title: true, price: true },
  });

  const allergies = parseAllergies(plan.allergiesJson);
  const dietary = parseDietaryPreferences(plan.dietaryPreferencesJson);

  const generatedCount = plan.cycles.filter((c) => c.status === "GENERATED").length;
  const openCount = plan.cycles.filter((c) => c.status !== "GENERATED" && c.status !== "SKIPPED" && c.status !== "CANCELLED").length;
  const totalSpendCents = plan.cycles.reduce((acc, c) => acc + (c.order ? Math.round(Number(c.order.total) * 100) : 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/dashboard/meal-plans" className="text-sm text-muted-foreground hover:underline">
            ← all meal plans
          </Link>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{plan.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {MEAL_PLAN_TYPE_LABEL[plan.type]} · {plan.frequency} · {plan.mealsPerCycle} meals/cycle · {plan.fulfillmentMode}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={MEAL_PLAN_STATUS_BADGE[plan.status]} className="rounded-full">
            {MEAL_PLAN_STATUS_LABEL[plan.status]}
          </Badge>
          {plan.brand ? <Badge variant="outline" className="rounded-full">{plan.brand.name}</Badge> : null}
          {plan.location ? <Badge variant="outline" className="rounded-full">{plan.location.name}</Badge> : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Cycles total" value={plan.cycles.length} />
        <Kpi label="Cycles generated" value={generatedCount} />
        <Kpi label="Cycles open" value={openCount} />
        <Kpi label="Order spend so far" value={formatCurrency(totalSpendCents / 100)} />
        <Kpi label="Next order" value={plan.nextOrderDate?.toLocaleDateString() ?? "—"} />
        <Kpi label="Start date" value={plan.startDate.toLocaleDateString()} />
        <Kpi label="End date" value={plan.endDate?.toLocaleDateString() ?? "—"} />
        <Kpi label="Allergies" value={allergies.length} />
      </div>

      {/* Customer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer</CardTitle>
          <CardDescription>Full CRM profile is one click away.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <Link href={`/dashboard/customers/${plan.customer.id}`} className="font-medium hover:underline">
            {plan.customer.displayName ?? plan.customer.name ?? plan.customer.email}
          </Link>
          <p className="text-xs text-muted-foreground">
            {plan.customer.email}
            {plan.customer.phone ? ` · ${plan.customer.phone}` : ""}
            {plan.customer.companyName ? ` · ${plan.customer.companyName}` : ""}
          </p>
          {(allergies.length > 0 || dietary.length > 0) ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {allergies.map((a) => (
                <Badge key={a} variant="destructive" className="rounded-full">{a}</Badge>
              ))}
              {dietary.map((d) => (
                <Badge key={d} variant="secondary" className="rounded-full">{d}</Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Plan editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plan details</CardTitle>
          <CardDescription>
            Generation mode controls how cycles turn into orders. OS Kitchen never auto-confirms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateMealPlanFormAction} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="planId" value={plan.id} />
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={plan.name} maxLength={255} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select id="type" name="type" defaultValue={plan.type} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {MEAL_PLAN_TYPE_VALUES.map((v) => (<option key={v} value={v}>{MEAL_PLAN_TYPE_LABEL[v]}</option>))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <select id="frequency" name="frequency" defaultValue={plan.frequency} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {MEAL_PLAN_FREQUENCY_VALUES.map((v) => (<option key={v} value={v}>{MEAL_PLAN_FREQUENCY_LABEL[v]}</option>))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mealsPerCycle">Meals/cycle</Label>
              <Input id="mealsPerCycle" name="mealsPerCycle" type="number" min={1} max={99} defaultValue={plan.mealsPerCycle} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servingsPerMeal">Servings/meal</Label>
              <Input id="servingsPerMeal" name="servingsPerMeal" type="number" min={1} max={99} defaultValue={plan.servingsPerMeal} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fulfillmentMode">Fulfillment</Label>
              <select id="fulfillmentMode" name="fulfillmentMode" defaultValue={plan.fulfillmentMode} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {MEAL_PLAN_FULFILLMENT_VALUES.map((v) => (<option key={v} value={v}>{MEAL_PLAN_FULFILLMENT_LABEL[v]}</option>))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" name="endDate" type="date" defaultValue={plan.endDate ? plan.endDate.toISOString().slice(0, 10) : ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingMode">Billing mode</Label>
              <select id="billingMode" name="billingMode" defaultValue={plan.billingMode} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {MEAL_PLAN_BILLING_VALUES.map((v) => (<option key={v} value={v}>{MEAL_PLAN_BILLING_LABEL[v]}</option>))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePerCycle">Price/cycle</Label>
              <Input id="pricePerCycle" name="pricePerCycle" type="number" min={0} step={0.01} defaultValue={plan.pricePerCycle?.toString() ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="generationMode">Generation</Label>
              <select id="generationMode" name="generationMode" defaultValue={plan.generationMode} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {MEAL_PLAN_GENERATION_VALUES.filter(isMealPlanGenerationModeAllowed).map((v) => (
                  <option key={v} value={v}>{MEAL_PLAN_GENERATION_LABEL[v]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Plan notes</Label>
              <Textarea id="notes" name="notes" defaultValue={plan.notes ?? ""} rows={3} maxLength={4000} />
            </div>
            <Button type="submit" className="md:col-span-2 rounded-full">Save plan</Button>
          </form>
        </CardContent>
      </Card>

      {/* Cycles + selections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base">Cycles &amp; selections</CardTitle>
              <CardDescription>
                Add at least one selection (with a linked product) before generating the draft order.
              </CardDescription>
            </div>
            <form action={materializeCyclesFormAction}>
              <input type="hidden" name="planId" value={plan.id} />
              <Button type="submit" size="sm" variant="ghost">Materialize next 4 cycles</Button>
            </form>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan.cycles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cycles yet.</p>
          ) : null}
          {plan.cycles.map((cycle) => (
            <div key={cycle.id} className="rounded-md border border-border/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <strong>Cycle {cycle.cycleStartDate.toLocaleDateString()} — {cycle.cycleEndDate.toLocaleDateString()}</strong>
                  <p className="text-xs text-muted-foreground">{cycle.selections.length} selection(s) · {cycle.mealsPlanned} meals planned</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={MEAL_PLAN_CYCLE_STATUS_BADGE[cycle.status]} className="rounded-full">
                    {MEAL_PLAN_CYCLE_STATUS_LABEL[cycle.status]}
                  </Badge>
                  {cycle.order ? (
                    <Link href={`/dashboard/orders/${cycle.order.id}`} className="text-xs underline">Open order</Link>
                  ) : (
                    <>
                      <form action={generateCycleDraftFormAction}>
                        <input type="hidden" name="cycleId" value={cycle.id} />
                        <Button type="submit" size="sm" disabled={cycle.selections.length === 0}>Generate draft</Button>
                      </form>
                      <form action={skipCycleFormAction}>
                        <input type="hidden" name="cycleId" value={cycle.id} />
                        <Button type="submit" size="sm" variant="ghost">Skip</Button>
                      </form>
                    </>
                  )}
                </div>
              </div>

              {cycle.selections.length > 0 ? (
                <ul className="mt-3 space-y-1 text-sm">
                  {cycle.selections.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 py-1">
                      <span>
                        {s.product?.title ?? s.itemName ?? "Untitled meal"}{" · "}
                        <span className="text-xs text-muted-foreground">qty {s.quantity}{s.locked ? " · locked" : ""}</span>
                      </span>
                      {cycle.status !== "GENERATED" ? (
                        <form action={removeSelectionFormAction}>
                          <input type="hidden" name="selectionId" value={s.id} />
                          <Button type="submit" size="sm" variant="ghost">Remove</Button>
                        </form>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}

              {cycle.status !== "GENERATED" && cycle.status !== "SKIPPED" && cycle.status !== "CANCELLED" ? (
                <form action={createSelectionFormAction} className="mt-3 grid gap-2 md:grid-cols-[1fr_120px_auto]">
                  <input type="hidden" name="cycleId" value={cycle.id} />
                  <select name="productId" className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                    <option value="">— pick a product —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.title} (${Number(p.price.toString()).toFixed(2)})</option>
                    ))}
                  </select>
                  <Input name="quantity" type="number" min={1} max={99} defaultValue={1} />
                  <Button type="submit" size="sm">Add selection</Button>
                </form>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Status / pause / cancel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
          <CardDescription>Pause until a date, resume, or cancel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <form action={setMealPlanStatusFormAction} className="grid gap-2 md:grid-cols-[auto_auto_1fr_auto]">
            <input type="hidden" name="planId" value={plan.id} />
            <input type="hidden" name="status" value="PAUSED" />
            <Input name="pausedUntil" type="date" placeholder="Until" />
            <Input name="pauseReason" placeholder="Reason (optional)" maxLength={2000} />
            <span />
            <Button type="submit" size="sm" variant="outline">Pause</Button>
          </form>
          <form action={setMealPlanStatusFormAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="planId" value={plan.id} />
            <input type="hidden" name="status" value="ACTIVE" />
            <Button type="submit" size="sm" variant="outline">Resume</Button>
          </form>
          <form action={setMealPlanStatusFormAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="planId" value={plan.id} />
            <input type="hidden" name="status" value="CANCELLED" />
            <Button type="submit" size="sm" variant="destructive">Cancel plan</Button>
          </form>
        </CardContent>
      </Card>

      {/* Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {plan.events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {plan.events.map((e) => (
                <li key={e.id} className="flex justify-between border-b border-border/40 py-1">
                  <span>
                    <Badge variant="outline" className="mr-2 rounded-full">{e.eventType}</Badge>
                    {e.performedBy ?? "—"}
                  </span>
                  <span className="text-xs text-muted-foreground">{e.createdAt.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
