"use client";

import { useState, useTransition } from "react";

import { clearEntitlementOverrideAction, setEntitlementOverrideAction } from "@/actions/billing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FEATURE_FLAGS, FEATURE_LABEL } from "@/lib/billing/entitlements";

export function SetEntitlementOverrideForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="grid gap-2 md:grid-cols-4"
      action={(formData) =>
        startTransition(async () => {
          setError(null);
          try {
            await setEntitlementOverrideAction(formData);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not save override.");
          }
        })
      }
    >
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Feature</span>
        <select name="featureKey" required className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          {FEATURE_FLAGS.map((f) => <option key={f} value={f}>{FEATURE_LABEL[f]}</option>)}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Value</span>
        <select name="value" defaultValue="true" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
          <option value="true">Enable</option>
          <option value="false">Disable</option>
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Reason</span>
        <Input name="reason" placeholder="Sales exception, beta access…" />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Expires (optional)</span>
        <Input name="expiresAt" type="date" />
      </label>
      <div className="md:col-span-4 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving…" : "Apply override"}
        </Button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}

export function ClearOverrideButton({ featureKey }: { featureKey: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          try { await clearEntitlementOverrideAction(formData); } catch { /* noop */ }
        })
      }
    >
      <input type="hidden" name="featureKey" value={featureKey} />
      <Button type="submit" size="sm" variant="outline" disabled={isPending}>Clear</Button>
    </form>
  );
}
