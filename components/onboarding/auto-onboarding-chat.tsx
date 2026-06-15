"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  applyAutoOnboardingPlanAction,
  generateAutoOnboardingPlanAction,
} from "@/actions/auto-onboarding";
import { getActionError } from "@/lib/action-result";
import type {
  AutoOnboardingAnswers,
  AutoOnboardingPlan,
} from "@/lib/onboarding/auto-onboarding-types";
import { AUTO_ONBOARDING_QUESTIONS } from "@/lib/onboarding/auto-onboarding-types";
import { ONBOARDING_MENU_TEMPLATE_OPTIONS } from "@/lib/onboarding/quick-start-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type StepId = "cuisine" | "seats" | "delivery" | "aov" | "special" | "review";

const STEPS: StepId[] = ["cuisine", "seats", "delivery", "aov", "special", "review"];

export function AutoOnboardingChat() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<AutoOnboardingPlan | null>(null);
  const [answers, setAnswers] = useState<Partial<AutoOnboardingAnswers>>({
    seatCount: 40,
    delivers: true,
    averageOrderValue: 22,
    specialRequirements: "",
    businessName: "",
  });

  const step = STEPS[stepIndex] ?? "review";
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  const question = useMemo(() => {
    if (step === "review") return "Review your AI-assisted setup plan";
    const q = AUTO_ONBOARDING_QUESTIONS[stepIndex];
    return q?.prompt ?? "";
  }, [step, stepIndex]);

  function next() {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function back() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function onGeneratePlan() {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("cuisine", answers.cuisine ?? "qsr");
      fd.set("seatCount", String(answers.seatCount ?? 0));
      fd.set("delivers", String(answers.delivers ?? false));
      fd.set("averageOrderValue", String(answers.averageOrderValue ?? 0));
      fd.set("specialRequirements", answers.specialRequirements ?? "");
      fd.set("businessName", answers.businessName ?? "");

      const res = await generateAutoOnboardingPlanAction(fd);
      const err = getActionError(res);
      if (err) {
        setError(err);
        return;
      }
      if ("data" in res && res.data) {
        setPlan(res.data.plan);
        setAnswers(res.data.answers);
        setStepIndex(STEPS.indexOf("review"));
      }
    });
  }

  function onApply() {
    if (!plan || !answers.cuisine) return;
    setError(null);
    startTransition(async () => {
      const res = await applyAutoOnboardingPlanAction({
        answers: {
          cuisine: answers.cuisine!,
          seatCount: answers.seatCount ?? 0,
          delivers: answers.delivers ?? false,
          averageOrderValue: answers.averageOrderValue ?? 0,
          specialRequirements: answers.specialRequirements,
          businessName: answers.businessName,
        },
        plan,
      });
      const err = getActionError(res);
      if (err) {
        setError(err);
        return;
      }
      if ("data" in res && res.data?.nextUrl) {
        router.push(res.data.nextUrl);
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-12">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Automated onboarding · {progress}% complete
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">AI setup assistant</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Five questions → menu, KDS, modules, tax, and supplier suggestions.{" "}
          <span className="font-medium">AI-assisted</span> — you confirm before anything
          applies.
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{question}</CardTitle>
          {step !== "review" ? (
            <CardDescription>Question {stepIndex + 1} of 5</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "cuisine" ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ONBOARDING_MENU_TEMPLATE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={cn(
                    "rounded-xl border p-3 text-left text-sm transition",
                    answers.cuisine === opt.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50",
                  )}
                  onClick={() => setAnswers((a) => ({ ...a, cuisine: opt.id }))}
                >
                  <span className="text-xl">{opt.icon}</span>
                  <p className="mt-1 font-medium">{opt.label}</p>
                </button>
              ))}
            </div>
          ) : null}

          {step === "seats" ? (
            <div className="space-y-2">
              <Label htmlFor="seats">Seat count</Label>
              <Input
                id="seats"
                type="number"
                min={0}
                value={answers.seatCount ?? 0}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, seatCount: Number(e.target.value) || 0 }))
                }
              />
            </div>
          ) : null}

          {step === "delivery" ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant={answers.delivers ? "default" : "outline"}
                className="flex-1 rounded-full"
                onClick={() => setAnswers((a) => ({ ...a, delivers: true }))}
              >
                Yes — delivery / takeout
              </Button>
              <Button
                type="button"
                variant={!answers.delivers ? "default" : "outline"}
                className="flex-1 rounded-full"
                onClick={() => setAnswers((a) => ({ ...a, delivers: false }))}
              >
                Dine-in focus
              </Button>
            </div>
          ) : null}

          {step === "aov" ? (
            <div className="space-y-2">
              <Label htmlFor="aov">Average order value (USD)</Label>
              <Input
                id="aov"
                type="number"
                min={0}
                step="0.01"
                value={answers.averageOrderValue ?? 0}
                onChange={(e) =>
                  setAnswers((a) => ({
                    ...a,
                    averageOrderValue: Number(e.target.value) || 0,
                  }))
                }
              />
            </div>
          ) : null}

          {step === "special" ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="businessName">Restaurant name (optional)</Label>
                <Input
                  id="businessName"
                  value={answers.businessName ?? ""}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, businessName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="special">Special requirements</Label>
                <Input
                  id="special"
                  placeholder="Gluten-free focus, full bar, catering only…"
                  value={answers.specialRequirements ?? ""}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, specialRequirements: e.target.value }))
                  }
                />
              </div>
            </div>
          ) : null}

          {step === "review" && plan ? (
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge>{plan.honestyLabel}</Badge>
                <Badge variant="secondary">
                  Confidence {plan.confidenceScore}%
                </Badge>
              </div>
              <p>{plan.summary}</p>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {plan.setupSteps.map((s) => (
                  <li key={s.id}>{s.label}</li>
                ))}
              </ul>
              {plan.suggestedVendors.length > 0 ? (
                <p className="text-muted-foreground">
                  Suggested suppliers:{" "}
                  {plan.suggestedVendors.map((v) => v.name).join(", ")}
                </p>
              ) : null}
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex flex-wrap gap-2 pt-2">
            {stepIndex > 0 && step !== "review" ? (
              <Button type="button" variant="outline" className="rounded-full" onClick={back}>
                Back
              </Button>
            ) : null}
            {step !== "review" ? (
              <Button
                type="button"
                className="rounded-full"
                disabled={!answers.cuisine && step === "cuisine"}
                onClick={() => {
                  if (stepIndex >= STEPS.length - 2) {
                    onGeneratePlan();
                  } else {
                    next();
                  }
                }}
              >
                {stepIndex >= STEPS.length - 2 ? "Generate plan" : "Continue"}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  disabled={pending}
                  onClick={onGeneratePlan}
                >
                  Regenerate
                </Button>
                <Button
                  type="button"
                  className="rounded-full"
                  disabled={pending}
                  onClick={onApply}
                >
                  {pending ? "Applying…" : "Confirm & apply setup"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
