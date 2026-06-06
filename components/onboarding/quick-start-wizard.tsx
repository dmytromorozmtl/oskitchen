"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Loader2,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  applyQuickStartAction,
  finishQuickStartAction,
  skipQuickStartAction,
} from "@/actions/quick-start";
import { fireCelebrationConfetti } from "@/components/ui/celebration-confetti";
import { getActionError, isActionSuccess } from "@/lib/action-result";
import {
  QUICK_START_RESTAURANT_OPTIONS,
  type QuickStartMenuItemInput,
  type QuickStartRestaurantType,
} from "@/lib/onboarding/quick-start-types";
import { getMenuTemplate } from "@/services/onboarding/menu-templates";
import { invokeServerAction } from "@/lib/server-actions/invoke-server-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  WizardStepField,
  WizardStepFieldGrid,
  WizardStepHeading,
  WizardStepIntro,
  WizardStepProgressHeader,
  WizardStepRoot,
  WizardStepSection,
} from "@/components/ui/wizard-step-form";
import { appIconMdClass } from "@/lib/design/icon-system";
import {
  wizardStepChoiceCardClass,
  wizardStepChoiceCardSelectedClass,
  wizardStepChoiceGridClass,
  wizardStepDescriptionClass,
  wizardStepFormClass,
} from "@/lib/design/form-patterns-wizard-steps";
import { cn, formatCurrency } from "@/lib/utils";

const STEPS = ["profile", "menu", "order"] as const;
type StepId = (typeof STEPS)[number];
const TARGET_MINUTES = 15;

const DEFAULT_ITEM: QuickStartMenuItemInput = {
  name: "Chicken Bowl",
  price: 12,
  category: "MAINS",
};

type Props = {
  initialStep?: StepId;
};

function useQuickStartTimer() {
  const [minutesLeft, setMinutesLeft] = React.useState(TARGET_MINUTES);

  React.useEffect(() => {
    const started = Date.now();
    const tick = () => {
      const elapsedMin = (Date.now() - started) / 60_000;
      setMinutesLeft(Math.max(0, Math.ceil(TARGET_MINUTES - elapsedMin)));
    };
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);

  return minutesLeft;
}

export function QuickStartWizard({ initialStep }: Props) {
  const router = useRouter();
  const minutesLeft = useQuickStartTimer();
  const [step, setStep] = React.useState<StepId>(initialStep ?? "profile");
  const [pending, startTransition] = React.useTransition();
  const [restaurantType, setRestaurantType] =
    React.useState<QuickStartRestaurantType>("full_service");
  const [businessName, setBusinessName] = React.useState("");
  const [items, setItems] = React.useState<QuickStartMenuItemInput[]>([{ ...DEFAULT_ITEM }]);
  const [productCount, setProductCount] = React.useState<number | null>(null);

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;
  const template = getMenuTemplate(restaurantType);

  const previewItems = React.useMemo(() => {
    const custom = items.filter((it) => it.name.trim() && it.price > 0);
    const templatePreview = template.items.slice(0, 15).map((it) => ({
      name: it.name,
      price: it.price,
      source: "template" as const,
    }));
    const customPreview = custom.map((it) => ({
      name: it.name.trim(),
      price: it.price,
      source: "custom" as const,
    }));
    return [...customPreview, ...templatePreview].slice(0, 18);
  }, [items, template.items]);

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

  function applyAndGoToOrder(customItems: QuickStartMenuItemInput[]) {
    startTransition(async () => {
      const res = await invokeServerAction(() =>
        applyQuickStartAction({
          restaurantType,
          businessName: businessName.trim(),
          items: customItems,
        }),
      );
      if (!isActionSuccess(res)) {
        toast.error(getActionError(res) ?? "Setup failed");
        return;
      }
      setProductCount(res.data.productCount);
      toast.success(`${res.data.productCount} menu items ready — open POS to take your first order.`);
      setStep("order");
      router.replace("/dashboard/quick-start?phase=order");
    });
  }

  function goNext() {
    if (step === "profile") {
      if (!businessName.trim()) {
        toast.error("Enter your restaurant name to continue.");
        return;
      }
      setStep("menu");
      return;
    }

    if (step === "menu") {
      const valid = items.filter((it) => it.name.trim() && it.price > 0);
      applyAndGoToOrder(
        valid.map((it) => ({
          ...it,
          name: it.name.trim(),
          category: it.category.trim().toUpperCase() || "OTHER",
        })),
      );
    }
  }

  function skipMenuItems() {
    applyAndGoToOrder([]);
  }

  function openPosTerminal() {
    startTransition(async () => {
      const res = await invokeServerAction(() =>
        finishQuickStartAction({
          restaurantType,
          businessName: businessName.trim(),
        }),
      );
      if (!isActionSuccess(res)) {
        toast.error(getActionError(res) ?? "Could not finish setup");
        return;
      }
      fireCelebrationConfetti();
      router.push(res.data.redirectTo);
      router.refresh();
    });
  }

  function handleSkipAll() {
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
    <WizardStepRoot data-testid="quick-start-wizard">
      <WizardStepIntro>
        <p className="text-sm font-medium text-primary">Quick Start</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          First order in about 15 minutes
        </h1>
        <p className="text-muted-foreground">
          Three steps — name your kitchen, seed your menu, ring up your first sale. No vault keys or
          integrations required.
        </p>
        <div
          className="flex items-center gap-2 text-sm text-muted-foreground"
          data-testid="quick-start-timer"
        >
          <Clock className="h-4 w-4" aria-hidden />
          <span>
            {minutesLeft > 0
              ? `${minutesLeft} minute${minutesLeft === 1 ? "" : "s"} to first order`
              : "Ready for your first order"}
          </span>
        </div>
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

      {step === "profile" ? (
        <WizardStepSection>
          <WizardStepHeading>What&apos;s your restaurant called?</WizardStepHeading>
          <WizardStepField>
            <Label htmlFor="businessName">Restaurant name</Label>
            <Input
              id="businessName"
              data-testid="quick-start-business-name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Sunrise Diner"
              className="rounded-full text-base h-11"
            />
          </WizardStepField>
          <p className={wizardStepDescriptionClass}>Pick a cuisine — we pre-load a starter menu.</p>
          <div className={cn(wizardStepChoiceGridClass, "lg:grid-cols-3")}>
            {QUICK_START_RESTAURANT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                data-testid={`quick-start-cuisine-${opt.id}`}
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
          </div>
        </WizardStepSection>
      ) : null}

      {step === "menu" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <WizardStepSection>
            <WizardStepHeading>Add your first menu item</WizardStepHeading>
            <p className={wizardStepDescriptionClass}>
              Optional — we also add {template.items.length} items from the {template.title}{" "}
              template.
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
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="rounded-full" onClick={addItem}>
                <Plus className={cn("mr-2", appIconMdClass)} />
                Add another
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="rounded-full text-muted-foreground"
                disabled={pending}
                onClick={skipMenuItems}
              >
                Skip for now
              </Button>
            </div>
          </WizardStepSection>

          <Card className="h-fit border-primary/20 bg-muted/20" data-testid="quick-start-menu-preview">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Live menu preview</CardTitle>
            </CardHeader>
            <CardContent className="max-h-80 space-y-2 overflow-y-auto text-sm">
              {previewItems.map((item, idx) => (
                <div key={`${item.name}-${idx}`} className="flex justify-between gap-2 border-b py-2">
                  <span>
                    {item.name}
                    {item.source === "template" ? (
                      <span className="ml-1 text-xs text-muted-foreground">(template)</span>
                    ) : null}
                  </span>
                  <span className="tabular-nums">{formatCurrency(item.price)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {step === "order" ? (
        <WizardStepSection data-testid="quick-start-order-step">
          <WizardStepHeading>Take your first order</WizardStepHeading>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className={`${wizardStepFormClass} p-6`}>
              <div className="flex gap-3">
                <ShoppingBag className="h-8 w-8 shrink-0 text-primary" aria-hidden />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-base">POS tutorial</p>
                  <ol className="list-decimal space-y-1 pl-4 text-muted-foreground">
                    <li>Open the POS terminal below.</li>
                    <li>Tap menu items to add them to the cart.</li>
                    <li>Tap <strong>Complete sale</strong> → choose Cash → receipt prints.</li>
                    <li>Kitchen display updates automatically.</li>
                  </ol>
                  {productCount != null ? (
                    <p className="text-xs text-muted-foreground">
                      {productCount} items · 1 demo supplier · staff register ready
                    </p>
                  ) : null}
                </div>
              </div>
              <Button
                type="button"
                size="lg"
                className="h-14 w-full rounded-2xl text-base"
                data-testid="quick-start-open-pos-btn"
                disabled={pending}
                onClick={openPosTerminal}
              >
                {pending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Check className="mr-2 h-5 w-5" />
                )}
                Open POS Terminal
              </Button>
            </CardContent>
          </Card>
        </WizardStepSection>
      ) : null}

      {step !== "order" ? (
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
              onClick={handleSkipAll}
            >
              Skip for now
            </Button>
          </div>
          <Button type="button" className="rounded-full" disabled={pending} onClick={goNext}>
            {pending ? (
              <Loader2 className={cn("mr-2 animate-spin", appIconMdClass)} />
            ) : (
              <ArrowRight className={cn("mr-2", appIconMdClass)} />
            )}
            {step === "menu" ? (pending ? "Setting up…" : "Continue") : "Continue"}
          </Button>
        </WizardStepActions>
      ) : null}
    </WizardStepRoot>
  );
}
