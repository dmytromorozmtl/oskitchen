import { createTemplateFormAction } from "@/actions/meal-plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { BUILT_IN_MEAL_PLAN_TEMPLATES } from "@/lib/meal-plans/meal-plan-templates";
import { prisma } from "@/lib/prisma";

export default async function MealPlanTemplatesPage() {
  const { userId } = await getTenantActor();
  const templates = await prisma.mealPlanTemplate.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const usedKeys = new Set(templates.map((t) => t.builtInKey).filter(Boolean));
  const available = BUILT_IN_MEAL_PLAN_TEMPLATES.filter((b) => !usedKeys.has(b.key));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Templates</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Pre-set plan defaults to speed up new customer onboarding. Use a built-in template or save your own.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your templates</CardTitle>
          <CardDescription>{templates.length} saved</CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No templates yet. Add one from the starter pack below.</p>
          ) : (
            <ul className="space-y-2">
              {templates.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 p-3">
                  <div>
                    <strong>{t.name}</strong>
                    {t.builtInKey ? <Badge variant="secondary" className="ml-2 rounded-full">built-in</Badge> : null}
                    <p className="text-xs text-muted-foreground">
                      {t.type} · {t.frequency} · {t.mealsPerCycle} meals/cycle · {t.fulfillmentDefault}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Starter pack</CardTitle>
          <CardDescription>One-click add a built-in template.</CardDescription>
        </CardHeader>
        <CardContent>
          {available.length === 0 ? (
            <p className="text-sm text-muted-foreground">All starter templates are added.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {available.map((b) => (
                <li key={b.key} className="rounded-md border border-border/60 p-3">
                  <strong>{b.name}</strong>
                  <p className="text-xs text-muted-foreground">{b.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {b.frequency} · {b.mealsPerCycle} meals/cycle · {b.fulfillmentDefault}
                  </p>
                  <form action={createTemplateFormAction} className="mt-2">
                    <input type="hidden" name="name" value={b.name} />
                    <input type="hidden" name="description" value={b.description} />
                    <input type="hidden" name="builtInKey" value={b.key} />
                    <Button type="submit" size="sm">Add template</Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom template</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTemplateFormAction} className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required maxLength={255} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} maxLength={4000} />
            </div>
            <Button type="submit" className="md:col-span-2 rounded-full">Save template</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
