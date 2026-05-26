"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { submitDemoRequest } from "@/actions/book-demo";
import { ALL_BUSINESS_TYPES_ORDERED, BUSINESS_TYPE_LABELS } from "@/lib/business-modes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function DemoRequestForm() {
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [businessType, setBusinessType] = React.useState<string>(ALL_BUSINESS_TYPES_ORDERED[0]!);

  if (done) {
    return (
      <div className="rounded-xl border border-primary/25 bg-primary/5 p-8 text-center">
        <p className="text-lg font-semibold">Thanks — request received</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Our team will reach out shortly to schedule your session. Prefer self-serve? Explore the
          interactive demo while you wait.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="premium" className="rounded-full" asChild>
            <Link href="/demo">Open interactive demo</Link>
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/beta">Join beta waitlist</Link>
          </Button>
        </div>
        {process.env.NEXT_PUBLIC_CALENDLY_URL ? (
          <p className="mt-6 text-xs text-muted-foreground">
            Or grab time directly:{" "}
            <a
              href={process.env.NEXT_PUBLIC_CALENDLY_URL}
              className="text-primary underline"
              target="_blank"
              rel="noreferrer"
            >
              Schedule here
            </a>
            .
          </p>
        ) : (
          <p className="mt-6 text-xs text-muted-foreground">
            Add <code className="rounded bg-muted px-1">NEXT_PUBLIC_CALENDLY_URL</code> to surface a
            self-serve scheduling link.
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      action={(fd) =>
        void (async () => {
          setPending(true);
          fd.set("businessType", businessType);
          const res = await submitDemoRequest(fd);
          setPending(false);
          const _err = getActionError(res); if (_err) toast.error(_err);
          else {
            toast.success("We’ll be in touch.");
            setDone(true);
          }
        })()
      }
    >
      <div className="pointer-events-none absolute left-[-9999px] top-0 h-px w-px overflow-hidden opacity-0">
        <Label htmlFor="company_hp">Company</Label>
        <Input id="company_hp" name="company_hp" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessName">Business name</Label>
          <Input id="businessName" name="businessName" required />
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
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" placeholder="https://…" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currentPlatform">Current platform</Label>
        <Input
          id="currentPlatform"
          name="currentPlatform"
          placeholder="WooCommerce, Shopify, pen & paper…"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="weeklyOrderVolume">Expected weekly order volume</Label>
        <Input id="weeklyOrderVolume" name="weeklyOrderVolume" placeholder="Rough range is fine" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="preferredTime">Preferred time slots</Label>
        <Input
          id="preferredTime"
          name="preferredTime"
          placeholder="Tue/Thu mornings ET, etc."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="painPoints">Pain points & goals</Label>
        <Textarea id="painPoints" name="painPoints" rows={4} />
      </div>
      <Button type="submit" variant="premium" className="rounded-full" disabled={pending}>
        {pending ? "Sending…" : "Request a demo"}
      </Button>
    </form>
  );
}
