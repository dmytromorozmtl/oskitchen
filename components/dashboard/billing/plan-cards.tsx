import Link from "next/link";

import { CheckoutButton } from "@/components/dashboard/billing/checkout-buttons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PLAN_KEYS,
  planDef,
  type PlanKey,
} from "@/lib/billing/plan-registry";

function formatPrice(amount: number | null): string {
  if (amount === null) return "Custom";
  return `$${amount}/mo`;
}

function limitOrUnlimited(n: number | null): string {
  return n === null ? "Unlimited" : n.toLocaleString();
}

export function PlanCards({
  currentPlan,
  checkoutDisabled,
  reason,
}: {
  currentPlan: PlanKey;
  checkoutDisabled: boolean;
  reason?: string | null;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {PLAN_KEYS.map((key) => {
        const plan = planDef(key);
        const isCurrent = key === currentPlan;
        return (
          <Card key={key} className={plan.highlight ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {isCurrent ? <Badge>Current</Badge> : null}
              </div>
              <CardDescription>{plan.tagline}</CardDescription>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
                {formatPrice(plan.priceMonthlyUsd)}
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>Orders/mo: {limitOrUnlimited(plan.limits.maxOrdersPerMonth)}</li>
                <li>Menus: {limitOrUnlimited(plan.limits.maxMenus)}</li>
                <li>Integrations: {limitOrUnlimited(plan.limits.maxIntegrations)}</li>
                <li>Staff: {limitOrUnlimited(plan.limits.maxStaff)}</li>
                <li>Locations: {limitOrUnlimited(plan.limits.maxLocations)}</li>
                <li>Support: {plan.supportLevel}</li>
              </ul>
              {plan.checkoutable ? (
                isCurrent ? (
                  <p className="text-xs text-muted-foreground">You are on this plan.</p>
                ) : (
                  <CheckoutButton
                    plan={key as Exclude<PlanKey, "ENTERPRISE">}
                    disabled={checkoutDisabled}
                    label={`Choose ${plan.name}`}
                  />
                )
              ) : (
                <Link
                  href={`mailto:sales@kitchenos.example?subject=Enterprise%20${plan.name}`}
                  className="inline-flex items-center text-sm font-medium underline"
                >
                  Contact sales
                </Link>
              )}
              {checkoutDisabled && plan.checkoutable && !isCurrent ? (
                <p className="text-xs text-muted-foreground">
                  {reason ?? "Checkout disabled until Stripe is configured."}
                </p>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
