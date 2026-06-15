"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { submitBetaApplication } from "@/actions/beta";
import { ALL_BUSINESS_TYPES_ORDERED, BUSINESS_TYPE_LABELS } from "@/lib/business-modes";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const LS_DRAFT = "kos_beta_form_draft_v1";

const CHANNELS: { slug: string; label: string }[] = [
  { slug: "manual", label: "Manual / inbox" },
  { slug: "woocommerce", label: "WooCommerce" },
  { slug: "shopify", label: "Shopify" },
  { slug: "uber_eats", label: "Uber Eats" },
  { slug: "doordash", label: "DoorDash" },
  { slug: "square", label: "Square" },
  { slug: "toast", label: "Toast" },
  { slug: "other", label: "Other" },
];

export function BetaLeadForm({
  initialUtm,
}: {
  initialUtm?: { source?: string; medium?: string; campaign?: string };
} = {}) {
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [step, setStep] = React.useState("basics");
  const [businessType, setBusinessType] = React.useState<string>(ALL_BUSINESS_TYPES_ORDERED[0]!);
  const [channels, setChannels] = React.useState<Set<string>>(() => new Set(["manual"]));
  const [onboardingUrgency, setOnboardingUrgency] = React.useState("flexible");

  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_DRAFT);
      if (!raw || !formRef.current) return;
      const d = JSON.parse(raw) as Record<string, string>;
      const fd = formRef.current;
      for (const [k, v] of Object.entries(d)) {
        const el = fd.querySelector(`[name="${CSS.escape(k)}"]`);
        if (
          el instanceof HTMLInputElement ||
          el instanceof HTMLTextAreaElement ||
          el instanceof HTMLSelectElement
        ) {
          el.value = v;
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persistDraft = React.useCallback(() => {
    const fd = formRef.current;
    if (!fd) return;
    try {
      const data: Record<string, string> = {};
      const formData = new FormData(fd);
      for (const [k, v] of formData.entries()) {
        if (typeof v === "string" && v.trim()) data[k] = v;
      }
      localStorage.setItem(LS_DRAFT, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    const id = window.setInterval(persistDraft, 12_000);
    return () => window.clearInterval(id);
  }, [persistDraft]);

  const toggleChannel = (slug: string, checked: boolean) => {
    setChannels((prev) => {
      const next = new Set(prev);
      if (checked) next.add(slug);
      else next.delete(slug);
      if (next.size === 0) next.add("manual");
      return next;
    });
  };

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
        <p className="font-medium text-emerald-800 dark:text-emerald-200">Application received</p>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll review your operation and reply within a few business days. Founder notifications use
          Resend when configured — otherwise submissions are stored securely for the beta command center.
        </p>
        <Button type="button" variant="outline" className="mt-4 rounded-full" asChild>
          <Link href="/demo">Try the interactive demo</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="relative space-y-6"
      action={(fd) =>
        void (async () => {
          setPending(true);
          fd.set("businessType", businessType);
          for (const c of channels) {
            fd.append("channels", c);
          }
          const res = await submitBetaApplication(fd);
          setPending(false);
          const _err = getActionError(res); if (_err) toast.error(_err);
          else {
            try {
              localStorage.removeItem(LS_DRAFT);
            } catch {
              /* ignore */
            }
            toast.success("Thanks — application saved.");
            setDone(true);
          }
        })()
      }
    >
      <input type="hidden" name="source" value="beta_page" />
      <input type="hidden" name="utmSource" value={initialUtm?.source ?? ""} />
      <input type="hidden" name="utmMedium" value={initialUtm?.medium ?? ""} />
      <input type="hidden" name="utmCampaign" value={initialUtm?.campaign ?? ""} />
      <input type="hidden" name="onboardingUrgency" value={onboardingUrgency} />

      <div className="pointer-events-none absolute left-[-9999px] top-0 h-px w-px overflow-hidden opacity-0">
        <Label htmlFor="website_hp">Leave blank</Label>
        <Input id="website_hp" name="website_hp" tabIndex={-1} autoComplete="off" />
      </div>

      <Tabs value={step} onValueChange={setStep} className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-muted/60 p-1">
          <TabsTrigger className="rounded-lg text-xs sm:text-sm" value="basics">
            Basics
          </TabsTrigger>
          <TabsTrigger className="rounded-lg text-xs sm:text-sm" value="operations">
            Operations
          </TabsTrigger>
          <TabsTrigger className="rounded-lg text-xs sm:text-sm" value="integrations">
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" required placeholder="Alex Rivera" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" name="email" type="email" required placeholder="you@brand.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+1 …" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="businessName">Company name</Label>
              <Input id="businessName" name="businessName" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="businessWebsite">Website or storefront URL</Label>
              <Input id="businessWebsite" name="businessWebsite" placeholder="https://…" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Business type</Label>
            <Select value={businessType} onValueChange={setBusinessType}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_BUSINESS_TYPES_ORDERED.map((t) => (
                  <SelectItem key={t} value={t}>
                    {BUSINESS_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country / region</Label>
              <Input id="country" name="country" placeholder="US, CA, DE…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" name="timezone" placeholder="America/Chicago" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="languages">Languages spoken by ops team</Label>
              <Input id="languages" name="languages" placeholder="English, French…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referralSource">How did you hear about us?</Label>
              <Input
                id="referralSource"
                name="referralSource"
                placeholder="Podcast, operator referral, LinkedIn…"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="mt-6 space-y-6">
          <div className="space-y-3">
            <Label>Current order channels</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {CHANNELS.map((ch) => (
                <label
                  key={ch.slug}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/80 px-3 py-2 text-sm"
                >
                  <Checkbox
                    checked={channels.has(ch.slug)}
                    onCheckedChange={(v) => toggleChannel(ch.slug, Boolean(v))}
                  />
                  {ch.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="locationsCount">Locations in operation</Label>
              <Input
                id="locationsCount"
                name="locationsCount"
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="e.g. 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamSize">Kitchen + ops headcount (approx)</Label>
              <Input
                id="teamSize"
                name="teamSize"
                type="number"
                min={0}
                inputMode="numeric"
                placeholder="e.g. 8"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="weeklyOrderVolume">Weekly order volume (rough)</Label>
              <Input
                id="weeklyOrderVolume"
                name="weeklyOrderVolume"
                placeholder="e.g. 80–150 weekly orders"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="biggestPain">Biggest operational pain today</Label>
            <Textarea
              id="biggestPain"
              name="biggestPain"
              rows={4}
              placeholder="Cutoffs, packing mistakes, channel sprawl…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestedFeatures">
              Features you&apos;re most interested in (comma-separated)
            </Label>
            <Textarea
              id="interestedFeatures"
              name="interestedFeatures"
              rows={3}
              placeholder="Order hub, WooCommerce sync, production board, packing labels…"
            />
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="integrationsNeeded">Integrations or data sources you need on day one</Label>
            <Textarea
              id="integrationsNeeded"
              name="integrationsNeeded"
              rows={3}
              placeholder="Shopify draft orders, Uber Eats tablet export, custom CSV…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onboardingUrgency">Onboarding urgency</Label>
            <Select value={onboardingUrgency} onValueChange={setOnboardingUrgency}>
              <SelectTrigger id="onboardingUrgency" className="rounded-xl">
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flexible">Flexible — evaluating Q+</SelectItem>
                <SelectItem value="this_quarter">This quarter</SelectItem>
                <SelectItem value="this_month">This month</SelectItem>
                <SelectItem value="asap">ASAP / live issue</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Urgency never affects spam filtering — it only helps founders prioritize sequencing.
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="consent"
              value="on"
              required
              className="mt-1 h-4 w-4 rounded border-input"
            />
            <span className="text-muted-foreground">
              I agree to be contacted about the OS Kitchen beta and understand my details are stored for founder
              outreach only.
            </span>
          </label>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => persistDraft()}
            >
              Save draft locally
            </Button>
            <Button type="submit" className="rounded-full sm:ml-auto" variant="premium" disabled={pending}>
              {pending ? "Sending…" : "Submit application"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground">
        Honeypot + duplicate detection + rate limits run server-side. Configure{" "}
        <code className="rounded bg-muted px-1">GROWTH_NOTIFY_EMAIL</code> for founder alerts via Resend.
      </p>
    </form>
  );
}
