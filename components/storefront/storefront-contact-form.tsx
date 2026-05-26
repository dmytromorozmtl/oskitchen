"use client";

import { getActionError } from "@/lib/action-result";

import * as React from "react";
import { toast } from "sonner";

import { submitStorefrontContact } from "@/actions/storefront-contact";
import { TurnstileWidget } from "@/components/storefront/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function StorefrontContactForm({
  storeSlug,
  type,
  title,
  turnstileSiteKey = null,
}: {
  storeSlug: string;
  type: "CONTACT" | "CATERING";
  title?: string;
  turnstileSiteKey?: string | null;
}) {
  const [pending, setPending] = React.useState(false);
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (turnstileSiteKey && !captchaToken) {
      toast.error("Complete the security check before submitting.");
      return;
    }
    setPending(true);
    const res = await submitStorefrontContact({
      storeSlug,
      type,
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? "") || undefined,
      message: String(fd.get("message") ?? ""),
      company: String(fd.get("company") ?? "") || undefined,
      eventDate: String(fd.get("eventDate") ?? "") || undefined,
      guestCount: String(fd.get("guestCount") ?? "") || undefined,
      budget: String(fd.get("budget") ?? "") || undefined,
      companyUrl: String(fd.get("companyUrl") ?? ""),
      captchaToken: captchaToken ?? undefined,
    });
    setPending(false);
    if ("error" in res && res.error) {
      toast.error(getActionError(res) ?? "Something went wrong");
      return;
    }
    toast.success("Message sent — thank you!");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <form onSubmit={(ev) => void onSubmit(ev)} className="space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
      {title ? <p className="font-medium">{title}</p> : null}
      <input type="text" name="companyUrl" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" className="rounded-xl" />
        </div>
        {type === "CATERING" ? (
          <>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="company">Company / host</Label>
              <Input id="company" name="company" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event date</Label>
              <Input id="eventDate" name="eventDate" type="date" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestCount">Guest count</Label>
              <Input id="guestCount" name="guestCount" className="rounded-xl" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="budget">Budget range</Label>
              <Input id="budget" name="budget" placeholder="e.g. $2–3k" className="rounded-xl" />
            </div>
          </>
        ) : null}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" name="message" required rows={5} className="rounded-xl" />
        </div>
      </div>
      {turnstileSiteKey ? <TurnstileWidget siteKey={turnstileSiteKey} onToken={setCaptchaToken} /> : null}
      <Button type="submit" className="rounded-full" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
