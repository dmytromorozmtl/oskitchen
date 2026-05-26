import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";

export default async function MealPlanSettingsPage() {
  const { userId } = await getTenantActor();
  const [planCount, templateCount, legacyCount] = await Promise.all([
    prisma.mealPlan.count({ where: { userId } }),
    prisma.mealPlanTemplate.count({ where: { userId } }),
    prisma.customerSubscription.count({ where: { userId } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Module-level information and safety rules.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><strong>Plans:</strong> {planCount}</p>
          <p><strong>Templates:</strong> {templateCount}</p>
          <p><strong>Legacy subscriptions:</strong> {legacyCount}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order generation rules</CardTitle>
          <CardDescription>How KitchenOS turns meal plan cycles into orders.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Preview before create</strong> is the default. Operators must review allergy warnings and
            missing selections before a draft order is created.
          </p>
          <p>
            Draft orders are always created with status <strong>PENDING</strong>. KitchenOS never auto-confirms
            or auto-charges a subscriber.
          </p>
          <p>
            Once a cycle generates an order it cannot generate a second one — the cycle row keeps the
            <code className="mx-1">orderId</code> reference.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing</CardTitle>
          <CardDescription>Why we don&apos;t auto-charge.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Billing modes are placeholders for operator-driven invoicing today. Stripe / payment provider
            integration ships later — until then, choose <strong>Pay later</strong>, <strong>Manual invoice</strong>, or
            <strong>Free trial</strong> to reflect reality.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Legacy / migration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            The legacy <code>/dashboard/meal-subscriptions</code> page is preserved as-is for backwards
            compatibility. Every subscription created from that page is mirrored into the new Meal Plans center
            automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
