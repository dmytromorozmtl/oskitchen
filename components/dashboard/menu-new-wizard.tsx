"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BusinessType, MenuStrategy } from "@prisma/client";
import { format } from "date-fns";

import { createMenuFromWizard } from "@/actions/menus";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  defaultMenuStrategyForBusinessType,
  isStrategyRecommendedForMode,
  MENU_STRATEGY_ORDER,
  menuStrategyDefinition,
} from "@/lib/menus/menu-strategies";
import { suggestDefaultDatesForStrategy } from "@/lib/menus/menu-availability";
import { cn } from "@/lib/utils";

const STEPS = ["Strategy", "Basics", "Review"] as const;

export function MenuNewWizard({ businessType }: { businessType: BusinessType | null }) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [strategy, setStrategy] = React.useState<MenuStrategy>(
    defaultMenuStrategyForBusinessType(businessType),
  );
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [dates, setDates] = React.useState(() => suggestDefaultDatesForStrategy(strategy));

  React.useEffect(() => {
    setDates(suggestDefaultDatesForStrategy(strategy));
  }, [strategy]);

  const def = menuStrategyDefinition(strategy);

  async function submit() {
    const def = menuStrategyDefinition(strategy);
    const fd = new FormData();
    fd.set("title", title.trim() || def.defaultTitle);
    fd.set("description", description.trim());
    fd.set("strategy", strategy);
    fd.set("startDate", format(dates.startDate, "yyyy-MM-dd"));
    fd.set("endDate", format(dates.endDate, "yyyy-MM-dd"));
    fd.set("preorderDeadline", dates.preorderDeadline.toISOString());
    const res = await createMenuFromWizard(fd);
    const _err = getActionError(res);
    if (_err) {
      window.alert(_err);
      return;
    }
    router.push("/dashboard/menus");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Link href="/dashboard/menus" className="hover:text-foreground">
            Menus
          </Link>
          <span className="mx-2">/</span>
          New
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">New menu</h1>
        <p className="mt-2 text-muted-foreground">
          Choose a strategy, confirm dates, then review. Advanced availability, storefront, and
          fulfillment steps ship next — your menu is still fully compatible with products and
          production today.
        </p>
      </div>

      <ol className="flex flex-wrap gap-2 text-sm">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={cn(
              "rounded-full border px-3 py-1",
              i === step ? "border-primary bg-primary/10" : "border-border/70 text-muted-foreground",
            )}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {MENU_STRATEGY_ORDER.map((s) => {
            const d = menuStrategyDefinition(s);
            const rec = isStrategyRecommendedForMode(s, businessType);
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStrategy(s)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-colors hover:bg-muted/50",
                  strategy === s ? "border-primary ring-2 ring-primary/30" : "border-border/80",
                )}
              >
                <p className="font-semibold">{d.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{d.description}</p>
                {rec ? (
                  <p className="mt-2 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    Recommended for your business mode
                  </p>
                ) : (
                  <p className="mt-2 text-[11px] text-muted-foreground">Advanced for your mode</p>
                )}
                {d.warnings.length ? (
                  <p className="mt-2 text-[11px] text-amber-900 dark:text-amber-200">{d.warnings[0]}</p>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {step === 1 ? (
        <Card className="space-y-4 border-border/80 p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={def.defaultTitle}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Internal notes for your team"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Start</Label>
              <Input
                type="date"
                value={format(dates.startDate, "yyyy-MM-dd")}
                onChange={(e) =>
                  setDates((d) => ({ ...d, startDate: new Date(e.target.value + "T12:00:00") }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>End</Label>
              <Input
                type="date"
                value={format(dates.endDate, "yyyy-MM-dd")}
                onChange={(e) =>
                  setDates((d) => ({ ...d, endDate: new Date(e.target.value + "T12:00:00") }))
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-3">
              <Label>Preorder deadline</Label>
              <Input
                type="datetime-local"
                value={format(dates.preorderDeadline, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) =>
                  setDates((d) => ({
                    ...d,
                    preorderDeadline: new Date(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Required fields for this strategy: {def.requiredFields.join(", ")}.
          </p>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="space-y-3 border-border/80 p-6 text-sm shadow-sm">
          <p>
            <span className="text-muted-foreground">Strategy:</span>{" "}
            <span className="font-medium">{def.label}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Title:</span>{" "}
            <span className="font-medium">{title}</span>
          </p>
          <p className="text-muted-foreground">{def.productionBehavior}</p>
          <p className="text-muted-foreground">{def.storefrontBehavior}</p>
        </Card>
      ) : null}

      <div className="flex flex-wrap justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            className="rounded-full"
            variant="premium"
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          >
            Continue
          </Button>
        ) : (
          <Button type="button" className="rounded-full" variant="premium" onClick={() => void submit()}>
            Create menu
          </Button>
        )}
      </div>
    </div>
  );
}
