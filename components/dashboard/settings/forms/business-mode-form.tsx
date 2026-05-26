"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { BusinessType } from "@prisma/client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { applyBusinessModePreset } from "@/actions/settings-center";
import { cn } from "@/lib/utils";
import { BUSINESS_MODE_PRESETS } from "@/lib/settings/business-mode-presets";

export function BusinessModeForm({ current }: { current: BusinessType | null }) {
  const [selected, setSelected] = useState<BusinessType | null>(current);
  const [pending, startTransition] = useTransition();

  function apply(type: BusinessType) {
    setSelected(type);
    startTransition(async () => {
      const res = await applyBusinessModePreset({ type });
      if (res.ok) {
        toast.success(`Business mode applied: ${type}`);
      } else {
        toast.error(`Could not apply: ${res.error}`);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Business mode</CardTitle>
        <CardDescription>
          Changing mode adjusts recommended modules, terminology, and operational defaults. Existing
          data is preserved — only suggestions and defaults change.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BUSINESS_MODE_PRESETS.map((p) => {
            const active = selected === p.type;
            return (
              <button
                type="button"
                key={p.type}
                onClick={() => apply(p.type)}
                disabled={pending}
                className={cn(
                  "flex h-full flex-col items-start gap-1 rounded-xl border p-3 text-left text-sm transition",
                  active
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border/70 bg-background/80 hover:border-primary/40 hover:bg-primary/5",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-semibold">{p.label}</span>
                  {active && <Badge variant="secondary" className="text-[10px]">Current</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{p.tagline}</p>
                <p className="mt-1 text-[11px] text-muted-foreground/80">
                  Terms: {p.recommendedTerminology.orders} · {p.recommendedTerminology.menu} · {p.recommendedTerminology.production}
                </p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
