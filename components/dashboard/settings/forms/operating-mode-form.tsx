"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { KitchenOperatingMode } from "@prisma/client";

import { updateKitchenOperatingMode } from "@/actions/operating-mode";
import { OPERATING_MODE_CONFIGS } from "@/lib/operating-modes/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const MODES = ["WEEKLY_PREORDER", "DAILY_SERVICE"] as const satisfies readonly KitchenOperatingMode[];

export function OperatingModeForm({ current }: { current: KitchenOperatingMode }) {
  const [mode, setMode] = useState<KitchenOperatingMode>(current);
  const [pending, startTransition] = useTransition();

  function save(next: KitchenOperatingMode) {
    setMode(next);
    startTransition(async () => {
      const res = await updateKitchenOperatingMode(next);
      if (res.ok) {
        toast.success(`Operating mode: ${OPERATING_MODE_CONFIGS[next].label}`);
      } else {
        toast.error(res.error ?? "Could not save operating mode.");
        setMode(current);
      }
    });
  }

  const config = OPERATING_MODE_CONFIGS[mode];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Operating mode</CardTitle>
        <CardDescription>
          Controls production board layout, POS quick buttons, and whether weekly preorder flows are
          emphasized.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="operatingMode">Mode</Label>
          <Select
            value={mode}
            onValueChange={(v) => save(v as KitchenOperatingMode)}
            disabled={pending}
          >
            <SelectTrigger id="operatingMode" className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODES.map((m) => (
                <SelectItem key={m} value={m}>
                  {OPERATING_MODE_CONFIGS[m].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">{config.description}</p>
        <ul className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
          {(
            [
              ["Production", config.features.productionView === "daily-queue" ? "Today's queue" : "Weekly batch"],
              ["Quick POS", config.features.quickPOS ? "Enabled" : "Off"],
              ["Weekly menu", config.features.weeklyMenu ? "Yes" : "No"],
              ["Same-day orders", config.features.sameDayOrders ? "Yes" : "No"],
            ] as const
          ).map(([label, value]) => (
            <li
              key={label}
              className={cn("rounded-lg border border-border/60 bg-muted/30 px-2 py-1.5")}
            >
              <span className="font-medium text-foreground">{label}:</span> {value}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
