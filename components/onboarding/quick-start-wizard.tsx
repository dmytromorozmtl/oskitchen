"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { applyQuickStartAction, skipQuickStartAction } from "@/actions/quick-start";
import { getActionError, isActionSuccess } from "@/lib/action-result";
import {
  QUICK_START_CHANNEL_OPTIONS,
  QUICK_START_RESTAURANT_OPTIONS,
  type QuickStartChannel,
  type QuickStartMenuItemInput,
  type QuickStartRestaurantType,
} from "@/lib/onboarding/quick-start-types";
import { getMenuTemplate } from "@/services/onboarding/menu-templates";
import { invokeServerAction } from "@/lib/server-actions/invoke-server-action";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WizardStepActions,
  WizardStepChoiceGrid,
  WizardStepChoiceList,
  WizardStepField,
  WizardStepFieldGrid,
  WizardStepHeading,
  WizardStepIntro,
  WizardStepProgressHeader,
  WizardStepRoot,
  WizardStepSection,
} from "@/components/ui/wizard-step-form";
import { appIconMdClass, appIconXsClass } from "@/lib/design/icon-system";
import {
  wizardStepChoiceCardClass,
  wizardStepChoiceCardSelectedClass,
  wizardStepChoiceRowSelectedClass,
  wizardStepDescriptionClass,
} from "@/lib/design/form-patterns-wizard-steps";
import { cn } from "@/lib/utils";

const STEPS = ["type", "channels", "menu"] as const;
type StepId = (typeof STEPS)[number];

const DEFAULT_ITEM: QuickStartMenuItemInput = {
  name: "Chicken Bowl",
  price: 12,
  category: "MAINS",
};

export function QuickStartWizard() {
  const router = useRouter();
  const [step, setStep] = React.useState<StepId>("type");
  const [pending, startTransition] = React.useTransition();
  const [restaurantType, setRestaurantType] =
    React.useState<QuickStartRestaurantType>("full_service");
  const [channels, setChannels] = React.useState<QuickStartChannel[]>(["pos"]);
  const [businessName, setBusinessName] = React.useState("");
  const [items, setItems] = React.useState<QuickStartMenuItemInput[]>([{ ...DEFAULT_ITEM }]);

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;
  const template = getMenuTemplate(restaurantType);

  function toggleChannel(id: QuickStartChannel) {
    setChannels((prev) => {
      if (id === "all") return ["all"];
      const withoutAll = prev.filter((c) => c !== "all");
      if (withoutAll.includes(id)) {
        const next = withoutAll.filter((c) => c !== id);
        return next.length ? next : ["pos"];
      }
      return [...withoutAll, id];
    });
  }

  function updateItem(index: number, patch: Partial<QuickStartMenuItemInput>) {
    setItems((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addItem() {
    setItems((rows) => [...rows, { name: "", price: 10, category: "MAINS" }]);
  }

  function removeItem(index: number) {
    setItems((rows) => (rows.length <= 1 ? rows : rows.filter((_, i) => i !== index)));
  }

  function goBack() {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]!);
  }

  function goNext() {
    const i = STEPS.indexOf(step);
    if (step === "channels" && channels.length === 0) {
      toast.error("Pick at least one order channel.");
      return;
    }
    if (step === "menu") {
      const valid = items.filter((it) => it.name.trim() && it.price > 0);
      if (valid.length === 0) {
        toast.error("Add at least one menu item with a name and price.");
        return;
      }
      startTransition(async () => {
        const res = await invokeServerAction(() =>
          applyQuickStartAction({
            restaurantType,
            channels,
            businessName: businessName.trim() || undefined,
            items: valid.map((it) => ({
              ...it,
              name: it.name.trim(),
              category: it.category.trim().toUpperCase() || "OTHER",
            })),
          }),
        );
        if (!isActionSuccess<{ nextUrl: string; menuId: string; productCount: number }>(res)) {
          toast.error(getActionError(res) ?? "Setup failed");
          return;
        }
        toast.success(
          `Setup complete — ${res.data.productCount} menu items ready. Take your first order!`,
        );
        router.push(res.data.nextUrl);
        router.refresh();
      });
      return;
    }
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]!);
  }

  function handleSkip() {
    startTransition(async () => {
      const res = await invokeServerAction(() => skipQuickStartAction());
      const err = getActionError(res);
      if (err) toast.error(err);
      else {
        router.push("/dashboard/today");
        router.refresh();
      }
    });
  }

  return (
    <WizardStepRoot>
      <WizardStepIntro>
        <p className="text-sm font-medium text-primary">Quick Start</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          First order in about 15 minutes
        </h1>
        <p className="text-muted-foreground">
          Three steps — we pre-load your menu, turn on the right modules, and open the POS when
          you are ready.
        </p>
        <WizardStepProgressHeader>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Step {stepIndex + 1} of {STEPS.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </WizardStepProgressHeader>
      </WizardStepIntro>

      {step === "type" ? (
        <WizardStepSection>
          <WizardStepHeading>What type of restaurant?</WizardStepHeading>
          <WizardStepChoiceGrid>
            {QUICK_START_RESTAURANT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRestaurantType(opt.id)}
                className={cn(
                  wizardStepChoiceCardClass,
                  restaurantType === opt.id && wizardStepChoiceCardSelectedClass,
                )}
              >
                <span className="text-2xl" aria-hidden>
                  {opt.icon}
                </span>
                <p className="mt-2 font-medium">{opt.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{opt.description}</p>
              </button>
            ))}
          </WizardStepChoiceGrid>
          <WizardStepField>
            <Label htmlFor="businessName">Business name (optional)</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={template.title}
              className="rounded-full"
            />
          </WizardStepField>
        </WizardStepSection>
      ) : null}

      {step === "channels" ? (
        <WizardStepSection>
          <WizardStepHeading>How do you take orders?</WizardStepHeading>
          <WizardStepChoiceList>
            {QUICK_START_CHANNEL_OPTIONS.map((opt) => {
              const selected = channels.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleChannel(opt.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors border-border hover:border-primary/40",
                    selected && wizardStepChoiceRowSelectedClass,
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      selected ? "border-primary bg-primary text-primary-foreground" : "",
                    )}
                  >
                    {selected ? <Check className={appIconXsClass} /> : null}
                  </span>
                  <span>
                    <span className="font-medium">{opt.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {opt.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </WizardStepChoiceList>
        </WizardStepSection>
      ) : null}

      {step === "menu" ? (
        <WizardStepSection>
          <WizardStepHeading>What&apos;s your first menu item?</WizardStepHeading>
          <p className={wizardStepDescriptionClass}>
            We also add {template.items.length} starter items from the {template.title} template.
            Edit or remove them later in Menu items.
          </p>
          <div className="space-y-3">
            {items.map((item, index) => (
              <Card key={index} className="space-y-3 border-border/80 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Item {index + 1}</span>
                  {items.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => removeItem(index)}
                      aria-label="Remove item"
                    >
                      <Trash2 className={appIconMdClass} />
                    </Button>
                  ) : null}
                </div>
                <WizardStepFieldGrid>
                  <WizardStepField className="sm:col-span-2">
                    <Label>Name</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(index, { name: e.target.value })}
                      placeholder="Chicken Bowl"
                    />
                  </WizardStepField>
                  <WizardStepField>
                    <Label>Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(index, { price: Number(e.target.value) || 0 })
                      }
                    />
                  </WizardStepField>
                  <WizardStepField>
                    <Label>Category</Label>
                    <Select
                      value={item.category}
                      onValueChange={(v) => updateItem(index, { category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {template.categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </WizardStepField>
                </WizardStepFieldGrid>
              </Card>
            ))}
          </div>
          <Button type="button" variant="outline" className="rounded-full" onClick={addItem}>
            <Plus className={cn("mr-2", appIconMdClass)} />
            Add another
          </Button>
        </WizardStepSection>
      ) : null}

      <WizardStepActions>
        <div className="flex gap-2">
          {stepIndex > 0 ? (
            <Button type="button" variant="outline" className="rounded-full" onClick={goBack}>
              <ArrowLeft className={cn("mr-2", appIconMdClass)} />
              Back
            </Button>
          ) : (
            <Button type="button" variant="ghost" className="rounded-full" asChild>
              <Link href="/onboarding">Full setup wizard</Link>
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            className="rounded-full text-muted-foreground"
            disabled={pending}
            onClick={handleSkip}
          >
            Skip for now
          </Button>
        </div>
        <Button
          type="button"
          className="rounded-full"
          disabled={pending}
          onClick={goNext}
        >
          {pending ? (
            <Loader2 className={cn("mr-2 animate-spin", appIconMdClass)} />
          ) : step === "menu" ? null : (
            <ArrowRight className={cn("mr-2", appIconMdClass)} />
          )}
          {step === "menu" ? (pending ? "Setting up…" : "Finish setup") : "Continue"}
        </Button>
      </WizardStepActions>
    </WizardStepRoot>
  );
}
