"use client";

import { useActionState, useEffect, useState } from "react";

import { publishStorefrontThemeFormAction } from "@/actions/storefront-theme-publish";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PreflightResponse = {
  blocked: boolean;
  failures: { code: string; headline: string; detail: string }[];
};

export function StorefrontThemePublishForm({
  checklistBlocked = false,
  canPublish = true,
}: {
  checklistBlocked?: boolean;
  canPublish?: boolean;
}) {
  const [state, formAction, pending] = useActionState(publishStorefrontThemeFormAction, null);
  const [preflight, setPreflight] = useState<PreflightResponse | null>(null);

  useEffect(() => {
    void fetch("/api/dashboard/experiment-publish-preflight")
      .then((r) => r.json())
      .then((j) => setPreflight(j as PreflightResponse))
      .catch(() => setPreflight(null));
  }, [state]);

  const experimentBlocked = preflight?.blocked === true && (preflight.failures.length ?? 0) > 0;
  const publishBlocked = checklistBlocked || experimentBlocked || !canPublish;

  return (
    <form action={formAction} className="space-y-3">
      {!canPublish ? (
        <div className="rounded-xl border border-border/80 bg-muted/40 p-3 text-sm text-muted-foreground" role="status">
          <p className="font-medium text-foreground">Publish not permitted</p>
          <p className="mt-1 text-xs">
            Your role cannot publish storefront theme changes. Ask an owner or manager to publish, or request the{" "}
            <span className="font-mono">storefront.publish</span> permission.
          </p>
        </div>
      ) : null}
      {checklistBlocked ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          <p className="font-medium">Publish blocked by launch checklist</p>
          <p className="mt-1 text-xs">Fix navigation, theme snapshot, and section validation on the Launch tab.</p>
        </div>
      ) : null}
      {experimentBlocked ? (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/40"
          role="alert"
        >
          <p className="font-medium text-amber-900 dark:text-amber-100">Publish blocked by experiment gates</p>
          <ul className="mt-1 list-inside list-disc text-amber-800 dark:text-amber-200">
            {preflight!.failures.slice(0, 4).map((f) => (
              <li key={f.code}>
                {f.headline}
                {f.detail ? ` — ${f.detail}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="themePublishAt">Schedule publish (optional)</Label>
        <Input
          id="themePublishAt"
          name="themePublishAt"
          type="datetime-local"
          className="rounded-xl text-sm"
          disabled={pending || publishBlocked}
        />
        <p className="text-xs text-muted-foreground">
          Future date schedules via cron; leave empty to publish immediately after confirmation.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPublish">Confirm publish</Label>
        <Input
          id="confirmPublish"
          name="confirmPublish"
          placeholder="Type PUBLISH to confirm"
          autoComplete="off"
          className="rounded-xl font-mono text-sm"
          disabled={pending || publishBlocked}
        />
        <p className="text-xs text-muted-foreground">
          Copies navigation, footer, and palette tokens into the published snapshot used by the live storefront and checkout
          (checkout never reads draft tokens).
        </p>
      </div>
      <Button type="submit" className="rounded-full" disabled={pending || publishBlocked}>
        {pending ? "Publishing…" : publishBlocked ? "Publish disabled (gates)" : "Publish live snapshot"}
      </Button>
    </form>
  );
}
