"use client";

import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { captureProductEvent } from "@/lib/analytics/product-events";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "kitchenos_operator_tour_v1";

type TourStep = {
  id: number;
  title: string;
  body: string;
  target: string;
  ctaHref?: string;
  ctaLabel?: string;
};

const STEPS: TourStep[] = [
  {
    id: 1,
    title: "Add your first menu",
    body: "Menus drive production, POS, and your storefront. Start with a weekly or always-on menu.",
    target: '[data-tour="nav-menus"]',
    ctaHref: "/dashboard/menus/new",
    ctaLabel: "Create menu",
  },
  {
    id: 2,
    title: "Set up POS",
    body: "Configure terminals and test a ticket before service. Touch targets are optimized for kitchen gloves.",
    target: '[data-tour="nav-pos"]',
    ctaHref: "/dashboard/pos/settings",
    ctaLabel: "POS settings",
  },
  {
    id: 3,
    title: "Connect storefront",
    body: "Publish branded online ordering — same catalog as production and KDS.",
    target: '[data-tour="nav-storefront"]',
    ctaHref: "/dashboard/storefront",
    ctaLabel: "Open storefront",
  },
  {
    id: 4,
    title: "Open KDS",
    body: "Kitchen display shows live tickets with overdue alerts and sound cues.",
    target: '[data-tour="nav-kitchen"]',
    ctaHref: "/dashboard/kitchen",
    ctaLabel: "Open KDS",
  },
  {
    id: 5,
    title: "Create a test order",
    body: "Run one order end-to-end: menu → payment → KDS → packed. Use demo data if you prefer.",
    target: '[data-tour="today-orders"]',
    ctaHref: "/dashboard/orders/new",
    ctaLabel: "New order",
  },
];

function readCompleted(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { completedSteps?: number[] };
    return Array.isArray(parsed.completedSteps) ? parsed.completedSteps : [];
  } catch {
    return [];
  }
}

function writeCompleted(steps: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedSteps: steps }));
}

export function OperatorTourLauncher() {
  const [open, setOpen] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [completed, setCompleted] = React.useState<number[]>([]);

  React.useEffect(() => {
    const done = readCompleted();
    setCompleted(done);
    if (done.length >= STEPS.length) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("tour") === "1" || done.length === 0) {
      setOpen(true);
      setStepIndex(done.length > 0 ? done.length : 0);
    }
  }, []);

  const step = STEPS[stepIndex];
  const rect = useSpotlightRect(open ? step?.target : undefined);

  const finishStep = () => {
    if (!step) return;
    const next = Array.from(new Set([...completed, step.id]));
    setCompleted(next);
    writeCompleted(next);
    captureProductEvent("onboarding_step_completed", { step: String(step.id), vertical: "tour" });
    if (stepIndex >= STEPS.length - 1) {
      setOpen(false);
      return;
    }
    setStepIndex(stepIndex + 1);
  };

  const skipTour = () => {
    writeCompleted(STEPS.map((s) => s.id));
    setCompleted(STEPS.map((s) => s.id));
    setOpen(false);
  };

  if (!open || !step) return null;

  return (
    <>
      <div className="fixed inset-0 z-tour bg-black/50" aria-hidden onClick={skipTour} />
      {rect ? (
        <div
          className="pointer-events-none fixed z-tour-highlight rounded-lg ring-4 ring-primary ring-offset-2 ring-offset-background transition-all"
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
          }}
        />
      ) : null}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="operator-tour-title"
        className="fixed bottom-6 left-1/2 z-tour-card w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border bg-card p-5 shadow-xl"
      >
        <p className="text-xs font-medium text-muted-foreground">
          Step {stepIndex + 1} of {STEPS.length}
        </p>
        <h2 id="operator-tour-title" className="mt-1 text-lg font-semibold">
          {step.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={finishStep} className="rounded-full">
            {stepIndex < STEPS.length - 1 ? "Next" : "Finish"}
          </Button>
          {step.ctaHref ? (
            <Button asChild variant="outline" className="rounded-full">
              <Link href={step.ctaHref}>{step.ctaLabel ?? "Open"}</Link>
            </Button>
          ) : null}
          <Button type="button" variant="ghost" className="rounded-full" onClick={skipTour}>
            Skip tour
          </Button>
        </div>
      </div>
    </>
  );
}

function useSpotlightRect(selector?: string) {
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  React.useEffect(() => {
    if (!selector) {
      setRect(null);
      return;
    }
    const update = () => {
      const el = document.querySelector(selector);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [selector]);

  return rect;
}

/** Call from settings → Help to restart the guided tour. */
export function restartOperatorTour() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = "/dashboard/today?tour=1";
}

export function OperatorTourRestartButton({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn("rounded-full", className)}
      onClick={() => restartOperatorTour()}
    >
      Restart guided tour
    </Button>
  );
}
