"use client";

import * as React from "react";

import { TurnstileWidget } from "@/components/storefront/turnstile-widget";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { captureProductEvent } from "@/lib/analytics/product-events";
import { turnstileSiteKey } from "@/lib/storefront/turnstile";

type Props = {
  estimatedSavingsMonthly: number;
  weeklyOrders: number;
  recommendedPlan: string;
};

export function RoiLeadCapture({ estimatedSavingsMonthly, weeklyOrders, recommendedPlan }: Props) {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [businessType, setBusinessType] = React.useState("meal_prep");
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const siteKey = turnstileSiteKey();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (siteKey && !captchaToken) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/leads/roi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          businessType,
          ordersPerWeek: weeklyOrders,
          estimatedSavingsMonthly,
          captchaToken: captchaToken ?? undefined,
        }),
      });
      if (!res.ok) throw new Error("submit_failed");
      captureProductEvent("roi_lead_submitted", {
        plan: recommendedPlan,
        vertical: businessType,
      });
      setStatus("done");
      setOpen(false);
    } catch {
      setStatus("error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="premium" className="rounded-full">
          Get personal analysis
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get your personalized analysis</DialogTitle>
          <DialogDescription>
            You could save about ${Math.round(estimatedSavingsMonthly).toLocaleString()}/mo. We&apos;ll
            show how — free, no spam.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-3" onSubmit={submit}>
          <label className="text-sm font-medium">
            Work email
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="text-sm font-medium">
            Business type
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            >
              <option value="meal_prep">Meal prep</option>
              <option value="GHOST_KITCHEN">Ghost kitchen</option>
              <option value="RESTAURANT">Restaurant / café</option>
              <option value="CATERING">Catering</option>
            </select>
          </label>
          <Button type="submit" disabled={status === "loading" || (siteKey != null && !captchaToken)} className="rounded-full">
            {status === "loading" ? "Sending…" : "Send my analysis"}
          </Button>
          {siteKey ? <TurnstileWidget siteKey={siteKey} onToken={setCaptchaToken} /> : null}
          {status === "error" ? (
            <p className="text-sm text-destructive" role="status">
              Something went wrong. Try again or book a demo.
            </p>
          ) : null}
          {status === "done" ? (
            <p className="text-sm text-emerald-700" role="status">
              Thanks — we&apos;ll email you shortly.
            </p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
