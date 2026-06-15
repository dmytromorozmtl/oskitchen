"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validateCustomCssInBrowser } from "@/lib/storefront/validate-custom-css";

export function ThemeCustomCssForm({
  storefrontId,
  initialCss,
}: {
  storefrontId: string;
  initialCss: string;
}) {
  const [css, setCss] = React.useState(initialCss);
  const [pending, setPending] = React.useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const result = validateCustomCssInBrowser(css);
    if (!result.valid) {
      toast.error(`Invalid CSS: ${result.error ?? "syntax error"}`);
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/storefront/theme/custom-css", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storefrontId, customCss: css }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Could not save CSS");
        return;
      }
      toast.success("Custom CSS saved");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSave(e)} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="customCss">Custom CSS</Label>
        <Textarea
          id="customCss"
          name="customCss"
          rows={12}
          value={css}
          onChange={(e) => setCss(e.target.value)}
          className="rounded-xl font-mono text-sm"
          placeholder="/* Add custom styles for your public storefront */&#10;.kos-storefront-root h1 { letter-spacing: -0.04em; }"
        />
        <p className="text-xs text-muted-foreground">
          Injected on all public pages at <code className="rounded bg-muted px-1">/s/your-slug/custom.css</code>. Avoid
          script tags and @import.
        </p>
      </div>
      <Button type="submit" disabled={pending} className="rounded-full">
        {pending ? "Saving…" : "Save custom CSS"}
      </Button>
    </form>
  );
}
