"use client";

import { useState, useTransition } from "react";

import { adminAssignPlanAction } from "@/actions/billing";
import { Button } from "@/components/ui/button";

const PLANS = [
  ["", "(no change)"],
  ["STARTER", "Starter"],
  ["PRO", "Pro"],
  ["TEAM", "Team"],
  ["ENTERPRISE", "Enterprise"],
] as const;

const MODES = [
  ["", "(no change)"],
  ["STRIPE", "Stripe"],
  ["MANUAL", "Manual"],
  ["INTERNAL_FREE", "Internal / free"],
  ["ENTERPRISE_CONTRACT", "Enterprise contract"],
  ["DEV_DISABLED", "Dev disabled"],
] as const;

const STATUS = [
  ["", "(no change)"],
  ["ACTIVE", "Active"],
  ["TRIALING", "Trialing"],
  ["INTERNAL", "Internal"],
  ["CANCELLED", "Cancelled"],
  ["PAUSED", "Paused"],
] as const;

export function AdminAssignPlanForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="grid gap-2 md:grid-cols-3"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await adminAssignPlanAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not update.");
          }
        })
      }
    >
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Plan</span>
        <select name="plan" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {PLANS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Billing mode</span>
        <select name="billingMode" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {MODES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Status</span>
        <select name="statusDetail" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <div className="md:col-span-3 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving…" : "Apply"}
        </Button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}
