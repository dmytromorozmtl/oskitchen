import Link from "next/link";

import { submitCancellationFeedbackFormAction } from "@/actions/monetization";
import { BillingPanelLinkPortal } from "@/components/billing/billing-cancel-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { requireBillingPageAccess } from "@/lib/billing/billing-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { isStripeConfigured } from "@/lib/env";
import { planDef, PLAN_KEYS, type PlanKey } from "@/lib/billing/plan-registry";
import { downgradeBlockers } from "@/services/billing/entitlement-service";
import { recomputeUsage } from "@/services/billing/usage-service";
import { loadSubscription } from "@/services/billing/subscription-service";

export default async function BillingCancelPage() {
  const access = await requireBillingPageAccess("billing.cancel");
  if (!access.ok) {
    return access.deny;
  }

  const { dataUserId } = await getTenantActor();

  const [sub, counts] = await Promise.all([
    loadSubscription(dataUserId),
    recomputeUsage(dataUserId),
  ]);
  const currentPlan = sub.plan;
  const target: PlanKey | null =
    currentPlan === "ENTERPRISE" ? "TEAM" :
    currentPlan === "TEAM" ? "PRO" :
    currentPlan === "PRO" ? "STARTER" : null;

  const downgradeRows = target ? downgradeBlockers(target, counts) : [];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cancel or downgrade</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage cancellation in the Stripe customer portal when configured.           To downgrade, first
          confirm usage fits the smaller plan&apos;s limits.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current snapshot</CardTitle>
          <CardDescription>
            Plan <strong>{planDef(currentPlan).name}</strong> · Status {sub.statusDetail}
            {sub.cancelAtPeriodEnd ? " · cancellation scheduled" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Before you cancel</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Downgrade instead of cancelling to keep order history.</li>
              <li>Pause heavy integrations from the Sales Channels page.</li>
              <li>Talk to support — link below.</li>
            </ul>
          </div>

          {target ? (
            <div>
              <p className="text-sm font-medium">Downgrade to {planDef(target).name}</p>
              <ul className="mt-2 space-y-1 text-xs">
                {downgradeRows.map((row) => (
                  <li key={row.metric} className="flex items-center justify-between rounded border px-2 py-1">
                    <span className="capitalize">{row.metric.replaceAll("_", " ")}</span>
                    <span className={row.blocked ? "text-rose-700" : "text-muted-foreground"}>
                      {row.used}{row.targetLimit !== null ? ` / ${row.targetLimit}` : ""} {row.blocked ? "· blocker" : ""}
                    </span>
                  </li>
                ))}
              </ul>
              {downgradeRows.some((r) => r.blocked) ? (
                <p className="mt-2 text-xs text-rose-700">
                  Reduce blocked items before downgrading, or open the Stripe portal to schedule the change.
                </p>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  No usage blockers — Stripe portal will let you switch immediately.
                </p>
              )}
            </div>
          ) : null}

          <form action={submitCancellationFeedbackFormAction} className="space-y-3 rounded-xl border p-4">
            <p className="text-sm font-medium">Optional cancellation feedback</p>
            <div className="space-y-2">
              <Label htmlFor="reason">Primary reason</Label>
              <select
                id="reason"
                name="reason"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                <option value="too_expensive">Too expensive</option>
                <option value="missing_feature">Missing feature</option>
                <option value="too_complex">Too complex</option>
                <option value="switched_tools">Switched tools</option>
                <option value="low_volume">Not enough orders</option>
                <option value="technical">Technical issues</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Details (optional)</Label>
              <textarea
                id="details"
                name="details"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit" size="sm" variant="secondary">
              Save feedback
            </Button>
          </form>

          <div className="text-xs text-muted-foreground">
            <p className="mb-1 font-medium">Available {PLAN_KEYS.length} plans:</p>
            {PLAN_KEYS.map((k) => (
              <span key={k} className="mr-2">
                {planDef(k).name}{planDef(k).priceMonthlyUsd ? ` ($${planDef(k).priceMonthlyUsd}/mo)` : " (Custom)"}{k === currentPlan ? " · current" : ""}
              </span>
            ))}
          </div>

          <BillingPanelLinkPortal stripeConfigured={isStripeConfigured()} />

          <Button asChild variant="ghost">
            <Link href="/dashboard/billing">← Back to billing</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
